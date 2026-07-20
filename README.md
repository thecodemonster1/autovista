# AutoVista 🚗

**Know the right price before you buy.**

AutoVista is a premium vehicle marketplace for Sri Lanka with **AI-powered price prediction**.
Every listing shows an instant market-value estimate from a machine-learning model trained on
**4,330 real ikman.lk adverts** and served through a Next.js API route.

Built with **Next.js 14 (App Router) · TypeScript · Tailwind CSS · ONNX** — with full light/dark
theming and a tested pricing engine.

<p align="center">
  <code>Next.js 14</code> ·
  <code>TypeScript</code> ·
  <code>Tailwind CSS</code> ·
  <code>ONNX Runtime</code> ·
  <code>Jest</code>
</p>

---

## ⚡ Quick start (one command)

You need **[Node.js 18.17+](https://nodejs.org)** installed (LTS 20 recommended). That's it —
no database, no API keys, no environment variables. Then:

```bash
git clone https://github.com/thecodemonster1/autovista.git autovista-app
cd autovista-app
./setup.sh --start
```

That single command checks your Node version, installs everything, and opens the app at
**http://localhost:3000**. 🎉

<details>
<summary><b>On Windows?</b> Use the PowerShell script instead</summary>

```powershell
git clone https://github.com/thecodemonster1/autovista.git autovista-app
cd autovista-app
.\setup.ps1 -Start
```

If Windows blocks the script, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`
once in the same window, then try again.
</details>

<details>
<summary><b>Prefer plain npm?</b> The manual way</summary>

```bash
npm install      # install dependencies
npm run dev      # start the app → http://localhost:3000
```
</details>

---

## 🛠️ The setup script explained

`./setup.sh` is safe to run as many times as you like — it never deletes your work.

| Command | What it does |
| ------- | ------------ |
| `./setup.sh` | Check Node, install dependencies, verify the AI model is present |
| `./setup.sh --start` | ...then launch the app at http://localhost:3000 |
| `./setup.sh --verify` | ...then run lint + tests + a production build |
| `./setup.sh --ml` | ...also create a Python env for retraining the model |
| `./setup.sh --all` | Everything: install + Python env + full verification |
| `./setup.sh --help` | Show the help text |

> Windows users: replace `./setup.sh` with `.\setup.ps1` and the flags with `-Start`, `-Verify`,
> `-Ml`, `-All`.

---

## 📜 Everyday commands

```bash
npm run dev        # start the dev server (hot reload) → http://localhost:3000
npm run build      # production build
npm start          # serve the production build
npm test           # run the unit test suite (Jest)
npm run lint       # ESLint (next/core-web-vitals + prettier)
npm run format     # auto-format with Prettier
npm run train      # (optional) retrain the AI model — see docs/ml-model.md
```

---

## ✨ Highlights

- 🤖 **Real trained model** — R² 0.94, ~5.8% median error, 636 KB ONNX artefact
- ⚡ **Fast inference** — ~0.01 ms per prediction
- 🎨 **Premium UI** — hero banner, snap carousel, vehicle cards, detail pages
- 🌗 **Light + dark mode** — persisted, applied before first paint (no flash)
- 🔎 **Search & filters** — debounced search plus brand/fuel/price/year filters and four sort orders
- ❤️ **Favourites** — bookmark listings on-device with cross-tab sync
- 🛟 **Graceful fallback** — a statistical estimator answers if the ONNX model is ever unavailable
- ✅ **Tested** — Jest + React Testing Library across components, hooks, pricing and the API route

---

## 🗺️ Take a tour

Once the app is running, explore:

| Page | URL | What you'll see |
| ---- | --- | --------------- |
| **Home** | `/` | Hero, featured carousel, and a "how it works" explainer |
| **Browse** | `/vehicles` | Debounced search, six filters, live result count |
| **Detail** | `/vehicles/[id]` | Full specs + the **AI price estimate badge** (below estimate / fair / negotiate) |
| **Estimate** | `/estimate` | A valuation form that returns a price, a typical range, and latency |
| **Favourites** | `/favourites` | Your device-local bookmarks |

---

## 📁 Project structure

```
autovista-app/
├── setup.sh / setup.ps1        # ← one-command setup (this repo's easy button)
├── docs/                       # Full documentation (setup, API, ML, deployment)
├── ml/
│   ├── data/                   # Training dataset (ikman.lk scrape)
│   └── train_model.py          # Cleaning → training → ONNX export pipeline
├── public/
│   └── model.onnx              # Trained gradient-boosting model (636 KB)
├── src/
│   ├── app/
│   │   ├── api/predict/        # Serverless inference endpoint
│   │   ├── vehicles/           # Listing + [id] detail pages
│   │   ├── estimate/           # Standalone valuation form
│   │   ├── favourites/         # Bookmarked listings
│   │   ├── layout.tsx          # Root layout, theme bootstrap, fonts
│   │   └── page.tsx            # Home page
│   ├── components/             # UI components (cards, carousel, filters…)
│   ├── hooks/                  # useVehiclePricePrediction, useFavourites, useDebounce
│   └── lib/                    # Types, encoders, inference, heuristic, validation
│       └── model-metadata.json # Feature-encoding contract emitted by training
└── .github/workflows/ci.yml    # Lint + format + test + build on every push/PR
```

---

## 📚 Documentation

| Document | Contents |
| -------- | -------- |
| [docs/setup.md](docs/setup.md) | Detailed environment setup and troubleshooting |
| [docs/architecture.md](docs/architecture.md) | System diagram, tech stack, data flow, design decisions |
| [docs/api.md](docs/api.md) | API reference for `POST /api/predict` |
| [docs/ml-model.md](docs/ml-model.md) | Training, preprocessing, ONNX export and optimisation |
| [docs/deployment.md](docs/deployment.md) | Vercel deployment, bundle budget, monitoring |

---

## ❓ Troubleshooting

| Problem | Fix |
| ------- | --- |
| `Permission denied` running `./setup.sh` | Run `chmod +x setup.sh` first (or use `bash setup.sh`) |
| `node: command not found` | Install Node.js 18.17+ from [nodejs.org](https://nodejs.org) |
| `Node … is too old` | Upgrade Node, or use `nvm install 20 && nvm use 20` |
| Port 3000 already in use | `npm run dev -- -p 3001` |
| Predictions say `"engine": "heuristic"` | The ONNX model didn't load — confirm `public/model.onnx` exists |

More fixes in [docs/setup.md](docs/setup.md#troubleshooting).

---

## 📄 Licence & disclaimer

Academic project. Price estimates are statistical indications, not formal valuations.
