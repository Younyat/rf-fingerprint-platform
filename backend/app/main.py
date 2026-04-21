from app.config.logging_config import configure_logging
from app.presentation.api.app_factory import create_app

configure_logging()
app = create_app()
