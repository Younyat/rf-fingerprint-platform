# Backend README

## Requisitos

- Python: `C:\Users\Usuario\radioconda\python.exe`
- Dependencias: `..\requirements.txt`

## Arranque

```powershell
cd C:\Users\Usuario\Desktop\NICS\TrasDetector\rf-fingerprint-platform\backend
C:\Users\Usuario\radioconda\python.exe -m pip install -r ..\requirements.txt
C:\Users\Usuario\radioconda\python.exe -m uvicorn app.main:app --reload --port 8000
```

## Endpoints principales

### Capture

- `POST /api/rf/captures`
- `POST /api/rf/captures/start`
- `GET /api/rf/captures/status?job_id=...`
- `GET /api/rf/captures`
- `GET /api/rf/captures/{id}`

### Dataset

- `GET /api/rf/datasets/train`
- `GET /api/rf/datasets/val`
- `GET /api/rf/datasets/stats`
- `POST /api/rf/datasets/delete`

### Training / Retraining

- `POST /api/rf/training/start`
- `POST /api/rf/training/retrain`
- `GET /api/rf/training/status?job_id=...`
- `GET /api/rf/training/models`
- `GET /api/rf/training/dashboard`

### Validation

- `POST /api/rf/validation/run`
- `POST /api/rf/validation/start`
- `GET /api/rf/validation/status?job_id=...`
- `GET /api/rf/validation/reports`

### Inference / Prediction

- `POST /api/rf/inference/classify`
- `POST /api/rf/inference/verify`
- `GET /api/rf/inference/predict/captures`
- `POST /api/rf/inference/predict/start`
- `GET /api/rf/inference/predict/status?job_id=...`

### Models

- `GET /api/rf/models/current`
- `GET /api/rf/models/{version}`

## Directorios de datos usados por backend

- Scripts RF: `app/infrastructure/scripts`
- Train: `../data/rf_dataset`
- Validation: `../data/rf_dataset_val`
- Prediction: `../data/rf_dataset_predict`
- Modelo activo y snapshots: `../data/remote_trained_model`
- Validación: `../data/validation`
- Inferencia: `../data/inference`

## Reentrenamiento sin pérdida de historial

El deploy remoto crea snapshots automáticos en:

- `data/remote_trained_model/versions/<timestamp>-before_update`
- `data/remote_trained_model/versions/<timestamp>-after_update`

Índice de versiones:

- `data/remote_trained_model/versions/index.json`

## SSH remoto

El deploy remoto está en modo batch (`BatchMode=yes`), por lo que requiere autenticación por clave.

Si no hay clave válida, el proceso falla rápido (no se queda bloqueado esperando password).
