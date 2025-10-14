import { LinkCache, CachedMetadata, EmbedCache, TFile, App } from "obsidian";
import { getDBInstance } from "src/storage/fileOperations";

interface SceneElements {
    [key: string]: unknown
}

interface ExcalidrawScene {
    elements: { [key: string]: unknown }
}

interface ElementsDictImage {
    type: string,
    fileId: string,
    width: number,
    height: number
}

interface ExcalidrawAutomateGlobal {
    elementsDict: readonly ElementsDictImage[]
    imagesDict: { [key: string]: unknown }
    getAPI(): ExcalidrawAutomateGlobal & {
        getSceneFromFile(excalidrawFile: TFile): ExcalidrawScene;
        copyViewElementsToEAforEditing(scene: SceneElements, copyImages?: boolean): unknown;
        createPNG(): Promise<Blob>;
    }
}

declare global {
    const ExcalidrawAutomate: ExcalidrawAutomateGlobal
}

const cacheDirPath = `thumbnails/full`
const cacheFilePath = (excalidrawFile: TFile) => `${cacheDirPath}/${excalidrawFile.basename}_${excalidrawFile.stat.size}.png`
const getDbFile = (path: string) => getDBInstance().getFile(path)

function getExcalidrawAttachmentType(outlink: LinkCache, metadata: CachedMetadata | null) {
    // eslint-disable-next-line eqeqeq
    const frontMatter = outlink != null && outlink.link != null ? metadata?.frontmatter ?? {} : {};

    function hasExcalidrawType(value: 'parsed' | 'raw') {
        return frontMatter['excalidraw-plugin'] === value ? value : ''
    }

    return hasExcalidrawType('parsed') || hasExcalidrawType('raw')
}

async function getEmbedLinkFileId(lines: readonly string[], outlink: EmbedCache) {
    const linesWithLink = lines.filter(x => x.indexOf(outlink.link ?? '') >= 0)
    //# Embedded files
    // 4d12435ada81c2e3600f6fc5b4db4fd56b63261c: [[other/trash-notes/To Do/unknown_filename.1.png]]
    return linesWithLink.map(lineWithLink => /^(.*?):/g.exec(lineWithLink)![1])
}

export interface ToDataUriResult {
    objectURL?: string
    excalidrawPngBlob?: Blob,
    dispose: () => void,
}

const EMPTY_DISPOSE = function emptyDispose() {}
const EMPTY_TO_DATA_URI_RESULT = { dispose: EMPTY_DISPOSE }

async function toDataURI(tFile: TFile, outlink: LinkCache, params: { width: number, height: number }, app: App): Promise<ToDataUriResult> {
    // eslint-disable-next-line eqeqeq
    if (tFile == null) {
        return EMPTY_TO_DATA_URI_RESULT;
    }

    const metadata: CachedMetadata | null = this.app.metadataCache.getFileCache(tFile);

    let previewPngBlob: GeneratePreviewResult | undefined
    if (getExcalidrawAttachmentType(outlink, metadata) === 'raw') {
        previewPngBlob = await generatePreview(tFile, true, app)
    } else if (getExcalidrawAttachmentType(outlink, metadata) === 'parsed') {
        previewPngBlob = await generatePreview(tFile, false, app)
    }

    if (previewPngBlob) {
        const imageSource = URL.createObjectURL(previewPngBlob.blob);

        return {
            objectURL: imageSource,
            excalidrawPngBlob: previewPngBlob.blob,
            dispose: () => {
                URL.revokeObjectURL(imageSource)
                previewPngBlob.dispose()
            }
        }
    }

    const imgHtml = `<img src="${app.vault.getResourcePath(tFile)}" />`
    const tmpEl = document.createElement('div')
    // eslint-disable-next-line @microsoft/sdl/no-inner-html
    tmpEl.innerHTML = imgHtml
    const imgEl = tmpEl.children[0] as HTMLImageElement

    await new Promise<void>((resolve, reject) => {
        imgEl.onload = () => resolve();
        imgEl.onerror = (e) => reject(e);
    });

    const canvas = document.createElement('canvas')
    canvas.width = params.width
    canvas.height = params.height

    const ctx = canvas.getContext("2d");
    ctx?.drawImage(imgEl, 0, 0);

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob: Blob | null) => {
            // eslint-disable-next-line eqeqeq
            if (blob == null) {
                reject(`Unable to create image preview for "${tFile.path}"`);
                return;
            }

            resolve(blob)
        }, "image/png")
    });

    const objectURL = URL.createObjectURL(pngBlob);

    return { objectURL, dispose: () => URL.revokeObjectURL(objectURL) }
}

// defensive programming: ensure that it has the correct shape
function isValidElementsDictEntry(value?: [id?: string, image?: ElementsDictImage]): value is [id: string, image: ElementsDictImage] {
    // eslint-disable-next-line eqeqeq
    return value != null && value instanceof Array && typeof value[1]?.type === 'string'
}

export type Dispose = () => void;
export type DisposeArray = Dispose[];

async function loadEmbeddedOutlinksForExcalidraw(ea: ExcalidrawAutomateGlobal, excalidrawFile: TFile, app: App): Promise<Dispose> {
    const outlinks = this.app.metadataCache.getFileCache(excalidrawFile)?.links as LinkCache[];

    // eslint-disable-next-line eqeqeq
    if (outlinks == null || outlinks.length == 0) return EMPTY_DISPOSE;

    const sceneImages = Object.entries(ea.elementsDict ?? []).filter(x => isValidElementsDictEntry(x) && x[1].type === 'image')

    if (sceneImages.length === 0) return EMPTY_DISPOSE;

    const content = await this.app.vault.read(excalidrawFile);
    const lines = content.split('\n')
    const disposeFuncs: DisposeArray = []

    await Promise.all(outlinks.map(async (outlink: LinkCache) => {
        const fileIds = await getEmbedLinkFileId(lines, outlink);
        const maybeFileParam = sceneImages.find(x => fileIds.indexOf(x[1].fileId) >= 0)

        // eslint-disable-next-line eqeqeq
        if (maybeFileParam == null) return

        const fileParams = maybeFileParam[1] as { fileId: string, width: number, height: number }
        const fileId = fileParams.fileId

        const embedPath = outlink.link;
        const embedFile = this.app.metadataCache.getFirstLinkpathDest(embedPath, excalidrawFile.path);

        const imageData: ToDataUriResult = await toDataURI(embedFile, outlink, fileParams, app);

        // monkey-patch the images dict to make ExcalidrawAutomate believe
        // that images are loaded and ready to render
        ea.imagesDict[fileId] = {
            "mimeType": "image/png",
            "id": fileId,
            "dataURL": imageData.objectURL,
            "created": 1714630882281,
            "isHyperLink": true,
            "hyperlink": outlink.link,
            "file": null,
            "hasSVGwithBitmap": false,
            "latex": null
        }

        disposeFuncs.push(imageData.dispose);
    }));

    return () => {
        for(const disposeFunc of disposeFuncs) {
            disposeFunc()
        }
    }
}

export interface GeneratePreviewResult {
    blob: Blob,
    dispose: () => void
}

const EMPTY_STRING = '';

async function generatePreview(excalidrawFile: TFile, loadRaw: boolean, app: App): Promise<GeneratePreviewResult> {
    // eslint-disable-next-line no-undef
    const ea = ExcalidrawAutomate.getAPI();

    const scene = await ea.getSceneFromFile(excalidrawFile)

    async function createNewBlobResult(dispose?: Dispose): Promise<GeneratePreviewResult> {
        return {
            blob: await ea.createPNG(),
            dispose: dispose ?? EMPTY_DISPOSE
        }
    }

    if (loadRaw) {
        await ea.copyViewElementsToEAforEditing(scene.elements, true)
        return createNewBlobResult()
    }

    await ea.copyViewElementsToEAforEditing(scene.elements)

    const dispose = await loadEmbeddedOutlinksForExcalidraw(ea, excalidrawFile, app)

    return createNewBlobResult(dispose)
}

export async function generateExcalidrawPreview(excalidrawFile: TFile, app: App, requestingFile: TFile): Promise<string | null> {
    const previewFilePath = cacheFilePath(excalidrawFile);
    const dbFile = getDbFile(requestingFile.path);

    const hasExistingFeature = (dbFile?.featureImage ?? EMPTY_STRING).length > 0;

    if (hasExistingFeature && dbFile?.featureImage === previewFilePath) {
        return previewFilePath;
    }

    if (hasExistingFeature && await this.app.vault.adapter.exists(dbFile?.featureImage)) {
        const previewAbstractFile = this.app.vault.getFileByPath(dbFile?.featureImage)
        await this.app.vault.delete(previewAbstractFile);
    } else if (!(await this.app.vault.adapter.exists(cacheDirPath))) {
        await this.app.vault.adapter.mkdir(cacheDirPath);
    }

    let previewData: GeneratePreviewResult | undefined
    try {
        previewData = await generatePreview(excalidrawFile, false, app);
        await this.app.vault.createBinary(previewFilePath, await previewData.blob.arrayBuffer());
        return previewFilePath
    } catch(e: unknown) {
        if (e instanceof Error && e.message.indexOf("File already exists") >= 0) {
            // usually should not happen but just in case
            return previewFilePath
        }

        throw e;
    } finally {
        previewData?.dispose()
    }
}
