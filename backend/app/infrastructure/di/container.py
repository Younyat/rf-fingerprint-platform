from dataclasses import dataclass

from app.application.use_cases.capture.create_capture_use_case import CreateCaptureUseCase
from app.application.use_cases.capture.get_capture_job_status_use_case import GetCaptureJobStatusUseCase
from app.application.use_cases.capture.get_capture_detail_use_case import GetCaptureDetailUseCase
from app.application.use_cases.capture.list_captures_use_case import ListCapturesUseCase
from app.application.use_cases.capture.start_capture_job_use_case import StartCaptureJobUseCase
from app.application.use_cases.dataset.build_dataset_manifest_use_case import BuildDatasetManifestUseCase
from app.application.use_cases.dataset.check_dataset_quality_use_case import CheckDatasetQualityUseCase
from app.application.use_cases.dataset.create_dataset_record_use_case import CreateDatasetRecordUseCase
from app.application.use_cases.dataset.delete_dataset_records_use_case import DeleteDatasetRecordsUseCase
from app.application.use_cases.dataset.list_dataset_records_use_case import ListDatasetRecordsUseCase
from app.application.use_cases.inference.classify_capture_use_case import ClassifyCaptureUseCase
from app.application.use_cases.inference.detect_unknown_device_use_case import DetectUnknownDeviceUseCase
from app.application.use_cases.inference.get_prediction_job_status_use_case import GetPredictionJobStatusUseCase
from app.application.use_cases.inference.list_prediction_captures_use_case import ListPredictionCapturesUseCase
from app.application.use_cases.inference.start_prediction_job_use_case import StartPredictionJobUseCase
from app.application.use_cases.inference.verify_capture_use_case import VerifyCaptureUseCase
from app.application.use_cases.training.get_training_status_use_case import GetTrainingStatusUseCase
from app.application.use_cases.training.get_retraining_dashboard_use_case import GetRetrainingDashboardUseCase
from app.application.use_cases.training.launch_remote_training_use_case import LaunchRemoteTrainingUseCase
from app.application.use_cases.training.list_model_versions_use_case import ListModelVersionsUseCase
from app.application.use_cases.training.retrain_model_use_case import RetrainModelUseCase
from app.application.use_cases.validation.validate_model_use_case import ValidateModelUseCase
from app.application.use_cases.validation.get_validation_job_status_use_case import GetValidationJobStatusUseCase
from app.application.use_cases.validation.start_validation_job_use_case import StartValidationJobUseCase
from app.config.paths import (
    CAPTURES_DIR,
    DATASETS_DIR,
    MODELS_DIR,
    MODEL_OUTPUT_DIR,
    INFERENCE_OUTPUT_DIR,
    PREDICT_DATASET_DIR,
    TRAIN_DATASET_DIR,
    VAL_DATASET_DIR,
    VALIDATION_OUTPUT_DIR,
    VALIDATION_REPORTS_DIR,
    PLATFORM_ROOT,
    SCRIPTS_DIR,
    ensure_dirs,
)
from app.domain.services.dataset_policy_service import DatasetPolicyService
from app.infrastructure.persistence.filesystem.capture_fs_repository import CaptureFSRepository
from app.infrastructure.persistence.filesystem.dataset_fs_repository import DatasetFSRepository
from app.infrastructure.persistence.filesystem.model_fs_repository import ModelFSRepository
from app.infrastructure.persistence.filesystem.validation_fs_repository import ValidationFSRepository
from app.infrastructure.remote.ssh_remote_executor import SSHRemoteExecutor
from app.infrastructure.remote.training_job_manager import TrainingJobManager
from app.presentation.controllers.capture_controller import CaptureController
from app.presentation.controllers.dataset_controller import DatasetController
from app.presentation.controllers.inference_controller import InferenceController
from app.presentation.controllers.model_controller import ModelController
from app.presentation.controllers.training_controller import TrainingController
from app.presentation.controllers.validation_controller import ValidationController


@dataclass
class Container:
    capture_controller: CaptureController
    dataset_controller: DatasetController
    training_controller: TrainingController
    validation_controller: ValidationController
    inference_controller: InferenceController
    model_controller: ModelController
    validation_repo: ValidationFSRepository


_container: Container | None = None


def build_container() -> Container:
    ensure_dirs()

    capture_repo = CaptureFSRepository(CAPTURES_DIR)
    dataset_repo = DatasetFSRepository(
        DATASETS_DIR,
        train_capture_root=TRAIN_DATASET_DIR,
        val_capture_root=VAL_DATASET_DIR,
        capture_index_dir=CAPTURES_DIR,
    )
    model_repo = ModelFSRepository(MODELS_DIR)
    validation_repo = ValidationFSRepository(VALIDATION_REPORTS_DIR)

    executor = SSHRemoteExecutor()
    job_manager = TrainingJobManager()
    default_python = "C:/Users/Usuario/radioconda/python.exe"

    create_capture_uc = CreateCaptureUseCase(
        capture_repo=capture_repo,
        executor=executor,
        scripts_dir=SCRIPTS_DIR,
        train_dataset_dir=TRAIN_DATASET_DIR,
        val_dataset_dir=VAL_DATASET_DIR,
        predict_dataset_dir=PREDICT_DATASET_DIR,
        default_python=default_python,
    )
    list_captures_uc = ListCapturesUseCase(capture_repo)
    get_capture_uc = GetCaptureDetailUseCase(capture_repo)
    start_capture_job_uc = StartCaptureJobUseCase(
        job_manager=job_manager,
        scripts_dir=SCRIPTS_DIR,
        train_dataset_dir=TRAIN_DATASET_DIR,
        val_dataset_dir=VAL_DATASET_DIR,
        predict_dataset_dir=PREDICT_DATASET_DIR,
        default_python=default_python,
    )
    capture_status_job_uc = GetCaptureJobStatusUseCase(job_manager=job_manager)

    create_record_uc = CreateDatasetRecordUseCase(dataset_repo)
    delete_records_uc = DeleteDatasetRecordsUseCase(dataset_repo)
    list_records_uc = ListDatasetRecordsUseCase(dataset_repo)
    build_manifest_uc = BuildDatasetManifestUseCase(dataset_repo)
    quality_uc = CheckDatasetQualityUseCase(DatasetPolicyService())

    launch_uc = LaunchRemoteTrainingUseCase(
        job_manager=job_manager,
        scripts_dir=SCRIPTS_DIR,
        train_dataset_dir=TRAIN_DATASET_DIR,
        model_output_dir=MODEL_OUTPUT_DIR,
        requirements_path=PLATFORM_ROOT / "requirements.txt",
    )
    retrain_uc = RetrainModelUseCase(launch_uc)
    list_models_uc = ListModelVersionsUseCase(model_repo)
    status_uc = GetTrainingStatusUseCase(job_manager=job_manager)
    dashboard_uc = GetRetrainingDashboardUseCase(model_output_dir=MODEL_OUTPUT_DIR)

    validate_uc = ValidateModelUseCase(
        executor=executor,
        scripts_dir=SCRIPTS_DIR,
        val_dataset_dir=VAL_DATASET_DIR,
        model_output_dir=MODEL_OUTPUT_DIR,
        validation_output_dir=VALIDATION_OUTPUT_DIR,
        default_python=default_python,
    )
    start_validation_job_uc = StartValidationJobUseCase(job_manager=job_manager, validate_uc=validate_uc)
    validation_status_job_uc = GetValidationJobStatusUseCase(job_manager=job_manager)

    classify_uc = ClassifyCaptureUseCase()
    verify_uc = VerifyCaptureUseCase()
    detect_uc = DetectUnknownDeviceUseCase()
    list_prediction_captures_uc = ListPredictionCapturesUseCase(predict_dataset_dir=PREDICT_DATASET_DIR)
    start_prediction_job_uc = StartPredictionJobUseCase(
        job_manager=job_manager,
        scripts_dir=SCRIPTS_DIR,
        model_output_dir=MODEL_OUTPUT_DIR,
        inference_output_dir=INFERENCE_OUTPUT_DIR,
        default_python=default_python,
    )
    prediction_status_uc = GetPredictionJobStatusUseCase(job_manager=job_manager)

    return Container(
        capture_controller=CaptureController(
            create_capture_uc,
            list_captures_uc,
            get_capture_uc,
            start_capture_job_uc,
            capture_status_job_uc,
        ),
        dataset_controller=DatasetController(create_record_uc, list_records_uc, build_manifest_uc, quality_uc, delete_records_uc),
        training_controller=TrainingController(launch_uc, retrain_uc, list_models_uc, status_uc, dashboard_uc),
        validation_controller=ValidationController(
            validate_uc,
            start_validation_job_uc,
            validation_status_job_uc,
        ),
        inference_controller=InferenceController(
            classify_uc,
            verify_uc,
            detect_uc,
            list_prediction_captures_uc,
            start_prediction_job_uc,
            prediction_status_uc,
        ),
        model_controller=ModelController(model_repo),
        validation_repo=validation_repo,
    )


def get_container() -> Container:
    global _container
    if _container is None:
        _container = build_container()
    return _container
