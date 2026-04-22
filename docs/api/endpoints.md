# API Endpoints

## Health

- `GET /health`

## Capture

- `POST /api/rf/captures`
- `POST /api/rf/captures/start`
- `GET /api/rf/captures/status?job_id=...`
- `GET /api/rf/captures`
- `GET /api/rf/captures/{id}`

## Dataset

- `GET /api/rf/datasets/train`
- `GET /api/rf/datasets/val`
- `GET /api/rf/datasets/stats`
- `POST /api/rf/datasets/delete`

## Training / Retraining

- `POST /api/rf/training/start`
- `POST /api/rf/training/retrain`
- `GET /api/rf/training/status?job_id=...`
- `GET /api/rf/training/models`
- `GET /api/rf/training/dashboard`

## Validation

- `POST /api/rf/validation/run`
- `POST /api/rf/validation/start`
- `GET /api/rf/validation/status?job_id=...`
- `GET /api/rf/validation/reports`

## Inference / Prediction

- `POST /api/rf/inference/classify`
- `POST /api/rf/inference/verify`
- `GET /api/rf/inference/predict/captures`
- `POST /api/rf/inference/predict/start`
- `GET /api/rf/inference/predict/status?job_id=...`

## Model registry

- `GET /api/rf/models/current`
- `GET /api/rf/models/{version}`
