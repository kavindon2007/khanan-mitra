from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.schemas.worker import VTCBasic

class DeviceResponse(BaseModel):
    id: UUID
    device_label: str
    android_id: Optional[str]
    vtc: VTCBasic
    last_synced_at: Optional[datetime]
    last_heartbeat_at: Optional[datetime]
    pending_records: int
    app_version: Optional[str]
    encryption_key_version: int
    created_at: datetime
    status: str

    model_config = {"from_attributes": True}

class DeviceListResponse(BaseModel):
    items: List[DeviceResponse]
