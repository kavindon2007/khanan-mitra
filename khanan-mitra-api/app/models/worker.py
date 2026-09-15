from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, CHAR
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class Worker(Base):
    __tablename__ = "worker"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid(),
    )

    vtc_id = Column(
        UUID(as_uuid=True),
        ForeignKey("vtc.id", ondelete="RESTRICT"),
        nullable=False,
    )

    short_worker_id = Column(CHAR(4), nullable=False, unique=True)
    full_name = Column(String, nullable=False)
    phone_number = Column(String, nullable=False, unique=True)
    department = Column(String, nullable=False)
    contractor = Column(String)
    blood_group = Column(String)
    preferred_language = Column(String, nullable=False, default="hi")
    is_active = Column(Boolean, nullable=False, default=True)
    badge_issued_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    vtc = relationship("VTC", back_populates="workers")
    completions = relationship("CompletionLog", back_populates="worker")
