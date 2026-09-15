from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class RevokedCertificate(Base):
    __tablename__ = "revoked_certificate"

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

    revoked_by = Column(
        UUID(as_uuid=True),
        ForeignKey("admin_user.id"),
        nullable=False,
    )

    reason = Column(String, nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    completion = relationship("CompletionLog", back_populates="revoked_certificate")
    admin = relationship("AdminUser")
