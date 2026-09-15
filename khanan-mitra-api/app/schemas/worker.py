from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class VTCBasic(BaseModel):
    id: UUID
    name: str
    district: str
    state: str
    sector: str

    model_config = {"from_attributes": True}

class WorkerResponse(BaseModel):
    id: UUID
    short_worker_id: str
    full_name: str
    phone_number: str
    department: str
    contractor: Optional[str]
    blood_group: Optional[str]
    preferred_language: str
    is_active: bool
    vtc: VTCBasic
    badge_issued_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}

class WorkerListResponse(BaseModel):
    items: List[WorkerResponse]
    page: int
    page_size: int
    total: int

class WorkerDetailResponse(BaseModel):
    worker: WorkerResponse
    latest_completion: Optional[dict]
    certificate_status: Optional[str]
