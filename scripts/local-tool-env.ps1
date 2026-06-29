$ErrorActionPreference = "Stop"

$script:ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

$paths = @(
  ".cache",
  ".config",
  ".corepack",
  ".npm-cache",
  ".pnpm-global-bin",
  ".tmp"
)

foreach ($path in $paths) {
  New-Item -ItemType Directory -Force -Path (Join-Path $script:ProjectRoot $path) | Out-Null
}

$env:COREPACK_HOME = Join-Path $script:ProjectRoot ".corepack"
$env:PNPM_HOME = Join-Path $script:ProjectRoot ".pnpm-global-bin"
$env:NPM_CONFIG_CACHE = Join-Path $script:ProjectRoot ".npm-cache"
$env:TEMP = Join-Path $script:ProjectRoot ".tmp"
$env:TMP = Join-Path $script:ProjectRoot ".tmp"
$env:XDG_CACHE_HOME = Join-Path $script:ProjectRoot ".cache"
$env:XDG_CONFIG_HOME = Join-Path $script:ProjectRoot ".config"

$env:PATH = "$env:PNPM_HOME;$env:PATH"

$script:LocalPnpm = Join-Path $script:ProjectRoot ".tools\pnpm8\node_modules\.bin\pnpm.cmd"
if (Test-Path -LiteralPath $script:LocalPnpm) {
  $script:PnpmCommand = $script:LocalPnpm
  $script:PnpmBaseArgs = @()
} else {
  $script:PnpmCommand = "corepack"
  $script:PnpmBaseArgs = @("pnpm")
}
