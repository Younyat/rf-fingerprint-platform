# RF Fingerprint Platform

Plataforma para captura RF, gestión de datasets, entrenamiento remoto, reentrenamiento continuo, validación e inferencia/predicción.

## Arquitectura

- Frontend: React + TypeScript + Vite (MVC liviano por vistas/controladores/componentes).
- Backend: FastAPI con capas separadas (domain/application/infrastructure/presentation).

## Estructura operativa

- Backend API: `backend/app`
- Frontend: `frontend/`
- Scripts RF integrados: `backend/app/infrastructure/scripts/`
- Datos locales del proyecto: `data/`

Directorios de datos principales:

- Train dataset: `data/rf_dataset`
- Validation dataset: `data/rf_dataset_val`
- Prediction dataset: `data/rf_dataset_predict`
- Modelo y snapshots: `data/remote_trained_model`
- Validación: `data/validation`
- Inferencia: `data/inference`

## URLs

- Frontend: `http://localhost:5173`
- Backend docs: `http://127.0.0.1:8000/docs`
- Backend health: `http://127.0.0.1:8000/health`

## Arranque rápido (PowerShell)

### 1) Backend (con setup SSH opcional)

Desde raíz del proyecto:

```powershell
powershell -ExecutionPolicy Bypass -File .\start_backend.ps1 -RemoteUser "assouyat" -RemoteHost "192.168.193.49"
```

Si no quieres configurar SSH en ese arranque:

```powershell
powershell -ExecutionPolicy Bypass -File .\start_backend.ps1 -SkipSshSetup
```

### 2) Frontend

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

## Flujo recomendado

1. `Capture`: captura en `train`, `val` o `predict`.
2. `Training`: entrenamiento remoto inicial.
3. `Retraining`: reentrenamiento continuo con dashboard y snapshots.
4. `Validation`: validación científica sobre subset de `val`.
5. `Inference`: predicción sobre capturas de `predict`.

## Notas clave de entrenamiento/reentrenamiento

- Los jobs de training/retraining/capture/validation/prediction continúan al cambiar de pestaña.
- El botón de lanzar queda deshabilitado mientras el job está en `running`.
- El reentrenamiento ahora snapshottea el modelo local:
  - `before_update`
  - `after_update`
- Snapshots en `data/remote_trained_model/versions`.

## SSH para entrenamiento remoto

Para evitar bloqueos en training remoto, se recomienda clave SSH sin password interactivo.

El deploy remoto usa modo batch (sin prompt), por lo que si no hay clave válida fallará rápido en lugar de quedarse colgado.

## Git y artefactos

No se deben versionar capturas ni artefactos de entrenamiento.

Ejemplos ignorados:

- `data/`
- `*.cfile`, `*.pt`, `*.pth`, `*.h5`, `*.tar.gz`

## Troubleshooting rápido

### PowerShell bloquea `npm`

Usa `npm.cmd`:

```powershell
npm.cmd install
npm.cmd run dev
```

### `No module named 'app'`

Arranca `uvicorn` desde `backend`:

```powershell
cd backend
C:\Users\Usuario\radioconda\python.exe -m uvicorn app.main:app --reload --port 8000
```

### Vite/esbuild `spawn EPERM`

```powershell
cd frontend
npm.cmd rebuild esbuild
npm.cmd run dev
```
