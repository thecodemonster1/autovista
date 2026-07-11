# API Reference

AutoVista exposes a single API route. All other pages are server-rendered.

## `POST /api/predict`

Predict the market price (LKR) of a vehicle from its specification.

- **Runtime:** Node.js serverless function (`runtime = 'nodejs'`)
- **Content type:** `application/json` (request and response)
- **Authentication:** none (public)

### Request body

| Field          | Type    | Constraints                                        |
| -------------- | ------- | -------------------------------------------------- |
| `brand`        | string  | non-empty, ≤ 80 chars                              |
| `model`        | string  | non-empty, ≤ 80 chars                              |
| `year`         | integer | 1980 … current year + 1                            |
| `condition`    | string  | non-empty, ≤ 80 chars (e.g. `Used`, `Brand New`)   |
| `transmission` | string  | non-empty, ≤ 80 chars (e.g. `Automatic`, `Manual`) |
| `fuelType`     | string  | non-empty, ≤ 80 chars (e.g. `Petrol`, `Hybrid`)    |
| `engineCc`     | number  | 0 … 8000 (motor kW for electric vehicles)          |
| `mileageKm`    | number  | 0 … 1,000,000                                      |

Categorical values the model was not trained on are **not rejected** — they are
mapped onto the trained fallback buckets (`Other brand`, `Other model`, `Used`,
`Automatic`, `Petrol`). The canonical category lists live in
`src/lib/model-metadata.json`.

### Example request

```bash
curl -X POST http://localhost:3000/api/predict \
  -H 'Content-Type: application/json' \
  -d '{
    "brand": "Toyota",
    "model": "Aqua",
    "year": 2015,
    "condition": "Used",
    "transmission": "Automatic",
    "fuelType": "Hybrid",
    "engineCc": 1500,
    "mileageKm": 95000
  }'
```

### Success response — `200 OK`

```json
{
  "predictedPrice": 8342117,
  "currency": "LKR",
  "engine": "onnx",
  "latencyMs": 0.8
}
```

| Field            | Type   | Meaning                                                          |
| ---------------- | ------ | ---------------------------------------------------------------- |
| `predictedPrice` | number | Estimated market price in rupees, rounded to the nearest rupee   |
| `currency`       | string | Always `"LKR"`                                                   |
| `engine`         | string | `"onnx"` (trained model) or `"heuristic"` (statistical fallback) |
| `latencyMs`      | number | Server-side inference time in milliseconds                       |

### Error responses

**`400 Bad Request` — malformed JSON**

```json
{ "error": "Request body must be valid JSON." }
```

**`400 Bad Request` — validation failure**

```json
{
  "error": "Invalid prediction input.",
  "details": [
    "\"year\" must be an integer between 1980 and 2027.",
    "\"mileageKm\" must be a number between 0 and 1000000."
  ]
}
```

**`405 Method Not Allowed`** — any verb other than `POST` (handled by Next.js).

### Client usage

Use the provided hook rather than calling `fetch` directly:

```tsx
'use client';
import { useVehiclePricePrediction } from '@/hooks/useVehiclePricePrediction';

function Example(): React.JSX.Element {
  const { status, result, error, predict } = useVehiclePricePrediction();

  return (
    <button
      onClick={() =>
        predict({
          brand: 'Toyota',
          model: 'Aqua',
          year: 2015,
          condition: 'Used',
          transmission: 'Automatic',
          fuelType: 'Hybrid',
          engineCc: 1500,
          mileageKm: 95000,
        })
      }
    >
      {status === 'loading' ? 'Estimating…' : 'Estimate'}
      {result && <> → Rs {result.predictedPrice.toLocaleString('en-GB')}</>}
      {error && <> ⚠ {error}</>}
    </button>
  );
}
```

The hook aborts superseded requests automatically, so it is safe to call on
every form change.

### Performance characteristics

- ONNX graph execution: **≈ 0.01 ms** per row (634 KB gradient-boosting model)
- End-to-end handler time (validation + encoding + inference): **≈ 1 ms** warm
- Cold start adds one-off model load (~50 ms read + session build) per serverless instance

### Failure semantics

The endpoint never returns a 5xx for a well-formed request: if the ONNX
session cannot be created or produces a non-finite value, the deterministic
heuristic estimator answers instead and `engine` is set to `"heuristic"`.
Monitor the ratio of `heuristic` responses in production — a sudden rise means
the model artefact is missing from the deployment (see
[deployment.md](deployment.md)).
