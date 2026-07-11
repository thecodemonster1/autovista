# Environment Setup

Step-by-step guide to prepare a development environment for AutoVista.

## 1. Prerequisites

| Tool       | Version | Purpose                                |
| ---------- | ------- | -------------------------------------- |
| Node.js    | ≥ 18.17 | Next.js runtime and tooling            |
| npm        | ≥ 9     | Package management (bundled with Node) |
| Git        | any     | Version control                        |
| Vercel CLI | latest  | Deployment (optional for local work)   |
| Python     | ≥ 3.10  | Only needed to retrain the ML model    |

## 2. Install Node.js

**macOS (Homebrew):**

```bash
brew install node@20
node -v   # v20.x
npm -v    # 10.x
```

**Windows / Linux:** install from <https://nodejs.org> (choose the LTS release), or use
[nvm](https://github.com/nvm-sh/nvm):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
nvm use 20
```

## 3. Clone and install

```bash
git clone <your-repository-url> autovista-app
cd autovista-app
npm install
```

## 4. Run the development server

```bash
npm run dev
```

Open <http://localhost:3000>. The app hot-reloads on file changes.

## 5. Verify the toolchain

```bash
npm run lint          # ESLint — should report no issues
npm run format:check  # Prettier — should report all files formatted
npm test              # Jest — all suites should pass
npm run build         # Production build — should complete without errors
```

> **Note:** under Jest, the ONNX WASM runtime cannot initialise (Jest's sandbox
> forbids dynamic WASM imports), so API-route tests exercise the heuristic
> fallback path. This is by design — the fallback is part of the contract.

## 6. Install the Vercel CLI (for deployment)

```bash
npm install -g vercel
vercel login
```

See [deployment.md](deployment.md) for the full deployment guide.

## 7. Python environment (optional — model retraining)

Only needed if you want to retrain `public/model.onnx`:

```bash
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install numpy pandas scikit-learn skl2onnx onnx onnxruntime
python3 ml/train_model.py
```

The training script reads `ml/data/ikman_clean_master.csv` and rewrites both
`public/model.onnx` and `src/lib/model-metadata.json`. See
[ml-model.md](ml-model.md) for the Google Colab workflow.

## 8. Environment variables

AutoVista needs **no environment variables** to run: the model ships with the
repository and there is no database. Optional variables are documented in
[deployment.md](deployment.md).

## Troubleshooting

| Symptom                                    | Fix                                                      |
| ------------------------------------------ | -------------------------------------------------------- |
| `next: command not found`                  | Run `npm install` in the project root                    |
| Port 3000 already in use                   | `npm run dev -- -p 3001`                                 |
| Predictions return `"engine": "heuristic"` | Confirm `public/model.onnx` exists; retrain if necessary |
| Type errors after retraining               | Ensure `src/lib/model-metadata.json` was regenerated too |
