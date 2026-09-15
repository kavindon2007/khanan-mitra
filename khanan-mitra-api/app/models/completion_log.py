from sqlalchemy import Column, String, Boolean, DateTime, Numeric, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class CompletionLog(Base):
    __tablename__ = "completion_log"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
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

    device_android_id = Column(String, nullable=False)
    score = Column(Numeric, nullable=False)
    passed = Column(Boolean, nullable=False)
    total_attempts = Column(Integer, nullable=False, default=1)
    duration_seconds = Column(Integer)
    completed_at = Column(DateTime(timezone=True), nullable=False)
    verified_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    sync_path = Column(String, nullable=False)
    certificate_issued = Column(Boolean, nullable=False, default=False)
    certificate_jwt = Column(String)
    certificate_issued_at = Column(DateTime(timezone=True))
    certificate_expires_at = Column(DateTime(timezone=True))
    is_flagged = Column(Boolean, nullable=False, default=False)
    flagged_reason = Column(String)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    worker = relationship("Worker", back_populates="completions")
    scenario = relationship("TrainingScenario", back_populates="completions")
    steps = relationship("StepLog", back_populates="completion")
    revoked_certificate = relationship("RevokedCertificate", back_populates="completion", uselist=False)
