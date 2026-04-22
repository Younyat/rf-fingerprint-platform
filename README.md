# RF Fingerprint Platform

Plataforma para captura RF, gestión de datasets, entrenamiento remoto, validación e inferencia.

## Arquitectura

- Frontend: MVC liviano (React + TypeScript + Vite)
- Backend: Clean Architecture (Domain, Application, Infrastructure, Presentation)

## Estructura operativa

- Backend API: `backend/app`
- Frontend: `frontend/`
- Scripts RF integrados: `backend/app/infrastructure/scripts/`
- Datos locales del proyecto (capturas/datasets/modelos): `data/`

## URLs

- Frontend dashboard: `http://localhost:5173`
- Backend API docs: `http://127.0.0.1:8000/docs`
- Health backend: `http://127.0.0.1:8000/health`

## Arranque recomendado (PowerShell)

### Backend con auto-setup SSH (password solo una vez)

Desde la raíz del proyecto:

```powershell
powershell -ExecutionPolicy Bypass -File .\start_backend.ps1 -RemoteUser "assouyat" -RemoteHost "192.168.193.49"
```

Qué hace `start_backend.ps1`:

1. Genera `~/.ssh/id_ed25519` si no existe.
2. Prueba SSH sin password.
3. Si aún no está configurado, instala tu clave pública en remoto (aquí te pedirá password una vez).
4. Arranca backend (`uvicorn`).

Si quieres arrancar backend sin tocar SSH:

```powershell
powershell -ExecutionPolicy Bypass -File .\start_backend.ps1 -SkipSshSetup
```

### Frontend

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

## Arranque manual backend

```powershell
cd backend
C:\Users\Usuario\radioconda\python.exe -m pip install -r ..\requirements.txt
C:\Users\Usuario\radioconda\python.exe -m uvicorn app.main:app --reload --port 8000
```

## Flujo mínimo funcional

1. Entra en `http://localhost:5173/capture` y captura en `train` o `val`.
2. Entra en `http://localhost:5173/training` para lanzar entrenamiento remoto.
3. Entra en `http://localhost:5173/validation` para validar contra dataset `val`.

## Datos y Git

No se versionan capturas ni artefactos:

- `data/`
- `*.cfile`, `*.pt`, `*.pth`, `*.h5`

Configurado en `.gitignore`.

## Troubleshooting rápido

### PowerShell bloquea `npm`

Usa `npm.cmd` en lugar de `npm`:

```powershell
npm.cmd install
npm.cmd run dev
```

### `No module named 'app'` al arrancar backend

Lanza uvicorn desde carpeta `backend`:

```powershell
cd backend
C:\Users\Usuario\radioconda\python.exe -m uvicorn app.main:app --reload --port 8000
```

### Error BOM `Unexpected token '﻿'` en Vite/PostCSS

Regraba JSON de configuración en UTF-8 sin BOM (ya corregido en el repo).
