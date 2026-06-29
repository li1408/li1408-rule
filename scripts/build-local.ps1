. "$PSScriptRoot\local-tool-env.ps1"

Push-Location $script:ProjectRoot
try {
  & $script:PnpmCommand @script:PnpmBaseArgs run build @args
}
finally {
  Pop-Location
}
