# Performance optimization candidates

Date: 2026-07-06

Survey of remaining performance optimization areas after the 3.2.3 work (list pane rendering, navigation pane/calendar
rendering, startup/database initialization). Four areas were surveyed: the content generation pipeline, the storage
layer and vault event handling, navigation/tag tree derivation, and interaction latency paths.

## Recommended focus: reaction pipeline to vault changes

Rendering and startup are covered. The dominant remaining cost is what runs after every save, rename, sync burst, or tag
edit. The costs compound: a single note save currently triggers roughly double the content-generation work it needs, and
any tag change triggers a full-vault tag tree reconstruction. For sync-heavy users and large vaults this is continuous
background churn; on mobile it is battery drain and jank.

---

## Priority 1 — Steady-state edit/sync churn

### 1a. Every markdown save runs the content pipeline ~twice

**Status (2026-07-08): implemented, user tested in Obsidian.**

- Change: the modify flush (`src/context/storage/useStorageVaultSync.ts`, `flushModifiedFiles`) no longer queues content
  for markdown files; it still records mtime changes and still queues non-markdown thumbnail files. The metadata-change
  flush is now the single content trigger for markdown. Every markdown content change produces a
  `metadataCache.on('changed')` event, and it fires after Obsidian has indexed the save, so the single run always reads
  a fresh metadata cache (the old modify-path run could read a stale one).
- Rejected sub-idea: "skip `markFilesForRegeneration` when the modify path already advanced the mtime". The
  unconditional processed-mtime reset is a fence, not just redundancy: provider batch writes are CAS-guarded on
  `expectedPreviousMtime` (`src/storage/indexeddb/batchContentUpdateOperation.ts:275`), so the reset invalidates
  in-flight batches that read a pre-change metadata cache. Making the reset conditional reopens a stale-content race.
  With a single trigger, the reset no longer causes a second run, so it stays unconditional.
- Deferred: body hash to skip parsing on frontmatter-only edits (still one full six-processor run per save).
- Known remaining: newly created files can still run the pipeline twice (metadata-wait queue and the metadata-change
  flush both trigger on the first `changed` event; the flush resets processed mtimes after the first run completed).
  Separate, smaller item.
- Behavior note: a modify that does not change content (mtime-only touch) no longer triggers an immediate reprocess; the
  file reprocesses on the next sweep that queues it (diff flush, settings change, or startup). Stored content is still
  correct in that window.
- Review outcome (two adversarial passes: event-flow coverage, race/interleaving): no blockers. Hardening applied: the
  metadata flush now queues content even when `markFilesForRegeneration` throws (the removed modify-path queue used to
  mask that failure). One confirmed rare regression was identified: the vault-sync effect remounts on every settings
  change and cleared the pending metadata-change map, so a save whose `changed` event was consumed but not yet flushed
  (a window of roughly the metadata indexing latency, usually under 100ms) lost its refresh; the file kept stale derived
  content until the next edit or restart.
- Remount fix (2026-07-07, implemented, user tested): the modify and metadata-change flush buffers (pending file map,
  flush timer id, processing flag) moved into refs owned by `StorageContext`
  (`modifyFlushBufferRef`/`metadataChangeFlushBufferRef`, type `PendingFileFlushBuffer`). Effect cleanup cancels only
  the timers; the mount path reschedules flushes for entries still buffered. The processing flag is shared so a flush
  batch in flight across a remount blocks a concurrent second batch and reschedules on completion. `stopAllProcessing`
  clears both buffers and timers on shutdown/rebuild.

A save fires both `vault.on('modify')` and `metadataCache.on('changed')`:

- The modify path (`src/context/storage/useStorageVaultSync.ts:614-637`) patches mtime and queues the markdown pipeline,
  tags, and metadata providers.
- The metadata path (`src/context/storage/useStorageVaultSync.ts:657-670`) then calls `markFilesForRegeneration`, which
  zeroes the processed mtimes (`src/storage/fileOperations.ts:380-395`) and re-dirties the file even after the modify
  pass already processed it. The re-enqueue path in `BaseContentProvider.ts:491-501` compounds this.

On top of that, one mtime change reruns all six processors (preview, word count, char count, tasks, properties, feature
image) even for a frontmatter-only edit. There is no body hash; equality is only checked before the DB write, not before
the parse (`src/services/content/MarkdownPipelineContentProvider.ts:691-717`). `ContentReadCache` (3s TTL) dedups the
disk read across the double trigger, but the parse work runs twice.

- Impact: ~2x CPU per save for every user, continuously. Battery cost on mobile while editing.
- Effort: medium. Coalesce both events per path within one debounce window; skip `markFilesForRegeneration` when the
  modify path already advanced the mtime. Optionally store a body hash in `FileData` and skip parsing when unchanged.
- Benchmark: time a save-to-pipeline-idle cycle with debug logging, before/after.

### 1b. Any tag change rebuilds the entire tag tree from scratch

**Status (2026-07-07): medium tier implemented, user tested in Obsidian.**

- Change: tag and property tree rebuilds run through a shared debounced scheduler
  (`src/context/storage/useTreeRebuildScheduler.ts`) with per-tree pending flags. One scheduler pass computes
  `getVisibleMarkdownFiles()` at most once (lazily) and runs whichever rebuilds are pending, replacing the two
  independent debouncers that each did their own full vault scan. The initial-load rebuild pair and the shutdown/
  rebuild cancel paths share the same scheduler (one `cancelTreeRebuildDebouncer` replaces the two per-tree cancels).
- Change: `buildTagTreeFromDatabase` iterates the visible path set directly (`db.getFile` per path, memory map lookup)
  when `includedPaths` is provided, instead of walking every cached record (including non-markdown) and re-checking
  membership plus folder exclusion per record. The `forEachFile` walk remains for the `MetadataService` caller that
  passes no path set.
- Change: the tag and property `onContentChange` listeners skip scheduling when every changed file is missing from the
  vault or outside the visible set (`createFileVisibilityChecker` in `src/utils/fileFilters.ts`). Hidden files are
  indexed and generate content, so during scans they previously triggered full rebuild passes. The skip is disabled for
  the tag listener when files are hidden by tag (a tag change can flip visibility in either direction), and both
  listeners treat frontmatter-driven hidden flips (`metadataHiddenChanged` with property-hiding active) as unconditional
  rebuild triggers, since a flip changes tree membership even when the changed file is now hidden; the property listener
  additionally keeps its tag-visibility arm (tag changes with tag-hiding active) unconditional and skips excluded-folder
  files (they never enter the property tree). Deleted paths are safe to skip: every deletion path (vault diff, property
  delete handler, settings resync) schedules its own rebuild.
- Change: `isPathInExcludedFolder` builds folder prefixes incrementally instead of `slice().join()` per segment
  (Priority 4 hygiene item; called per file inside the tag walk).
- Behavior notes: flush requests are collected in a microtask and run only the requesting trees, so flushes from
  listeners reacting to the same change batch share one pass (one vault scan) while a flush for one tree (for example,
  the delete-diff property flush) leaves the other tree's pending rebuild on the debounce timer. Scheduling resets the
  shared timer; when churn for one tree has delayed the other tree's pending rebuild past a full debounce window, the
  next schedule runs the pass for both trees immediately instead of delaying further. Canonical casing for mixed-case
  tags (first occurrence wins) now follows vault file order instead of database insertion order.
- Deferred (high tier): incremental tree maintenance (diff changed paths against prior node membership, targeted count
  invalidation).
- Review outcome (multi-agent pass, 2026-07-07): one confirmed scheduler bug, fixed. The overdue check read the other
  tree's latest request time, which every schedule call refreshed, so interleaved tag/property bursts (combined gap
  under the debounce window, per-tree gap above it) reset the shared timer indefinitely and starved both rebuilds — a
  regression against the replaced per-tree debouncers. Fix: the timestamp is stamped only when a tree's pending flag
  flips false to true, so it records how long the tree has been waiting. Self-starvation under continuous single-tree
  churn below the debounce gap matches old per-tree debouncer behavior and is unchanged. A refuted candidate: startup
  timing attribution of the shared scan to the tag tree matches the old code (each rebuild previously did its own scan).
- Second review outcome (multi-agent pass, 2026-07-07), fixes applied:
  - The overdue escape hatch ran the vault scan and both rebuilds synchronously in the scheduling caller's stack,
    reachable from vault delete/rename handlers and database change emissions. It now arms a zero-delay
    `window.setTimeout` (single-armed, cleared by `cancelTreeRebuildDebouncer`); the flush microtask path is unchanged.
  - The overdue check used wall-clock `Date.now()`; a backward clock step disabled it. Now `performance.now()`.
  - Both change listeners kept running per-file visibility work after the batch was already marked relevant. The active
    file is now resolved first, and once relevant, non-active changes skip the visibility check.
  - The property listener skipped excluded-folder files only for plain property changes; visibility-flip arms scheduled
    rebuilds for them although excluded files never enter the property tree. The skip now covers all arms.
  - The scheduler-facing property wrapper duplicated `rebuildPropertyTree`'s disabled-clear predicate; it now delegates.
  - The rewritten `includedPaths` branch of `buildTagTreeFromDatabase` had no unit coverage; tests added for path-set
    iteration (no full scan, missing-record skip, untagged count) and hidden-root-tag recording for excluded paths.
  - Skipped (accepted risk): a throw in one tree's rebuild consumes the other tree's pending flag with no try/catch;
    requires a rebuild to actually throw, deferred until there is evidence of one.
- Third review outcome (multi-agent pass, 2026-07-07): no correctness findings. One efficiency fix applied: a flush
  request arriving while the other tree was overdue ran two back-to-back passes (flush microtask, then the zero-delay
  overdue timer), each with its own vault scan. The flush microtask now consumes every pending tree and clears the
  overdue timer when it is armed, so the cycle shares one scan. External suggestion (codex), declined: extracting a
  shared per-file tag accumulator for `buildTagTreeFromDatabase`/`buildTagTreeFromFilePaths` — the duplication predates
  this change and stays per the duplication-over-abstraction policy; revisit if the accumulation logic itself changes.

`rebuildTagTree` (`src/context/storage/useTagTreeSync.ts:107-131`) on every tag delta (debounced 500ms):

1. `getVisibleMarkdownFiles()` walks all markdown files with per-file `metadataCache.getFileCache` exclusion checks
   (`src/utils/fileFilters.ts:774-778`).
2. `buildTagTreeFromDatabase` (`src/utils/tagTree.ts:131-273`) iterates every cached file again via `db.forEachFile`,
   re-checking `isPathInExcludedFolder` AND `includedPaths.has(path)` — two overlapping exclusion mechanisms.
3. `buildTreeFromTagList` sorts all unique tag paths and allocates an entirely new tree of Map/Set nodes
   (`src/utils/tagTree.ts:53-123`).
4. `clearNoteCountCache()` wipes the descendant-count WeakMap (`src/utils/tagTree.ts:266-270`), so every visible tag
   count is recomputed on next render.
5. `setFileData` replaces the context value, re-rendering all `StorageContext` consumers.

The property tree has the identical pattern (`src/context/storage/usePropertyTreeSync.ts:144-178`), with a `db.getFile`
call per visible markdown path. Both rebuild independently, each doing its own full `getVisibleMarkdownFiles()` scan.
During background content generation or sync bursts this repeats every 500ms window for the entire duration of the scan.

- Impact: dominant background jank on large vaults (5k-20k files); continuous for sync-heavy users; worst on mobile.
- Effort: staged. Medium: single-pass rebuild (drop the duplicated exclusion walk), skip rebuild when only non-visible
  files changed, coalesce tag+property rebuilds into one scheduler pass sharing the visible-file scan. High: incremental
  tree maintenance (diff changed paths against prior node membership, targeted count invalidation).
- Benchmark: time `rebuildTagTree` on a large vault, count rebuilds during a content scan.

### 1c. Folder rename/move is unbatched: ~3 IndexedDB transactions per file

**Status (2026-07-08): implemented (order-preserving batch design), user tested in Obsidian.**

- Abandoned approach (context for reviewers): the first implementation collapsed chained renames within a flush window
  into one entry per final path and reordered the batched moves. Collapse-and-reorder breaks the natural ordering
  guarantees of the event stream, so keeping it correct required chain-intermediate bookkeeping, origin-path claiming,
  two-phase snapshot movers, per-request failure containment, and diff-deferral machinery — and that guard machinery
  became the bug surface. Five review rounds kept finding confirmed defects in the guards rather than in the core
  batching (stale records resurrected through reused origins and collapsed intermediates, rename data lost in
  cyclic-batch failure recovery, guard state cleared while a flush batch was in flight, cache cleanup targeting the
  wrong path). The working tree was reverted and rebuilt on the design below, which removes the defect classes
  structurally: without collapse there are no cyclic batches, no origin-reuse windows, and no intermediate-path
  bookkeeping. The trade: coarser failure blast radius (see failure semantics below).
- Design principle: the vault's rename event stream is a serializable history — a rename can only target a vacated path
  — so replaying moves in event order is always correct. Chains (a→b, b→c), swaps via temp names, and rotations need no
  special-casing; the old per-file code was race-free precisely because it processed events in order, it just paid ~3
  transaction commits per file. The batch design keeps the order and drops the commits.
- Change: rename events buffer into `PendingRenameFlushBuffer` (ordered move list, ref owned by `StorageContext`). The
  synchronous handler work is unchanged from the old per-file code: memory seed, pending rename data, blob/preview
  move-in-flight markers, and hop-by-hop LRU thumbnail relocation at event time.
- Change: a zero-delay flush issues one `db.setFiles` for the burst's seeded records, one `db.moveFeatureImageBlobs`
  (single transaction, moves replayed serially in event order: each get is issued after the previous move's put/delete),
  and one `db.movePreviewTexts` (single transaction, ordered move/delete ops; delete ops cover markdown→non-markdown
  renames and run in event order so a vacated markdown path can be re-occupied by a later move in the same burst). Then
  one content-refresh queue call and one debounced diff reschedule. A folder move with N files goes from ~3N
  transactions to 3. Blob moves are issued only for records with `featureImageStatus === 'has'`.
- Ordering vs the diff: the flush starts all batch operations before awaiting any of them, so their transactions are
  created ahead of the debounced diff's delete transactions (IndexedDB runs transactions with overlapping scopes in
  creation order). Scheduling a flush also cancels a diff timer already armed before the burst (the zero-delay stage of
  a debounce that fired earlier); the rename handler's diff reschedule replaces it. No flush-idle waiting exists.
- Failure semantics (accepted, coarser than the previous design): no per-request containment. A failed store transaction
  aborts atomically; the movers catch internally, and move-in-flight markers stay alive until the 10s TTL prunes them
  (blob reads at the new path fall back to the old path; preview loads at the new path skip the status repair), with
  provider regeneration healing after the diff. A failed `setFiles` retries per file (the old code's blast radius);
  records that still fail keep their pending rename entries for the diff.
- Fixed here (pre-existing leak): pending rename entries are deleted after the flush persists them (identity-checked, so
  an entry re-added by a later rename to the same path survives). Previously they were only consumed when a diff
  classified the path as add/update, which a rename (mtime-preserving) never triggered; the leaked entry merged
  rename-time content into the next `recordFileChanges` call for the path.
- Fixed here (pre-existing wrong target): when a batched blob move finds no stored record, the cleanup drops the LRU
  entry at the new path — where the event-time relocation put it — instead of the old path, so a stale cached thumbnail
  cannot mask a missing stored record.
- Lifecycle: the flush drops buffered moves during a stopped window (rebuild/shutdown; the next full diff reconciles
  them — same accepted risk as before). Effect cleanup flushes buffered renames instead of stranding them (a plain view
  close never remounts the effect, and seeded memory records must not outlive the effect unpersisted).
  `stopAllProcessing` clears buffer and timer.
- Removed: the single-file `moveFeatureImageBlob`, `movePreviewText`, and `deletePreviewText` facades (replaced by the
  batch APIs; the preview delete is now a batch op). Also removed (2026-07-08): the single-file `setFile` record write;
  its only caller was the flush's per-record retry loop, which now uses `setFiles`.
- Tests: serial-replay coverage for chains, temp-name swaps, vacated-path delete-before-move ordering, missing-record
  cache cleanup, whole-batch rollback on put failure, later-delete-of-move-target cache reconciliation, move-marker
  retention across a failed preview batch, and old-path fallback across a failed blob batch
  (`tests/storage/FeatureImageBlobMove.test.ts`, `tests/storage/PreviewTextMoveInFlight.test.ts`). The shared mock
  harness (`tests/storage/mockIndexedDB.ts`) models real abort semantics: a failed request aborts the transaction,
  requests issued after the failure error with AbortError instead of executing, and the backing store rolls back to its
  state at transaction start.
- Review outcome (multi-agent pass + external codex feedback, 2026-07-07), fixes applied:
  - The preview batch mover ended move-in-flight markers in its `finally` block even when the transaction aborted (also
    flagged by codex). The single-file mover had the same teardown, but the batch design widened a failure's blast
    radius from one file to the whole burst, and the documented failure semantics promised marker retention. `endMove`
    is now gated on a successful batch, matching the blob mover's `didMove` gate; the deferred-resolution cleanup in the
    `finally` stays unconditional.
  - The post-transaction cache reconciliation keyed only on move targets, so a later delete of a path an earlier move
    occupied (x.md→p.md, p.md→p.txt) resurrected the moved text at the vacated path in the cache and stamped a 'has'
    status repair. Cache updates now resolve final per-path state across both op types in event order; delete-op cache
    clears moved from before the transaction to the success path, so an aborted batch leaves the cache untouched,
    consistent with the store rollback.
  - A diff timer armed before the rename burst (the zero-delay stage of a debounce that had already fired) beat the
    flush's zero-delay timer and created its delete transactions first, removing old-path records and artifacts before
    the moves read them — delete-and-regenerate churn instead of moves. `scheduleRenameFlush` now cancels an armed diff
    timer; the rename handler's debounced diff reschedule replaces it.
  - The stopped-window drop path now consumes the dropped burst's pending rename entries so a cache rebuild's clean
    build cannot merge stale snapshots into freshly created records (codex finding; the exposure predates this change —
    entries used to leak on every rename — and the flush-time consumption had already narrowed it to the stopped-window
    and failed-persist races).
  - Mock harness: requests issued after a failed put executed against post-failure state; they now error with
    AbortError, so the production replay chain stops at the failure in tests the way it does in a real browser.
  - Stale comment referencing the removed `movePreviewText()` facade updated (codex finding).
- Second review outcome (multi-agent pass, 2026-07-08) + codex cleanup, fixes applied:
  - The blob mover's missing-record cache cleanup was a plain append list: a later move in the same burst that
    re-occupied a path an earlier missing-record move targeted had its valid relocated thumbnail evicted after the
    transaction committed (transient blank until the store re-read). The cleanup now resolves stored-record presence per
    destination path in event order, last op wins — the same shape as the preview mover's final-state map.
  - The flush started `setFiles` and `movePreviewTexts` concurrently on stores with non-overlapping scopes, so
    `setFiles`' completion-time memory cache update could run after the preview mover's missing-record downgrade and
    stamp the seeded `previewStatus` back onto the memory record while the store held the repaired status (transient
    memory/store divergence; self-healed on the next preview load). The flush now refreshes the memory mirror
    synchronously before starting the batches, and `setFiles` takes a `skipCacheUpdate` option so no deferred re-stamp
    exists to race a coordinator's cache reconciliation.
  - The flush orchestration had no test coverage — the layer where the abandoned design's five review rounds found all
    their defects. The scheduling/flush logic moved out of the vault-sync effect into `createRenameFlushController`
    (`src/context/storage/renameFlush.ts`, deps injected: buffer, pending rename map, store facade, diff cancel/
    reschedule, content-refresh queue); the effect wires it and keeps only the event handlers. Tests pin batch
    composition and event order, per-store batch starts before the persist settles, diff-timer cancellation on schedule,
    identity-checked pending-entry consumption, stopped-window drop-and-consume, per-file retry with entry retention for
    records that still fail, single armed timer per burst, and cleanup-time `flushNow`
    (`tests/storage/RenameFlush.test.ts`).
  - No test pinned that an aborted preview batch leaves the memory cache untouched (the previous round moved the
    delete-op cache clear to the success path); a failed batch containing a delete op is now covered.
  - Codex: a run of preview delete ops replayed via synchronous recursion, which exhausts the call stack on very large
    markdown→non-markdown bursts. Delete runs are now issued iteratively (moves still wait on their get); covered by a
    50k-delete-op test.
  - Codex-adjacent: move sources kept their cached preview text until the diff removed the record, and in a chained
    rename (a→b, b→c) the intermediate hop's stale `moved` state re-populated the cache and emitted a change event for a
    path about to be deleted. Move ops now record a `vacated` final state at their source (overridden when a later op
    re-occupies the path), and the reconciliation clears the cache for vacated paths the same way it does for deletes.
- Third review outcome (multi-agent pass, 2026-07-08), fixes applied:
  - The diff-ordering guard only covered an armed diff timer. A diff already past its zero-delay timer suspends in its
    awaited record-update transaction before running deletes; a rename landing in that window can re-occupy a path the
    diff classified as removed (delete-then-rename replace flows, sync clients). The flush's transactions are created
    ahead of the diff's delete, so the delete destroyed the just-moved record and artifacts, and the consumed pending
    rename entry downgraded the reconciling diff's heal to a default record — full derived-content regeneration for the
    renamed file. The old per-file code deterministically healed this interleaving with content intact (its moves ran
    after the delete and it never consumed pending entries on success), so this was a regression. Fix: the diff filters
    its removal list at delete time against paths a rename has re-occupied (`excludeReoccupiedRenameTargets` in
    `renameFlush.ts`: buffered move targets plus pending rename entries, gated on the file existing in the vault again
    so a leaked entry cannot suppress a real removal). Residual accepted: a rename landing after the filter runs, during
    the delete transaction itself, loses only the memory record for ~100ms — the store is restored by the later-created
    flush transactions and the rescheduled diff re-upserts from the stored record with content intact.
  - The preview mover ended move markers and cancelled queued loads in its finally block, after the awaited
    status-repair transaction, without discriminating by queue time — a legitimate load queued after the batch committed
    (reconciled text already evicted under preview-LRU cap pressure) was silently dropped, leaving a blank preview until
    the next load trigger. The same defect class existed per file in the old code; the batched repair widened the window
    to the whole burst. Fix: markers end and rename-window loads unblock immediately after the commit, before the cache
    reconciliation and repair; the finally covers only the failed-batch path. A regression test gates the repair await
    and verifies a load queued in that window survives (verified to fail against the unfixed code).
  - Noted, not changed: the flush's transaction-creation-order guarantee relies on `init()` resolving from a cached
    settled promise so all three batch transactions are created in one microtask drain; now pinned in the ordering
    comment, since an async hop added before `db.transaction(...)` in any batch method would silently reopen the diff
    race and the fake-store test cannot detect it. Mock-fidelity gaps recorded for future work: the mock fires request
    callbacks synchronously at handler assignment (stack-depth semantics inverted vs real IndexedDB — the 50k-delete
    test's overflow rationale is mock-specific; the issue order it pins is the production-relevant property), does not
    model transaction auto-commit (an async hop inside a replay chain would throw TransactionInactiveError only in
    production), never fires `transaction.onerror`, and stubs `repairPreviewStatusRecords` in all preview tests (the
    repair path itself has no unit coverage).
- Fourth review outcome (multi-agent pass, 2026-07-08): no happy-path correctness findings. Both refuted candidates
  attacked the diff-ordering guard from new angles (initial-load branch, exclusion-settings resync) and failed on
  transaction-creation-order proofs; the resync interleaving exists but predates the batching and its window is narrower
  with it. Three correctness findings remain, all confined to the double-persist-failure path (the `setFiles` batch and
  the per-file retry both fail) — open, pending fix approval:
  - Confirmed: a pending rename entry retained after a failed retry is never consumed for an mtime-preserving rename
    (the flush seeds the memory mirror with the file's mtime, so the diff classifies the path as unchanged and never
    calls `recordFileChanges`). The leaked entry merges the rename-time snapshot into a later add/update and keeps the
    path in `excludeReoccupiedRenameTargets`' target set indefinitely, suppressing vault-diff removals of the in-vault
    path until restart.
  - Plausible: the content refresh is no longer gated on a successful persist (the old per-file code queued it only
    after `setFile` succeeded); a provider write during a recovered-IDB window takes the default-record path for an
    unpersisted record, resetting seeded fields and stamping an mtime that stops the diff from consuming the pending
    entry.
  - Plausible (narrow): the per-file retry runs after the preview mover's status repair and can re-persist a seeded
    'has' record after the repair; residual exposure is one transient blank preview on the next start under a stacked
    failure (pre-existing has-with-no-text record, `setFiles` abort, app exit before regeneration).
  - Cleanup applied: the preview mover's per-move status repair is gated on the cached status disagreeing with 'has'.
    The flush persists the seeded records (status 'has') on the same store ahead of the repair transaction, so the
    unconditional repair was a guaranteed no-op fourth transaction on every successful markdown burst.
  - Cleanup applied: the uncalled `batchUpdate` facade and the `skipCacheUpdate` option are removed; `setFiles` never
    updates the memory cache (its only caller, the rename flush, seeds the mirror before persisting), so no deferred
    completion-time cache re-stamp path remains.
  - External suggestion (codex), declined: consuming pending rename entries when `stopAllProcessing` clears the rename
    buffer. `stopAllProcessing` runs only during plugin shutdown (main.ts `stopNavigatorContentProcessing`); it detaches
    the vault listeners and the refs die with the React tree, so no later diff can read the entries. Cache rebuilds do
    not call it — they flip the stop flag and the armed flush's stopped-window path consumes the entries. Guarding the
    shutdown-only path against a hypothetical live-provider caller is speculative hardening per policy.
- Fifth review outcome (multi-agent pass, 2026-07-08): no new production correctness findings. Two fixes applied:
  - The failed-batch marker-retention test was vacuous: it queued a preview load without registering a
    `previewLoadDeferred` entry, and the load flush drops queued paths with no deferred before reaching the move-marker
    guard, so the final status assertion passed even with every marker cleared — the round-1 `didMove` gate was not
    actually pinned. The test now registers the deferred, matching its siblings (verified to fail with markers cleared).
  - The flush re-seeded the memory mirror with a value-identical clone per renamed file: `handleRename` already seeds
    the identical record at event time, and renames preserve mtime, so the spread copy and second `cloneFileData` were
    redundant allocations per file on the burst path. The flush now persists `move.seeded` as-is when the mtime is
    unchanged and re-stamps plus re-seeds only when the mtime advanced between the event and the flush (this also stops
    an unchanged-mtime re-seed from reverting a provider write that landed in the window). A test pins the skip and the
    persisted-record identity.
- Files changed: `src/context/storage/useStorageVaultSync.ts` (event handlers, controller wiring),
  `src/context/storage/renameFlush.ts` (buffer types, `createRenameFlushController`, `excludeReoccupiedRenameTargets`),
  `src/context/StorageContext.tsx` (buffer ref, shutdown clear), `src/storage/IndexedDBStorage.ts` (batch facades,
  `setFiles` options), `src/storage/FeatureImageBlobStore.ts` (`moveBlobs`), `src/storage/indexeddb/featureImageOps.ts`
  (coordinator `moveBlobs`), `src/storage/indexeddb/previewTextOps.ts` (`movePreviewTexts`, `PreviewTextBatchOp`),
  `tests/storage/mockIndexedDB.ts`, `tests/storage/PreviewTextMoveInFlight.test.ts`,
  `tests/storage/FeatureImageBlobMove.test.ts`, `tests/storage/RenameFlush.test.ts`.

### 1d. Single create/delete triggers a full-vault diff

**Status (2026-07-08): Map-copy fix implemented, awaiting user testing in Obsidian. File-list caching rejected.**

- Change: `calculateFileDiff` is synchronous and no longer copies the memory cache into an intermediate Map. The
  per-file mtime comparison reads records in place via `db.getFile` (memory-map lookup, no clone on read); the removal
  scan is one `db.forEachFile` pass against the current-path set. The returned `existingData` map holds only the records
  for `toUpdate` files — `recordFileChanges` only looks up its input files, and `toAdd` files have no cached record. The
  `cachedFileCount` diagnostic value is `db.getFileCount()` (memory-mirror size, O(1)), matching the old
  `cachedFiles.size` (pre-removal count; the function is synchronous, so the mirror cannot change before the removal
  scan runs). All three call sites updated (incremental diff, initial load, exclusion-settings resync).
- Rejected: caching the filtered `getIndexableFiles()` list. Invalidation spans file create/delete/rename, settings
  changes, and frontmatter edits (exclusion properties can flip a file's inclusion), guarding the diff path that is also
  1c's healing backstop. The flush stays O(N) regardless: the removal scan inherently visits every cached path.
- Review outcome (multi-agent pass, 2026-07-08): no correctness findings, including the probed interaction with 1c's
  healing path (`excludeReoccupiedRenameTargets`, pending rename entry consumption, `existingData` contents per diff
  class). One cleanup applied: the removal scan hand-tallied `cachedFileCount` inside its `forEachFile` callback,
  coupling the diagnostic to the scan loop; it now uses `db.getFileCount()`. Codex doc sweep: three leftover
  `cachedFiles` references renamed to `existingData` (`docs/metadata-pipeline.md`, `docs/startup-process.md`, a test
  comment); the metadata-pipeline doc now lists `existingData` in the `calculateFileDiff` return shape.

Each debounced flush runs `getIndexableFiles()` over the whole vault (`src/utils/fileFilters.ts:784-814`, with per-file
`metadataCache.getFileCache` for frontmatter exclusion) plus `calculateFileDiff`, which copies the entire memory cache
into a throwaway Map (`src/storage/diffCalculator.ts:66-75`) — a 20k-entry Map allocated to process one new file.

- Impact: GC pressure and O(N) work per create/delete flush; compounds during bulk operations.
- Effort: low for the Map copy (iterate `db.forEachFile` directly); medium for caching the filtered file list.

---

## Priority 2 — Interaction latency residuals

### 2a. Folder note counts fully recompute on every expand/collapse

**Status (2026-07-08): persistent-cache slice and folder-change invalidation follow-up implemented, folder delete
invalidation user tested in Obsidian. Ancestor-chain invalidation deferred.**

- Change: the folder-count pass cache in `useNavigationNoteCounts` persists across renders (`folderCountCacheRef`),
  keyed on an identity token (`folderCountCacheKey`) built from every input that affects count values: the vault and
  metadata-visibility versions, the hidden-tag data version, exclusion lists and matchers, file visibility, and the
  folder-note settings. `itemsWithMetadata` is not a key input, so passes triggered by expand/collapse or decoration
  updates reuse cached counts — `calculateFolderNoteCounts` returns cached folders without walking their subtrees. Each
  pass returns a fresh Map copy, so downstream map-identity semantics are unchanged.
- Folder create/delete/rename does not bump `vaultChangeVersion` (`useRootFolderOrder` notifies file events only); the
  old code picked those up through the unconditional `itemsWithMetadata` recompute. `useRootFolderOrder` now emits an
  `onFolderChange` callback synchronously from the vault event handlers, which bumps `folderChangeVersion` in
  `useFolderNavigationSourceState`; that version is a key input. This replaced an earlier key input on
  `rootLevelFolders` identity, which only changed after the debounced (100ms) `buildFolders` run — folder deletes left a
  stale-count window until the debounce fired, and folder moves cleared the cache twice (file rename bumps immediately,
  `rootLevelFolders` identity 100ms later).
- User test: deleting a folder updates counts correctly with the immediate folder-change invalidation. Other manual
  checks were not useful because folder-count work completed in under 1ms in the tested vault.
- `metadataVisibilityVersion` enters the key gated as `hiddenFilePropertyVersion` (zeroed when
  `effectiveFrontmatterExclusions` is empty, i.e. no hidden properties configured or hidden items shown), mirroring
  `hiddenFileTagDataVersion`, so hidden-property flips do not clear the cache when the count pass reads no
  frontmatter-hidden state. Disabling `showNoteCount` releases `folderCountCacheRef`.
- With descendant notes off, an expand computes only the newly revealed folders (direct-children scans; no recursion in
  that mode). With descendant notes on, expand/collapse passes are pure cache hits.
- Deferred: ancestor-chain invalidation. Changed paths exist at the version bump sites (`RootFileChangeEvent`,
  `db.onContentChange`) but are erased into bare counters before reaching the hook; threading them through
  `useNavigationPaneSourceState`/`useNavigationPaneData` is the medium-effort layer. Until then, any file
  create/delete/rename or count-relevant metadata change clears the cache and recomputes all visible folders — the same
  work the old code did per pass, now only on data changes.
- Tests: the cache contract is pinned in `tests/utils/noteCountUtils.test.ts` (a seeded entry is returned without
  walking children; a pass caches every visited descendant folder and later passes reuse the stored info). The
  hook-level key wiring has no unit coverage (node test environment, one-shot server renders).
- Files changed: `src/hooks/navigationPane/data/useNavigationNoteCounts.ts`, `src/hooks/useRootFolderOrder.ts`
  (`onFolderChange` callback), `src/hooks/useFolderNavigationSourceState.ts` (`folderChangeVersion`),
  `src/hooks/navigationPane/data/useNavigationPaneSourceState.ts`, `src/hooks/navigationPane/useNavigationPaneData.ts`,
  `tests/utils/noteCountUtils.test.ts`, `tests/hooks/useNavigationNoteCounts.test.ts` (harness param),
  `tests/hooks/useNavigationPaneTreeSections.test.ts` (fixture fields, see review below).
- Code review (2026-07-08, multi-agent, adversarial verify): one confirmed finding — the `createSourceState` fixture in
  `tests/hooks/useNavigationPaneTreeSections.test.ts` was missing the new required `folderChangeVersion` field (and the
  pre-existing `descendantExcludedFolders`); both added. A candidate claiming the cache key misses the
  supported-extension registry under `fileVisibility: 'supported'` was refuted. Cache key coverage, the synchronous
  folder-change invalidation, and the fresh-Map-copy semantics passed clean.
- Deferred pending profiling evidence: skipping the per-pass `new Map(counts)` copy on pure cache-hit passes.
- Deferred pending verification in Obsidian: counts computed before Obsidian's metadataCache resolves frontmatter can
  cache over-counted values (exclusion matcher reads `app.metadataCache` live; resolution state is not a key input). If
  it reproduces, a one-time key bump on `metadataCache.on('resolved')` heals the cache.

`computedFolderCounts` (`src/hooks/navigationPane/data/useNavigationNoteCounts.ts:237-303`) allocates a fresh cache Map
per pass and recurses into all descendant folders of every visible folder (`src/utils/noteCountUtils.ts:58-131`). The
pass cache is discarded after each render. Recompute triggers include every expand/collapse (via `itemsWithMetadata`)
and any file create/delete/rename anywhere (via `fileChangeVersion`). With "show root folder" enabled, one pass can walk
the entire vault.

- Impact: sluggish expand/collapse and post-file-op updates on large vaults with note counts enabled.
- Effort: medium. Persistent path-to-count cache invalidated along the changed file's ancestor chain; decouple recompute
  from expansion state (descendant recursion already ignores expansion). Also decouple from `itemsWithMetadata` so
  cosmetic decoration changes stop retriggering counts.

### 2b. Filter search re-folds all file metadata per keystroke

`filterListPaneFiles` (`src/hooks/listPaneData/searchPipeline.ts:300-372`) iterates all base files per accepted
(debounced) query. For property/tag queries it allocates a fresh `Map<string, Set<string>>` and re-folds every property
key/value and every tag for every file, every query, with no per-file caching. Additionally, `useSearchableNames`
(`searchPipeline.ts:215-251`) clones the entire name Map on every single-file metadata change, and rebuilds fully on any
settings change because `getFileDisplayName` identity depends on the whole settings object
(`src/context/StorageContext.tsx:326-336`).

- Impact: typing lag for tag/property queries on large vaults.
- Effort: low-medium. Cache folded name/tags/properties per file path keyed by a metadata version; mutate the name Map
  in place; stabilize `getFileDisplayName` deps.

### 2c. Whole-list re-decoration in the navigation item pipeline

`itemsWithSeparators.map(decorateItem)` (`src/hooks/navigationPane/data/useNavigationPaneItemPipeline.ts:491`)
re-decorates every visible item (icon/color/display-name resolution) whenever any decoration input changes
(`metadataDecorationVersion`, settings, rainbow config, etc.). No per-item diffing.

- Impact: jank on large expanded trees when a single decoration/metadata version bumps.
- Effort: medium. Memoize per-item decoration keyed by item identity + relevant version.

---

## Priority 3 — Occasional but severe

### 3a. Settings edits wipe and regenerate content for the whole vault

`ContentProviderRegistry.handleSettingsChange()` (`src/services/content/ContentProviderRegistry.ts:72-115`) clears
vault-wide. Changing any of `skipHeadingsInPreview`, `previewProperties`, `stripHtmlInPreview`, etc. clears all preview
text and re-reads every file body (`src/services/content/MarkdownPipelineContentProvider.ts:104-153`, `568-605`).
`featureImagePixelSize`/`featureImageProperties` re-encode all thumbnails. `frontmatterDateFormat` clears all metadata.
UI visibly blanks then refills, and every global change subscriber processes thousands of notifications.

- Impact: startup-sized churn event on every such settings toggle; battery; blank-then-refill flash.
- Effort: medium-high per setting. Cheaper wins first: recompute in place instead of clear-then-refill (removes the
  blank flash and full re-emit); re-encode thumbnails lazily on view.

### 3b. Bulk content scans never yield to the event loop

`BaseContentProvider.processNextBatch` runs 100-file batches in parallel groups of 10 back-to-back with no yield between
batches or groups (`src/services/content/BaseContentProvider.ts:340-517`; `yieldToEventLoop` exists at `:101-103` but is
only used in idle polling). Also, all providers (markdownPipeline, tags, metadata, fileThumbnails) run independent
queues concurrently with no shared concurrency budget.

- Impact: main-thread monopolization during scans — jank, battery, OOM/kill risk on mobile.
- Effort: low. Insert `await yieldToEventLoop()` between parallel groups, gated on mobile or an idle-deadline check.
  Medium: shared semaphore across providers.

---

## Priority 4 — Cheap hygiene wins (bundle into any of the above)

- Done (shipped with 1b): `isPathInExcludedFolder` builds folder prefixes incrementally instead of `slice().join()` per
  segment (`src/utils/fileFilters.ts:629-645`).
- Deferred: batch writes do a redundant `store.get` before every `put` although `MemoryFileCache` already holds the
  record — doubles IndexedDB ops on every write path (`src/storage/indexeddb/batchContentUpdateOperation.ts:133`,
  `src/storage/indexeddb/IndexedDBStorage.ts:840`). Needs the memory record confirmed authoritative at write time;
  correctness-sensitive, not a pre-release change.
- Done (2026-07-08): per-tag string normalization is memoized per rebuild. `createTagPathFormsMemo` in
  `src/utils/tagTree.ts` caches `{canonicalPath, normalizedPath, lastSegment}` per unique raw tag string; both
  `buildTagTreeFromDatabase` (including the hidden-root-tag path) and `buildTagTreeFromFilePaths` create one memo per
  call. Per-rebuild scoping was chosen over the module-level Map to keep lifetime bounded; the hit rate comes from tags
  repeating across files within a single rebuild.
  - Review outcome (multi-agent pass, 2026-07-08), declined: the memo inlines the `#`-strip/slash-trim rule that also
    exists as the private `cleanTagPath` in `tagPrefixMatcher.ts`, and `normalizeTagPathValue` re-runs it on the same
    string. The duplication predates this change (the memo consolidated three call sites to one); left per the
    duplication-over-abstraction policy. Codex concurred with leaving it for this release.
- Not planned: statistics panel `JSON.stringify`s every record every 5 seconds while the Advanced settings tab is open
  (`src/utils/statistics.ts:64`, `247`; `IndexedDBStorage.getDatabaseStats:1120-1138`). Diagnostics-only surface.
- Done (2026-07-08): `IconService.isValidIcon` checks a per-provider `Set` of icon ids instead of scanning
  `provider.getAll()` per call. The cache is keyed on the service `version`, which bumps on provider register/unregister
  and on `notifyIconAssetsChanged` (vault SVG changes arrive through the debounced workspace handler; external packs
  register a fresh provider instance per activation), so both provider and asset changes clear it.
  - Review outcome (multi-agent pass + codex, 2026-07-08), fix applied, awaiting user testing: the version-keyed cache
    served stale vault-icon membership during the 50ms `scheduleIconAssetsChanged` debounce window — the vault icon list
    cache updates synchronously on create/rename/delete while the version bump is deferred, so a drag preview started in
    that window validated a just-deleted icon as present (image-off fallback glyph instead of the base icon) or skipped
    a just-created one; pre-change code read `provider.getAll()` fresh per call. Fix:
    `IconService.invalidateIconValidationCache()` clears the id sets synchronously from the three membership-changing
    vault handlers before the debounced notification, keeping the render debounce intact. The `modify` handler is
    unchanged (content edits do not alter list membership).

---

## Verified clean (checked, no action needed)

- File reads: one `vault.cachedRead` per markdown file per pass, shared across all six processors; tags/metadata
  providers use `metadataCache` only. No duplicate reads across providers.
- Modify and metadata-change events are batched into single transactions (`useStorageVaultSync.ts:390-527`).
- Per-row content updates are granular: each file row subscribes to its own path with field-level equality guards
  (`src/hooks/useFileItemContentState.ts`).
- Metadata cache resolution is event-driven (`metadataCache.on('resolved')`/`on('changed')`), no hot polling.
- Drag-over has a same-drop-zone fast path; auto-expand is timer-based (`src/hooks/useDragAndDrop.ts:794-976`).
- Context menus build lazily on right-click and reuse `orderedFiles` instead of scanning the vault
  (`src/utils/contextMenu/fileMenuBuilder.ts:157-185`).
- Reveal/auto-reveal walks only the parent chain, short-circuits on same file (`src/hooks/useNavigatorReveal.ts`).
- Memory mirror carries no redundant blob payloads; feature images and preview text live in bounded LRUs.

---

## Suggested execution order

1. **1a + 1b first slice** (done, see status above): confirm the double-processing with debug logging, then coalesce the
   modify/metadata triggers and make the tag/property tree rebuild single-pass and skip-capable. Shared trigger path,
   dominant steady-state cost, cleanly benchmarkable.
2. **1c rename batching** (done, see status above): fixes the most user-reportable symptom (folder-move freezes).
3. **2a note counts + 1d diff allocation**: interaction latency on expand/collapse plus a cheap allocation fix.
4. **3b mobile yielding**: low effort, ship alongside any of the above.
5. Remaining items opportunistically.
