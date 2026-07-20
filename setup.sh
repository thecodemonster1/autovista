#!/usr/bin/env bash
#
# AutoVista — one-command setup script (macOS / Linux / WSL)
# ---------------------------------------------------------------------------
# Usage:
#   ./setup.sh              Check prerequisites and install dependencies
#   ./setup.sh --start      ...then start the dev server (http://localhost:3000)
#   ./setup.sh --verify     ...then run lint + tests + production build
#   ./setup.sh --ml         ...also set up the Python env for model retraining
#   ./setup.sh --all        Do everything: install + ml + verify
#   ./setup.sh --help       Show this help
#
# Safe to run repeatedly — it is idempotent and never deletes your work.
# ---------------------------------------------------------------------------

set -euo pipefail

# ---- pretty output --------------------------------------------------------
if [ -t 1 ]; then
  BOLD=$'\033[1m'; DIM=$'\033[2m'; RED=$'\033[31m'; GREEN=$'\033[32m'
  YELLOW=$'\033[33m'; BLUE=$'\033[34m'; RESET=$'\033[0m'
else
  BOLD=""; DIM=""; RED=""; GREEN=""; YELLOW=""; BLUE=""; RESET=""
fi

step()  { printf "\n${BOLD}${BLUE}▶ %s${RESET}\n" "$1"; }
ok()    { printf "  ${GREEN}✓${RESET} %s\n" "$1"; }
warn()  { printf "  ${YELLOW}!${RESET} %s\n" "$1"; }
die()   { printf "\n${RED}✗ %s${RESET}\n" "$1" >&2; exit 1; }

# ---- flags ----------------------------------------------------------------
DO_START=0; DO_VERIFY=0; DO_ML=0
for arg in "$@"; do
  case "$arg" in
    --start|--dev) DO_START=1 ;;
    --verify)      DO_VERIFY=1 ;;
    --ml)          DO_ML=1 ;;
    --all)         DO_ML=1; DO_VERIFY=1 ;;
    --help|-h)
      sed -n '3,14p' "$0" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *) die "Unknown option: $arg  (try ./setup.sh --help)" ;;
  esac
done

# Always run from the script's own directory (the project root).
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

printf "${BOLD}🚗 AutoVista setup${RESET}\n"
printf "${DIM}   Next.js 14 · TypeScript · Tailwind · ONNX price prediction${RESET}\n"

# ---- 1. Node.js -----------------------------------------------------------
step "Checking Node.js (requires >= 18.17.0)"
command -v node >/dev/null 2>&1 || die \
"Node.js is not installed.
   Install the LTS release from https://nodejs.org
   or with a version manager:  nvm install 20 && nvm use 20"

NODE_RAW="$(node -v)"                       # e.g. v24.14.1
NODE_VER="${NODE_RAW#v}"
NODE_MAJOR="${NODE_VER%%.*}"
NODE_REST="${NODE_VER#*.}"
NODE_MINOR="${NODE_REST%%.*}"
if [ "$NODE_MAJOR" -lt 18 ] || { [ "$NODE_MAJOR" -eq 18 ] && [ "$NODE_MINOR" -lt 17 ]; }; then
  die "Node ${NODE_VER} is too old. Please install Node >= 18.17.0 (LTS 20 recommended)."
fi
ok "Node ${NODE_VER}"

command -v npm >/dev/null 2>&1 || die "npm not found (it ships with Node.js — reinstall Node)."
ok "npm $(npm -v)"

# ---- 2. Install dependencies ----------------------------------------------
step "Installing dependencies"
if [ -f package-lock.json ]; then
  # npm ci is faster and reproducible; fall back to install if the lockfile drifts.
  npm ci || { warn "npm ci failed — falling back to npm install"; npm install; }
else
  npm install
fi
ok "node_modules ready"

# ---- 3. Sanity check the model artefact -----------------------------------
step "Checking the AI model artefact"
if [ -f public/model.onnx ]; then
  ok "public/model.onnx present ($(du -h public/model.onnx | cut -f1))"
else
  warn "public/model.onnx missing — predictions will use the heuristic fallback."
  warn "Retrain it with:  ./setup.sh --ml"
fi

# ---- 4. Optional: Python env for model retraining -------------------------
if [ "$DO_ML" -eq 1 ]; then
  step "Setting up Python environment (model retraining)"
  PY=""
  for c in python3 python; do command -v "$c" >/dev/null 2>&1 && { PY="$c"; break; }; done
  [ -n "$PY" ] || die "Python 3.10+ is required for --ml. Install from https://python.org"
  ok "Using $($PY --version 2>&1)"

  if [ ! -d ml/.venv ]; then
    "$PY" -m venv ml/.venv
    ok "Created ml/.venv"
  fi
  # shellcheck disable=SC1091
  . ml/.venv/bin/activate
  pip install --quiet --upgrade pip
  pip install --quiet -r ml/requirements.txt
  ok "Python dependencies installed"
  printf "  ${DIM}Retrain anytime:  source ml/.venv/bin/activate && npm run train${RESET}\n"
fi

# ---- 5. Optional: verify the toolchain ------------------------------------
if [ "$DO_VERIFY" -eq 1 ]; then
  step "Verifying the toolchain (lint · test · build)"
  npm run lint
  ok "Lint passed"
  npm test
  ok "Tests passed"
  npm run build
  ok "Production build succeeded"
fi

# ---- Done -----------------------------------------------------------------
printf "\n${GREEN}${BOLD}✅ Setup complete!${RESET}\n"

if [ "$DO_START" -eq 1 ]; then
  step "Starting the dev server → http://localhost:3000  (Ctrl+C to stop)"
  exec npm run dev
else
  cat <<EOF

  ${BOLD}Next steps${RESET}
    npm run dev      Start the app at ${BLUE}http://localhost:3000${RESET}
    npm test         Run the test suite
    npm run build    Create a production build

  ${DIM}Tip: ./setup.sh --start does the install AND launches the app in one go.${RESET}
EOF
fi
