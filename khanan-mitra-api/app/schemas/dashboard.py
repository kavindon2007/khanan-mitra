from pydantic import BaseModel
from typing import List

class DashboardOverview(BaseModel):
    total_workers: int
    active_workers: int
    total_vtcs: int
    total_completions: int
    passed_completions: int
    failed_completions: int
    pass_rate: float
    flagged_completions: int
    expiring_certificates: int

class VTCStat(BaseModel):
    id: str
    name: str
    district: str
    state: str
    sector: str
    worker_count: int
    completion_count: int
    pass_rate: float

class VTCStatsResponse(BaseModel):
    items: List[VTCStat]
