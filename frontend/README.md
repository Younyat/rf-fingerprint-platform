# Frontend README

## Arranque

```powershell
cd C:\Users\Usuario\Desktop\NICS\TrasDetector\rf-fingerprint-platform\frontend
npm.cmd install
npm.cmd run dev
```

## URL

- `http://localhost:5173`

## Backend esperado

- API base: `http://127.0.0.1:8000/api/rf`
- Configurado en `src/shared/constants/index.ts`

## Pestañas principales

- `Dashboard`
- `Capture` (train/val/predict)
- `Dataset`
- `Training`
- `Retraining` (nuevo, dashboard profesional)
- `Validation`
- `Inference` (prediction lab)
- `Models`

## Comportamiento de jobs en UI

- Jobs continúan al cambiar de pestaña.
- Estado se recupera al volver a la pestaña (`job_id` persistido).
- Botones de lanzamiento quedan deshabilitados mientras el job está en `running`.

Aplicado en:

- Capture
- Training
- Validation
- Prediction (Inference)
- Retraining

## Troubleshooting

### `npm.ps1` bloqueado por policy

Usar siempre:

```powershell
npm.cmd install
npm.cmd run dev
```

### Vite `spawn EPERM`

```powershell
cd frontend
npm.cmd rebuild esbuild
npm.cmd run dev
```
