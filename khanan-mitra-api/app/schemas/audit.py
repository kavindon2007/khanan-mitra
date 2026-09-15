from pydantic import BaseModel
from typing import List, Optional, Any
from uuid import UUID
from datetime import datetime

class AuditLogResponse(BaseModel):
    id: UUID
    actor_type: str
    actor_id: Optional[UUID]
    action: str
    target_table: Optional[str]
    target_id: Optional[UUID]
    metadata_: Optional[dict]
    created_at: datetime

    model_config = {"from_attributes": True, "populate_by_name": True}

class AuditLogListResponse(BaseModel):
    items: List[AuditLogResponse]
    page: int
    page_size: int
    total: int
