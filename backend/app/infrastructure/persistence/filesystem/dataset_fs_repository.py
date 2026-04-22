import hashlib
import json
from pathlib import Path
from typing import List

from app.domain.entities.dataset_record import DatasetRecord
from app.domain.repositories.dataset_repository import DatasetRepository


class DatasetFSRepository(DatasetRepository):
    def __init__(
        self,
        dataset_dir: Path,
        train_capture_root: Path | None = None,
        val_capture_root: Path | None = None,
        capture_index_dir: Path | None = None,
    ) -> None:
        self._dataset_dir = dataset_dir
        self._train_capture_root = train_capture_root
        self._val_capture_root = val_capture_root
        self._capture_index_dir = capture_index_dir
        (self._dataset_dir / "train").mkdir(parents=True, exist_ok=True)
        (self._dataset_dir / "val").mkdir(parents=True, exist_ok=True)

    def add_record(self, record: DatasetRecord) -> DatasetRecord:
        out = self._dataset_dir / record.split / f"{record.record_id}.json"
        out.write_text(json.dumps(record.__dict__, indent=2), encoding="utf-8")
        return record

    def list_records(self, split: str | None = None) -> List[DatasetRecord]:
        roots = [self._dataset_dir / split] if split else [self._dataset_dir / "train", self._dataset_dir / "val"]
        records: list[DatasetRecord] = []
        seen_keys: set[tuple[str, str]] = set()

        for root in roots:
            if not root.exists():
                continue
            for p in sorted(root.glob("*.json")):
                record = DatasetRecord(**json.loads(p.read_text(encoding="utf-8")))
                records.append(record)
                seen_keys.add((record.split, record.metadata_path))

        discovered = self._discover_capture_records(split=split)
        for record in discovered:
            key = (record.split, record.metadata_path)
            if key not in seen_keys:
                records.append(record)
                seen_keys.add(key)

        return records

    def build_manifest(self, split: str | None = None) -> dict:
        records = self.list_records(split=split)
        return {
            "split": split or "all",
            "num_records": len(records),
            "records": [r.__dict__ for r in records],
        }

    def delete_records(self, records: list[dict]) -> dict:
        deleted_metadata: list[str] = []
        deleted_cfiles: list[str] = []
        deleted_index_entries = 0
        errors: list[str] = []

        for rec in records:
            meta_path = Path(str(rec.get("metadata_path", "")).strip())
            cfile_from_req = Path(str(rec.get("cfile_path", "")).strip()) if rec.get("cfile_path") else None

            if not str(meta_path):
                errors.append("Record without metadata_path")
                continue

            resolved_cfile: Path | None = cfile_from_req if cfile_from_req and cfile_from_req.exists() else None

            if meta_path.exists():
                try:
                    meta = json.loads(meta_path.read_text(encoding="utf-8"))
                    iq_file = str(meta.get("iq_file", "")).strip()
                    if iq_file:
                        p = Path(iq_file)
                        if p.exists():
                            resolved_cfile = p
                except Exception:
                    pass

            if meta_path.exists():
                try:
                    meta_path.unlink()
                    deleted_metadata.append(str(meta_path))
                    self._prune_empty_dirs(meta_path.parent)
                except Exception as exc:
                    errors.append(f"Failed deleting metadata {meta_path}: {exc}")

            if resolved_cfile and resolved_cfile.exists():
                try:
                    resolved_cfile.unlink()
                    deleted_cfiles.append(str(resolved_cfile))
                    self._prune_empty_dirs(resolved_cfile.parent)
                except Exception as exc:
                    errors.append(f"Failed deleting cfile {resolved_cfile}: {exc}")

            deleted_index_entries += self._delete_dataset_index_entries(metadata_path=str(meta_path), cfile_path=str(resolved_cfile) if resolved_cfile else None)
            deleted_index_entries += self._delete_capture_index_entries(metadata_path=str(meta_path), cfile_path=str(resolved_cfile) if resolved_cfile else None)

        return {
            "requested": len(records),
            "deleted_metadata": deleted_metadata,
            "deleted_cfiles": deleted_cfiles,
            "deleted_index_entries": deleted_index_entries,
            "errors": errors,
            "success": len(errors) == 0,
        }

    def _delete_dataset_index_entries(self, metadata_path: str, cfile_path: str | None) -> int:
        count = 0
        for split_dir in [self._dataset_dir / "train", self._dataset_dir / "val"]:
            if not split_dir.exists():
                continue
            for p in split_dir.glob("*.json"):
                try:
                    payload = json.loads(p.read_text(encoding="utf-8"))
                except Exception:
                    continue
                same_meta = payload.get("metadata_path") == metadata_path
                same_cfile = cfile_path is not None and payload.get("cfile_path") == cfile_path
                if same_meta or same_cfile:
                    try:
                        p.unlink()
                        count += 1
                    except Exception:
                        pass
        return count

    def _delete_capture_index_entries(self, metadata_path: str, cfile_path: str | None) -> int:
        if self._capture_index_dir is None or not self._capture_index_dir.exists():
            return 0

        count = 0
        for p in self._capture_index_dir.glob("*.json"):
            try:
                payload = json.loads(p.read_text(encoding="utf-8"))
            except Exception:
                continue
            same_meta = payload.get("metadata_path") == metadata_path
            same_cfile = cfile_path is not None and payload.get("cfile_path") == cfile_path
            if same_meta or same_cfile:
                try:
                    p.unlink()
                    count += 1
                except Exception:
                    pass
        return count

    def _discover_capture_records(self, split: str | None = None) -> List[DatasetRecord]:
        roots: list[tuple[str, Path | None]] = []
        if split is None or split == "train":
            roots.append(("train", self._train_capture_root))
        if split is None or split == "val":
            roots.append(("val", self._val_capture_root))

        out: list[DatasetRecord] = []
        for split_name, root in roots:
            if root is None or not root.exists():
                continue

            for meta_path in sorted(root.rglob("*.json")):
                try:
                    meta = json.loads(meta_path.read_text(encoding="utf-8"))
                except Exception:
                    continue

                emitter = str(meta.get("emitter_device_id", "")).strip()
                session = str(meta.get("session_id", "")).strip()
                if not emitter or not session:
                    continue

                iq_file = str(meta.get("iq_file", "")).strip()
                cfile_path = Path(iq_file) if iq_file else meta_path.with_suffix(".cfile")
                if not cfile_path.exists():
                    continue

                rid = str(meta.get("id", "")).strip()
                if not rid:
                    rid = "disc_" + hashlib.sha1(str(meta_path).encode("utf-8")).hexdigest()[:16]

                out.append(
                    DatasetRecord(
                        record_id=rid,
                        split=split_name,
                        emitter_device_id=emitter,
                        session_id=session,
                        cfile_path=str(cfile_path),
                        metadata_path=str(meta_path),
                    )
                )

        return out

    def _prune_empty_dirs(self, start_dir: Path) -> None:
        stop_dirs = {self._train_capture_root, self._val_capture_root, self._dataset_dir}
        current = start_dir
        while current and current.exists():
            if any(stop is not None and current == stop for stop in stop_dirs):
                break
            try:
                next(current.iterdir())
                break
            except StopIteration:
                try:
                    current.rmdir()
                except Exception:
                    break
                current = current.parent
            except Exception:
                break
