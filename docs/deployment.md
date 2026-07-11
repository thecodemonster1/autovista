# Deployment (Vercel)

AutoVista targets Vercel serverless functions. No database, no environment
variables — the model artefact deploys with the repository.

## 1. One-time setup

```bash
npm install -g vercel
vercel login
```

## 2. Deploy

From the project root:

```bash
vercel          # preview deployment
vercel --prod   # production deployment
```

Or connect the GitHub repository at <https://vercel.com/new> for automatic
deployments on every push (recommended — pairs with the CI workflow in
`.github/workflows/ci.yml`).

Vercel auto-detects Next.js; no custom build settings are required
(`npm run build`, output handled by the framework preset).

## 3. How the model ships

Two settings in [`next.config.mjs`](../next.config.mjs) make ONNX work on
serverless:

```js
experimental: {
  // Keep the WASM runtime out of the webpack bundle
  serverComponentsExternalPackages: ['onnxruntime-web'],
  // Force-include runtime files the file tracer cannot see statically
  outputFileTracingIncludes: {
    '/api/predict': ['./public/model.onnx', './node_modules/onnxruntime-web/dist/*.wasm'],
  },
},
```

- `public/model.onnx` is read with `fs` at cold start and cached per instance.
- The `.wasm` binaries are resolved by onnxruntime-web at session creation.

## 4. Bundle-size budget (< 10 MB)

| Item                         | Size         |
| ---------------------------- | ------------ |
| `model.onnx`                 | 0.6 MB       |
| onnxruntime-web WASM binary  | ~5 MB        |
| Route handler + libs         | < 1 MB       |
| **Total function footprint** | **< 7 MB** ✓ |

Checks:

```bash
ls -lh public/model.onnx                 # model artefact
du -sh .next/server/app/api/predict      # traced function output (after build)
vercel inspect <deployment-url>          # per-function sizes on Vercel
```

If you retrain with a much larger model, reduce `n_estimators`/`max_depth`
before reaching for quantisation (see [ml-model.md](ml-model.md#7-inference-optimisation)).

## 5. Environment variables

None are required. Optional conventions if you extend the app:

| Variable               | Purpose                            | Where         |
| ---------------------- | ---------------------------------- | ------------- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for SEO/social cards | Project → Env |

Set via dashboard (Project → Settings → Environment Variables) or CLI:

```bash
vercel env add NEXT_PUBLIC_SITE_URL production
```

## 6. Verifying a deployment

```bash
curl -X POST https://<your-app>.vercel.app/api/predict \
  -H 'Content-Type: application/json' \
  -d '{"brand":"Toyota","model":"Aqua","year":2015,"condition":"Used","transmission":"Automatic","fuelType":"Hybrid","engineCc":1500,"mileageKm":95000}'
```

Confirm the response contains `"engine": "onnx"`. If it says `"heuristic"`,
the model file did not ship — check the `outputFileTracingIncludes` paths and
that `public/model.onnx` is committed.

## 7. Monitoring

- **Function logs** — Vercel dashboard → Deployment → Functions → `/api/predict`.
  The inference wrapper logs a `console.warn` whenever it falls back to the
  heuristic engine; alert on that string.
- **Latency** — every response carries `latencyMs`; the target is ≤ 50 ms and
  warm invocations measure ≈ 1 ms. Watch p99 for cold-start spikes.
- **Speed Insights / Analytics** — enable in the Vercel dashboard for Core Web
  Vitals on the marketplace pages.
- **CI** — `.github/workflows/ci.yml` runs lint, format check, tests and a
  production build on every push and pull request; keep it green before
  promoting to production.

## 8. Rollbacks

Every deployment is immutable. Roll back from the dashboard (Deployments →
… → Promote to Production) or:

```bash
vercel rollback <deployment-url>
```

Because the model and metadata are versioned with the code, rolling back the
deployment also rolls back the model — there is no separate model registry to
coordinate.
