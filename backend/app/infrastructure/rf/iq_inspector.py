from pathlib import Path


def inspect_cfile(path: str) -> dict:
    p = Path(path)
    return {
        "path": str(p),
        "exists": p.exists(),
        "file_size_bytes": p.stat().st_size if p.exists() else 0,
    }
