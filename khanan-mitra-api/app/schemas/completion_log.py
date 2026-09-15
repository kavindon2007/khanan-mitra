from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.schemas.worker import WorkerResponse

class TrainingScenarioBasic(BaseModel):
    id: UUID
    scenario_key: str
    title_en: str
    title_hi: str
    title_sat: str
    passing_threshold: float
    total_steps: int

    model_config = {"from_attributes": True}

class CompletionLogResponse(BaseModel):
    id: UUID
    worker: WorkerResponse
    scenario: TrainingScenarioBasic
    score: float
    passed: bool
    total_attempts: int
    duration_seconds: Optional[int]
    completed_at: datetime
    verified_at: datetime
    sync_path: str
    certificate_issued: bool
    certificate_expires_at: Optional[datetime]
    is_flagged: bool
    flagged_reason: Optional[str]

    model_config = {"from_attributes": True}

class CompletionLogListResponse(BaseModel):
    items: List[CompletionLogResponse]
    page: int
    page_size: int
    total: int

class StepLogResponse(BaseModel):
    id: UUID
    step_key: str
    step_index: int
    action_taken: str
    correct: bool
    points_awarded: int
    time_taken_seconds: int
    attempt_number: int
    recorded_at: datetime

    model_config = {"from_attributes": True}

class CompletionDetailResponse(BaseModel):
    completion: CompletionLogResponse
    steps: List[StepLogResponse]
    certificate_status: str
