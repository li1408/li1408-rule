. "$PSScriptRoot\local-tool-env.ps1"

Push-Location $script:ProjectRoot
try {
  & $script:PnpmCommand @script:PnpmBaseArgs run dev --host 127.0.0.1 @args
}
finally {
  Pop-Location
}
