from dataclasses import dataclass


@dataclass(frozen=True)
class TrainingParams:
    epochs: int
    batch_size: int
    window_size: int
    stride: int
    embedding_dim: int = 128
