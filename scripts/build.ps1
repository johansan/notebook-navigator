# Notebook Navigator - Plugin for Obsidian
# Copyright (c) 2025-2026 Johan Sanneblad
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <https://www.gnu.org/licenses/>.

#Requires -Version 5.1

$ErrorActionPreference = 'Stop'

$Utf8NoBom = New-Object System.Text.UTF8Encoding $false
[Console]::OutputEncoding = $Utf8NoBom
$OutputEncoding = $Utf8NoBom
$SuccessMark = [char]::ConvertFromUtf32(0x2705)
$ErrorMark = [char]::ConvertFromUtf32(0x274C)
$WarningMark = [char]::ConvertFromUtf32(0x26A0)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path (Join-Path $ScriptDir '..')
Set-Location $ProjectRoot

$BuildWarnings = 0
$BuildErrors = 0

function Resolve-BuildTool {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,

        [string[]]$FallbackPaths = @()
    )

    $command = Get-Command $Name -ErrorAction SilentlyContinue
    if ($command) {
        return $command.Source
    }

    foreach ($path in $FallbackPaths) {
        if ($path -and (Test-Path -LiteralPath $path)) {
            return $path
        }
    }

    throw "Missing required build tool: $Name"
}

function Invoke-BuildCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath,

        [string[]]$ArgumentList = @(),

        [switch]$NoEcho,

        [switch]$SuppressErrorOutput
    )

    $stdoutPath = [System.IO.Path]::GetTempFileName()
    $stderrPath = [System.IO.Path]::GetTempFileName()

    try {
        $process = Start-Process `
            -FilePath $FilePath `
            -ArgumentList $ArgumentList `
            -NoNewWindow `
            -Wait `
            -PassThru `
            -RedirectStandardOutput $stdoutPath `
            -RedirectStandardError $stderrPath

        $stdout = @(Get-Content -LiteralPath $stdoutPath -Encoding UTF8 -ErrorAction SilentlyContinue)
        $stderr = if ($SuppressErrorOutput) {
            @()
        } else {
            @(Get-Content -LiteralPath $stderrPath -Encoding UTF8 -ErrorAction SilentlyContinue)
        }

        $output = @($stdout) + @($stderr)
        $status = $process.ExitCode
    } finally {
        Remove-Item -LiteralPath $stdoutPath, $stderrPath -Force -ErrorAction SilentlyContinue
    }

    if (-not $NoEcho) {
        foreach ($line in $output) {
            Write-Host $line
        }
    }

    return [PSCustomObject]@{
        Status = $status
        Output = @($output)
    }
}

$NodeDir = Join-Path $env:ProgramFiles 'nodejs'
$Node = Resolve-BuildTool 'node.exe' @((Join-Path $NodeDir 'node.exe'))
$Npm = Resolve-BuildTool 'npm.cmd' @((Join-Path $NodeDir 'npm.cmd'))
$Npx = Resolve-BuildTool 'npx.cmd' @((Join-Path $NodeDir 'npx.cmd'))
$PowerShell = Resolve-BuildTool 'powershell.exe' @((Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'))

$ResolvedNodeDir = Split-Path -Parent $Node
if (($env:Path -split ';') -notcontains $ResolvedNodeDir) {
    $env:Path = "$ResolvedNodeDir;$env:Path"
}

Write-Host 'Generating icon constants...'
$icon = Invoke-BuildCommand -FilePath $Npm -ArgumentList @('run', 'build:icons')

if ($icon.Status -ne 0) {
    Write-Host "$ErrorMark Icon generation failed"
    exit 1
} else {
    Write-Host "$SuccessMark Icon constants generated"
}

Write-Host 'Running ESLint...'
$eslint = Invoke-BuildCommand -FilePath $Npm -ArgumentList @('run', 'lint')

$eslintSummary = $eslint.Output | Where-Object { $_ -match '\bproblems?\b' -and $_ -match '\(' } | Select-Object -First 1
if ($eslintSummary) {
    $eslintErrorCount = 0
    $eslintWarningCount = 0

    if ($eslintSummary -match '\((\d+)\s+errors?') {
        $eslintErrorCount = [int]$Matches[1]
    }

    if ($eslintSummary -match '(\d+)\s+warnings?') {
        $eslintWarningCount = [int]$Matches[1]
    }

    if ($eslintErrorCount -gt 0) {
        Write-Host "$ErrorMark ESLint found $eslintErrorCount errors"
        $BuildErrors++
    } elseif ($eslintWarningCount -gt 0) {
        Write-Host "$WarningMark ESLint found $eslintWarningCount warnings"
        $BuildWarnings++
    }
} elseif ($eslint.Status -ne 0) {
    Write-Host "$ErrorMark ESLint failed"
    $BuildErrors++
} else {
    Write-Host "$SuccessMark ESLint passed"
}

Write-Host "`nRunning Stylelint..."
$stylelint = Invoke-BuildCommand -FilePath $Npm -ArgumentList @('run', 'lint:styles')

if ($stylelint.Status -ne 0) {
    Write-Host "$ErrorMark Stylelint failed"
    $BuildErrors++
} else {
    Write-Host "$SuccessMark Stylelint passed"
}

Write-Host "`nChecking TypeScript types..."
$tsc = Invoke-BuildCommand -FilePath $Npx -ArgumentList @('tsc', '--noEmit', '--skipLibCheck')

if ($tsc.Status -ne 0) {
    Write-Host "$ErrorMark TypeScript type checking failed"
    $BuildErrors++
} else {
    Write-Host "$SuccessMark TypeScript types are valid"

    Write-Host 'Checking for unused imports...'
    $unused = Invoke-BuildCommand -FilePath $Npx -ArgumentList @('tsc', '--noEmit', '--noUnusedLocals', '--noUnusedParameters') -NoEcho
    $unusedCount = @($unused.Output | Where-Object { $_ -match 'is declared but|is defined but' }).Count

    if ($unusedCount -gt 0) {
        Write-Host "$WarningMark Warning: Found $unusedCount unused imports or variables"
        Write-Host "Run 'npx tsc --noEmit --noUnusedLocals --noUnusedParameters' to see details"
        $BuildWarnings++
    } else {
        Write-Host "$SuccessMark No unused imports found"
    }
}

Write-Host "`nChecking for dead code..."
$knip = Invoke-BuildCommand -FilePath $Npx -ArgumentList @('knip', '--no-progress') -NoEcho -SuppressErrorOutput
$deadFiles = @($knip.Output | Where-Object { $_ -match '^src/.*\.(ts|tsx)' }).Count
$deadExports = @($knip.Output | Where-Object { $_ -match 'function|class|interface|type|const' }).Count

if (($deadFiles -gt 0) -or ($deadExports -gt 0)) {
    Write-Host "$WarningMark Warning: Found dead code - $deadFiles unused files, $deadExports unused exports"
    Write-Host "Run 'npx knip' to see details"
    $BuildWarnings++
} else {
    Write-Host "$SuccessMark No dead code found"
}

Write-Host "`nChecking code formatting..."
$prettier = Invoke-BuildCommand -FilePath $Npm -ArgumentList @('run', 'format') -NoEcho

if ($prettier.Status -ne 0) {
    Write-Host "$ErrorMark Failed to fix code formatting"
    foreach ($line in $prettier.Output) {
        Write-Host $line
    }
    $BuildErrors++
} else {
    $unchangedLines = @($prettier.Output | Where-Object { $_ -match '\(unchanged\)' })

    if ($unchangedLines.Count -gt 0) {
        $changedCount = @(
            $prettier.Output | Where-Object {
                $_ -notmatch '\(unchanged\)' -and $_ -match '\.(ts|tsx|js|jsx|json|md|css).*[0-9]+ms$'
            }
        ).Count
        $unchangedCount = $unchangedLines.Count

        if ($changedCount -eq 0) {
            Write-Host "$SuccessMark Code formatting is already correct (all $unchangedCount files unchanged)"
        } else {
            Write-Host "$SuccessMark Code formatting fixed ($changedCount files updated, $unchangedCount unchanged)"
        }
    } else {
        Write-Host "$SuccessMark Code formatting complete"
    }
}

Write-Host "`nRunning unit tests..."
$tests = Invoke-BuildCommand -FilePath $Npm -ArgumentList @('run', 'test')

if ($tests.Status -ne 0) {
    Write-Host "$ErrorMark Unit tests failed"
    $BuildErrors++
} else {
    Write-Host "$SuccessMark Unit tests passed"
}

if (($BuildErrors -eq 0) -and ($BuildWarnings -eq 0)) {
    Write-Host "`nBuilding notebook-navigator..."
    $build = Invoke-BuildCommand -FilePath $Npm -ArgumentList @('run', 'build')

    if ($build.Status -eq 0) {
        Write-Host "$SuccessMark Build completed successfully"

        $localPowerShellScript = Join-Path $ScriptDir 'build-local.ps1'
        $localBashScript = Join-Path $ScriptDir 'build-local.sh'

        if (Test-Path -LiteralPath $localPowerShellScript) {
            Write-Host 'Running local PowerShell post-build script...'
            $localBuild = Invoke-BuildCommand -FilePath $PowerShell -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $localPowerShellScript)

            if ($localBuild.Status -ne 0) {
                Write-Host "$ErrorMark Local post-build script failed"
                exit 1
            }
        } elseif (Test-Path -LiteralPath $localBashScript) {
            $bashCommand = Get-Command 'bash' -ErrorAction SilentlyContinue

            if (-not $bashCommand) {
                Write-Host "$ErrorMark build-local.sh exists, but Bash is not available"
                exit 1
            }

            Write-Host 'Running local post-build script...'
            $localBuild = Invoke-BuildCommand -FilePath $bashCommand.Source -ArgumentList @($localBashScript)

            if ($localBuild.Status -ne 0) {
                Write-Host "$ErrorMark Local post-build script failed"
                exit 1
            }
        }

        Write-Host "`n=== Build Summary ==="
        Write-Host "$SuccessMark Build successful"
        Write-Host "$SuccessMark No warnings"
    } else {
        Write-Host "$ErrorMark Build failed"
        exit 1
    }
} else {
    Write-Host "`n=== Build Summary ==="
    if (($BuildErrors -gt 0) -and ($BuildWarnings -gt 0)) {
        Write-Host "$ErrorMark Build aborted due to $BuildErrors error(s) and $BuildWarnings warning(s)"
    } elseif ($BuildErrors -gt 0) {
        Write-Host "$ErrorMark Build aborted due to $BuildErrors error(s)"
    } else {
        Write-Host "$ErrorMark Build aborted due to $BuildWarnings warning(s)"
    }
    exit 1
}
