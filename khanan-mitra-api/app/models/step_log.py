from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class StepLog(Base):
    __tablename__ = "step_log"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid(),
    )

    completion_log_id = Column(
        UUID(as_uuid=True),
        ForeignKey("completion_log.id"),
        nullable=False,
    )

    worker_id = Column(
        UUID(as_uuid=True),
        ForeignKey("worker.id"),
        nullable=False,
    )

    scenario_id = Column(
        UUID(as_uuid=True),
        ForeignKey("training_scenario.id"),
        nullable=False,
    )

    step_key = Column(String, nullable=False)
    step_index = Column(Integer, nullable=False)
    action_taken = Column(String, nullable=False)
    correct = Column(Boolean, nullable=False)
    points_awarded = Column(Integer, nullable=False)
    time_taken_seconds = Column(Integer, nullable=False)
    attempt_number = Column(Integer, nullable=False, default=1)
    recorded_at = Column(DateTime(timezone=True), nullable=False)

    completion = relationship("CompletionLog", back_populates="steps")
    worker = relationship("Worker")
    scenario = relationship("TrainingScenario")
