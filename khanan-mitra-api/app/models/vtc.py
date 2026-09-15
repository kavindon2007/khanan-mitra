from sqlalchemy import Column, String, Numeric, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class VTC(Base):
    __tablename__ = "vtc"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid(),
    )

    name = Column(String, nullable=False)

    district = Column(String, nullable=False)

    state = Column(
        String,
        nullable=False,
        default="Jharkhand",
    )

    sector = Column(String, nullable=False)

    latitude = Column(Numeric)

    longitude = Column(Numeric)

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    workers = relationship("Worker", back_populates="vtc")
    devices = relationship("Device", back_populates="vtc")