<#
  AutoVista — one-command setup script (Windows PowerShell)
  ---------------------------------------------------------------------------
  Usage:
    .\setup.ps1              Check prerequisites and install dependencies
    .\setup.ps1 -Start       ...then start the dev server (http://localhost:3000)
    .\setup.ps1 -Verify      ...then run lint + tests + production build
    .\setup.ps1 -Ml          ...also set up the Python env for model retraining
    .\setup.ps1 -All         Do everything: install + ml + verify

  If PowerShell blocks the script, run this once in the same window:
    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  ---------------------------------------------------------------------------
#>
param(
  [switch]$Start,
  [switch]$Verify,
  [switch]$Ml,
  [switch]$All
)

$ErrorActionPreference = "Stop"
if ($All) { $Ml = $true; $Verify = $true }

function Step($m) { Write-Host "`n> $m" -ForegroundColor Blue }
function Ok($m)   { Write-Host "  [ok] $m" -ForegroundColor Green }
function Warn($m) { Write-Host "  [!] $m"  -ForegroundColor Yellow }
function Die($m)  { Write-Host "`nx $m" -ForegroundColor Red; exit 1 }

# Run from the project root (this script's folder).
Set-Location -Path $PSScriptRoot

Write-Host "AutoVista setup" -ForegroundColor White
Write-Host "  Next.js 14 - TypeScript - Tailwind - ONNX price prediction" -ForegroundColor DarkGray

# ---- 1. Node.js -----------------------------------------------------------
Step "Checking Node.js (requires >= 18.17.0)"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Die "Node.js is not installed. Install the LTS release from https://nodejs.org"
}
$nodeRaw = (node -v).TrimStart("v")           # e.g. 24.14.1
$parts   = $nodeRaw.Split(".")
$maj = [int]$parts[0]; $min = [int]$parts[1]
if ($maj -lt 18 -or ($maj -eq 18 -and $min -lt 17)) {
  Die "Node $nodeRaw is too old. Please install Node >= 18.17.0 (LTS 20 recommended)."
}
Ok "Node $nodeRaw"
Ok "npm $(npm -v)"

# ---- 2. Install dependencies ----------------------------------------------
Step "Installing dependencies"
if (Test-Path package-lock.json) {
  try { npm ci } catch { Warn "npm ci failed - falling back to npm install"; npm install }
} else {
  npm install
}
Ok "node_modules ready"

# ---- 3. Model artefact ----------------------------------------------------
Step "Checking the AI model artefact"
if (Test-Path public\model.onnx) { Ok "public\model.onnx present" }
else { Warn "public\model.onnx missing - predictions will use the heuristic fallback. Retrain with: .\setup.ps1 -Ml" }

# ---- 4. Optional: Python env ----------------------------------------------
if ($Ml) {
  Step "Setting up Python environment (model retraining)"
  $py = (Get-Command python -ErrorAction SilentlyContinue) ?? (Get-Command python3 -ErrorAction SilentlyContinue)
  if (-not $py) { Die "Python 3.10+ is required for -Ml. Install from https://python.org" }
  if (-not (Test-Path ml\.venv)) { & $py.Source -m venv ml\.venv; Ok "Created ml\.venv" }
  & ml\.venv\Scripts\python.exe -m pip install --quiet --upgrade pip
  & ml\.venv\Scripts\python.exe -m pip install --quiet -r ml\requirements.txt
  Ok "Python dependencies installed"
  Write-Host "  Retrain anytime:  ml\.venv\Scripts\Activate.ps1 ; npm run train" -ForegroundColor DarkGray
}

# ---- 5. Optional: verify --------------------------------------------------
if ($Verify) {
  Step "Verifying the toolchain (lint - test - build)"
  npm run lint;  Ok "Lint passed"
  npm test;      Ok "Tests passed"
  npm run build; Ok "Production build succeeded"
}

Write-Host "`nSetup complete!" -ForegroundColor Green
if ($Start) {
  Step "Starting the dev server -> http://localhost:3000  (Ctrl+C to stop)"
  npm run dev
} else {
  Write-Host "`n  Next steps" -ForegroundColor White
  Write-Host "    npm run dev      Start the app at http://localhost:3000"
  Write-Host "    npm test         Run the test suite"
  Write-Host "    npm run build    Create a production build"
  Write-Host "`n  Tip: .\setup.ps1 -Start installs AND launches the app in one go." -ForegroundColor DarkGray
}
