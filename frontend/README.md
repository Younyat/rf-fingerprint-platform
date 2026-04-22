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
- Configurada en `src/shared/constants/index.ts`

## Troubleshooting

### `npm.ps1` bloqueado por policy

Usar siempre:

```powershell
npm.cmd install
npm.cmd run dev
```

### Vite no carga por `spawn EPERM`

```powershell
npm.cmd rebuild esbuild
npm.cmd run dev
```
