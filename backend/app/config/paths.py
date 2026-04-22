from pathlib import Path


APP_DIR = Path(__file__).resolve().parents[1]
BACKEND_DIR = APP_DIR.parent
PLATFORM_ROOT = BACKEND_DIR.parent
ROOT_DIR = APP_DIR
SCRIPTS_DIR = APP_DIR / "infrastructure" / "scripts"

STORAGE_DIR = ROOT_DIR / "infrastructure" / "persistence" / "storage"
CAPTURES_DIR = STORAGE_DIR / "captures"
DATASETS_DIR = STORAGE_DIR / "datasets"
MODELS_DIR = STORAGE_DIR / "models"
VALIDATION_REPORTS_DIR = STORAGE_DIR / "validation_reports"
TEMP_DIR = STORAGE_DIR / "temp"

PROJECT_DATA_DIR = PLATFORM_ROOT / "data"
TRAIN_DATASET_DIR = PROJECT_DATA_DIR / "rf_dataset"
VAL_DATASET_DIR = PROJECT_DATA_DIR / "rf_dataset_val"
PREDICT_DATASET_DIR = PROJECT_DATA_DIR / "rf_dataset_predict"
MODEL_OUTPUT_DIR = PROJECT_DATA_DIR / "remote_trained_model"
VALIDATION_OUTPUT_DIR = PROJECT_DATA_DIR / "validation"
INFERENCE_OUTPUT_DIR = PROJECT_DATA_DIR / "inference"


def ensure_dirs() -> None:
    for p in [
        CAPTURES_DIR,
        DATASETS_DIR / "train",
        DATASETS_DIR / "val",
        MODELS_DIR,
        VALIDATION_REPORTS_DIR,
        TEMP_DIR,
        PROJECT_DATA_DIR,
        TRAIN_DATASET_DIR,
        VAL_DATASET_DIR,
        PREDICT_DATASET_DIR,
        MODEL_OUTPUT_DIR,
        VALIDATION_OUTPUT_DIR,
        INFERENCE_OUTPUT_DIR,
    ]:
        p.mkdir(parents=True, exist_ok=True)
