# Architecture

## System overview

AutoVista is a self-contained Next.js 14 application. There is no external
database or model server: the vehicle catalogue is a typed in-memory module,
and the price model is an ONNX artefact served inside the Next.js serverless
function via `onnxruntime-web`'s WASM backend.

```
┌─────────────────────────────── Browser ────────────────────────────────┐
│                                                                        │
│  React 18 (App Router client components)                              │
│  ├── ThemeProvider ── persists light/dark to localStorage             │
│  ├── useFavourites ── bookmarks in localStorage + cross-tab sync      │
│  ├── useDebounce ──── throttles the search box                        │
│  └── useVehiclePricePrediction                                        │
│         │  POST /api/predict  { brand, model, year, … }               │
└─────────┼──────────────────────────────────────────────────────────────┘
          ▼
┌──────────────────────── Vercel Serverless (Node.js) ───────────────────┐
│  /api/predict route handler                                            │
│  ├── validation.ts ── shape + range checks → 400 with field errors    │
│  ├── encoders.ts ──── ordinal encoding from model-metadata.json       │
│  ├── inference.ts ─── onnxruntime-web (WASM) session, cached warm     │
│  │        └── public/model.onnx  (GradientBoosting, 634 KB)           │
│  └── heuristic.ts ─── deterministic fallback estimator                │
└─────────────────────────────────────────────────────────────────────────┘
          ▲
          │  offline, at development time
┌─────────┴───────────────────────────────────────────────────────────────┐
│  ml/train_model.py (Python / Colab)                                     │
│  CSV → clean → ordinal encode → GradientBoostingRegressor(log1p price) │
│      → skl2onnx export → public/model.onnx                             │
│      → src/lib/model-metadata.json  (the shared encoding contract)     │
└──────────────────────────────────────────────────────────────────────────┘
```

## Tech stack

| Layer       | Choice                                   | Why                                                            |
| ----------- | ---------------------------------------- | -------------------------------------------------------------- |
| Framework   | Next.js 14, App Router, TypeScript       | Server components for static pages, route handlers for the API |
| Styling     | Tailwind CSS, class-based dark mode      | Utility-first, tiny CSS output, smooth theme transitions       |
| Typography  | Inter (400/500/600/700) via Google Fonts | Premium, highly legible UI face                                |
| Icons       | Heroicons + Font Awesome                 | Heroicons for UI actions, Font Awesome for domain glyphs       |
| ML serving  | onnxruntime-web (WASM backend)           | One runtime usable in both serverless Node and the browser     |
| ML training | scikit-learn GradientBoostingRegressor   | Strong tabular accuracy, converts cleanly to compact ONNX      |
| Testing     | Jest + React Testing Library             | Component, hook, engine and API-route coverage                 |

## Key design decisions

### 1. The metadata file is the encoding contract

`ml/train_model.py` writes `src/lib/model-metadata.json` containing the sorted
category lists, feature order, fallback buckets, valid ranges and evaluation
metrics. The TypeScript encoder (`src/lib/encoders.ts`) performs index lookups
against those same lists. Retraining the model therefore **never requires a
code change** — the JSON and the ONNX file travel together.

### 2. Unknown categories degrade, they don't fail

The training pipeline collapses rare brands/models into explicit `Other brand`
/ `Other model` buckets. At inference time, any value the model has never seen
maps onto those buckets, so the API keeps answering sensibly as the market
evolves (new brands, new models).

### 3. Two-tier inference

`inference.ts` caches the ONNX session per warm serverless instance. If the
model file or WASM runtime is unavailable, a deterministic depreciation-curve
heuristic answers instead, and the response's `engine` field reports which
path served the request. The UI surfaces this transparently ("ONNX model" vs
"Statistical estimator").

### 4. Log-price target

Prices span Rs 500k → Rs 300M, so the model trains on `log1p(price)` and the
server applies `expm1` to its output (`invertTargetTransform`). This keeps
percentage error roughly uniform across the price range. The transform name is
recorded in the metadata so consumers never hard-code it.

### 5. Server-rendered pages, client islands

Home, listing and detail pages are server components. Interactivity lives in
focused client components (carousel, filters, favourites button, prediction
badge/form), keeping the JavaScript bundle small. The listing page reads
`?brand=` server-side and passes it as an initial filter, avoiding a
`useSearchParams` Suspense boundary.

## Data flow for a prediction

1. A client component calls `predict(input)` from `useVehiclePricePrediction`.
2. The hook aborts any in-flight request, then `POST`s JSON to `/api/predict`.
3. The route handler validates shape and ranges (400 + field messages on failure).
4. `encodeFeatures` produces a `Float32Array` of length 8 using the metadata lists.
5. `onnxruntime-web` runs the graph (≈0.01 ms); output is `expm1`-inverted and rounded.
6. The handler responds `{ predictedPrice, currency, engine, latencyMs }`.
7. The hook stores the result; the badge compares it with the advertised price.

## Directory map

See the [README](../README.md#project-structure) for the annotated tree.
