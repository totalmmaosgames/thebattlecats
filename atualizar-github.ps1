# ============================================================
#  ATUALIZAR GITHUB - The Battle Gatos
# ============================================================
#
#  COMO USAR:
#  1. Abra o arquivo "token.txt" (na mesma pasta deste script)
#  2. Apague a linha e cole o SEU token do GitHub
#  3. De um clique duplo neste script (ou botao direito > Executar com PowerShell)
#
#  * Se o token expirar, e so trocar no token.txt e rodar de novo!
#
#  ============================================================

$repo    = "totalmmaosgames/thebattlecats"
$site    = "https://totalmmaosgames.github.io/thebattlecats/"
$tokenFile = Join-Path $PSScriptRoot "token.txt"

if (-not (Test-Path $tokenFile)) {
    Write-Host "ERRO: Crie o arquivo token.txt com seu token do GitHub!" -ForegroundColor Red
    Read-Host "Pressione Enter para fechar"
    exit 1
}

$Token = (Get-Content $tokenFile -Raw).Trim()

if (-not $Token) {
    Write-Host "ERRO: O token.txt esta vazio! Cole seu token la dentro." -ForegroundColor Red
    Read-Host "Pressione Enter para fechar"
    exit 1
}

# ============================================================
#  Daqui pra baixo nao precisa mexer
# ============================================================

try { $null = git --version }
catch {
    Write-Host "ERRO: Git nao encontrado! Instale em git-scm.com" -ForegroundColor Red
    Read-Host "Pressione Enter para fechar"
    exit 1
}

git init 2>&1 | Out-Null
git checkout -b main 2>&1 | Out-Null
git remote set-url origin "https://totalmmaosgames:$Token@github.com/$repo.git"

git add -A 2>&1 | Out-Null
$commitOutput = git commit -m "Update - $(Get-Date -Format 'dd/MM/yyyy HH:mm')" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Nenhuma alteracao nova para enviar." -ForegroundColor Yellow
    Write-Host "Site: $site" -ForegroundColor Cyan
    Read-Host "Pressione Enter para fechar"
    exit 0
}

Write-Host "Enviando..." -ForegroundColor Cyan
$null = git push -f origin main 2>&1
$pushOk = $LASTEXITCODE

if ($pushOk -eq 0) {
    Write-Host ""
    Write-Host "SUCESSO! Jogo atualizado!" -ForegroundColor Green
    Write-Host "Site: $site" -ForegroundColor Cyan
    Write-Host "Aguarde 1-2 min e atualize com Ctrl+F5 no navegador." -ForegroundColor Yellow
} else {
    Write-Host "ERRO ao enviar. Verifique se o token no token.txt ainda e valido." -ForegroundColor Red
    Write-Host "Se o token expirou, crie um novo em:" -ForegroundColor Yellow
    Write-Host "github.com/settings/tokens" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Pressione Enter para fechar"
