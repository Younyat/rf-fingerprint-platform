# Backend README

## Requisitos

- Python en `C:\Users\Usuario\radioconda\python.exe`
- Dependencias instaladas desde `..\requirements.txt`

## Arranque

```powershell
cd C:\Users\Usuario\Desktop\NICS\TrasDetector\rf-fingerprint-platform\backend
C:\Users\Usuario\radioconda\python.exe -m pip install -r ..\requirements.txt
C:\Users\Usuario\radioconda\python.exe -m uvicorn app.main:app --reload --port 8000
```

## Endpoints principales

- `GET /health`
- `POST /api/rf/captures`
- `GET /api/rf/captures`
- `POST /api/rf/training/start`
- `POST /api/rf/validation/run`

## Directorios usados por backend

- Scripts: `backend/app/infrastructure/scripts`
- Datos: `../data/rf_dataset`, `../data/rf_dataset_val`, `../data/remote_trained_model`
