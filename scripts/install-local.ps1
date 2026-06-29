. "$PSScriptRoot\local-tool-env.ps1"

Push-Location $script:ProjectRoot
try {
  & $script:PnpmCommand @script:PnpmBaseArgs install @args
}
finally {
  Pop-Location
}
