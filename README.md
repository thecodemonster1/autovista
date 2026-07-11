# AutoVista 🚗

**Know the right price before you buy.** AutoVista is a premium vehicle marketplace for Sri Lanka
with AI-powered price prediction. Every listing carries an instant market-value estimate produced
by a gradient-boosting model trained on **4,330 real ikman.lk advertisements** and served as an
**ONNX** model through a Next.js serverless function.

Built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS**, with full light/dark theming,
the Inter typeface, Heroicons and Font Awesome iconography.

## Highlights

- 🤖 **Real trained model** — R² 0.94 (log-price), 5.8 % median error, 634 KB ONNX artefact
- ⚡ **Fast inference** — ~0.01 ms per prediction, far below the 50 ms serverless / 30 ms browser targets
- 🎨 **Premium marketplace UI** — hero banner, smooth snap carousel, vehicle cards, detail pages
- 🌗 **Light + dark mode** — persisted to `localStorage`, applied before first paint (no flash)
- 🔎 **Search & filters** — debounced search, brand/fuel/price/year filters, four sort orders
- ❤️ **Favourites** — bookmark listings on-device with cross-tab synchronisation
- 🛟 **Graceful degradation** — a deterministic statistical estimator answers if the ONNX model is unavailable
- ✅ **Tested** — Jest + React Testing Library across components, hooks, the pricing engine and the API route

## Get started

```bash
npm install        # install dependencies
npm run dev        # start the dev server → http://localhost:3000
npm test           # run the unit test suite
npm run lint       # ESLint (next/core-web-vitals + prettier)
npm run build      # production build
npm run train      # (optional) retrain the ONNX model from ml/data/*.csv
```

Requires Node.js ≥ 18.17. Retraining additionally requires Python 3.10+ with
`pandas scikit-learn skl2onnx onnx onnxruntime` (see [docs/ml-model.md](docs/ml-model.md)).

## Documentation

| Document                                     | Contents                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------- |
| [docs/setup.md](docs/setup.md)               | Environment setup — Node, npm, Vercel CLI, Python tooling               |
| [docs/architecture.md](docs/architecture.md) | System diagram, tech stack, data flow and key design decisions          |
| [docs/api.md](docs/api.md)                   | API reference for `POST /api/predict` with examples and error contracts |
| [docs/ml-model.md](docs/ml-model.md)         | Training in Google Colab, preprocessing, ONNX export and optimisation   |
| [docs/deployment.md](docs/deployment.md)     | Vercel deployment, bundle-size budget, monitoring                       |

## Project structure

```
autovista-app/
├── docs/                        # Ready-to-publish Markdown documentation
├── ml/
│   ├── data/                    # Training dataset (ikman.lk scrape)
│   └── train_model.py           # Cleaning → training → ONNX export pipeline
├── public/
│   └── model.onnx               # Trained gradient-boosting model (634 KB)
├── src/
│   ├── app/
│   │   ├── api/predict/         # Serverless inference endpoint
│   │   ├── vehicles/            # Listing + [id] detail pages
│   │   ├── estimate/            # Standalone valuation form
│   │   ├── favourites/          # Bookmarked listings
│   │   ├── layout.tsx           # Root layout, theme bootstrap, fonts
│   │   └── page.tsx             # Home: hero, carousel, how-it-works
│   ├── components/              # UI components (cards, carousel, filters…)
│   ├── hooks/                   # useVehiclePricePrediction, useFavourites, useDebounce
│   └── lib/                     # Types, encoders, inference, heuristic, validation
│       └── model-metadata.json  # Feature-encoding contract emitted by training
├── .github/workflows/ci.yml     # Lint + format + test + build on push/PR
└── jest.config.mjs              # Jest + React Testing Library configuration
```

## Feature tour

- **Home** — gradient hero with trust highlights, a snap-scroll carousel of featured listings,
  a three-step "how it works" explainer, brand shortcut chips and a seller call-to-action.
- **Browse** (`/vehicles`) — debounced search across title/brand/model/location, six filter
  controls, live result count and an empty state with recovery hints.
- **Detail** (`/vehicles/[id]`) — full specification grid, description, advertised price and the
  **AI price estimate badge**, which labels each listing _below estimate_, _fairly priced_ or
  _worth negotiating_.
- **Estimate** (`/estimate`) — valuation form whose brand/model options come straight from the
  model metadata, returning a price with a typical-range band and inference latency.
- **Favourites** (`/favourites`) — device-local bookmarks with skeleton loading and empty state.

## Licence & disclaimer

Academic project. Price estimates are statistical indications, not formal valuations.
