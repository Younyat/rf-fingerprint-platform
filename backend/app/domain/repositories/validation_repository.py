from abc import ABC, abstractmethod
from typing import List

from app.domain.entities.validation_result import ValidationResult


class ValidationRepository(ABC):
    @abstractmethod
    def save(self, result: ValidationResult) -> ValidationResult:
        raise NotImplementedError

    @abstractmethod
    def list_all(self) -> List[ValidationResult]:
        raise NotImplementedError
