from sqlalchemy import Column, String, Boolean, DateTime, Numeric, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class TrainingScenario(Base):
    __tablename__ = "training_scenario"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid(),
    )

    scenario_key = Column(String, nullable=False, unique=True)
    title_en = Column(String, nullable=False)
    title_hi = Column(String, nullable=False)
    title_sat = Column(String, nullable=False)
    passing_threshold = Column(Numeric, nullable=False, default=0.70)
    total_steps = Column(Integer, nullable=False)
    version = Column(Integer, nullable=False, default=1)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    completions = relationship("CompletionLog", back_populates="scenario")
    steps = relationship("StepLog", back_populates="scenario")
