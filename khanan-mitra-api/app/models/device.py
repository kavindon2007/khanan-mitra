from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class Device(Base):
    __tablename__ = "device"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid(),
    )

    vtc_id = Column(
        UUID(as_uuid=True),
        ForeignKey("vtc.id"),
        nullable=False,
    )

    device_label = Column(String, nullable=False)
    android_id = Column(String, unique=True)
    last_synced_at = Column(DateTime(timezone=True))
    last_heartbeat_at = Column(DateTime(timezone=True))
    pending_records = Column(Integer, nullable=False, default=0)
    app_version = Column(String)
    encryption_key_version = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    vtc = relationship("VTC", back_populates="devices")
