from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from datetime import datetime

from app.database import get_db
from app.models.completion_log import CompletionLog
from app.models.step_log import StepLog
from app.models.revoked_certificate import RevokedCertificate
from app.schemas.completion_log import CompletionLogListResponse, CompletionDetailResponse
from app.core.security import get_current_admin
from app.models.admin_user import AdminUser

router = APIRouter(prefix="/api/completions", tags=["completions"])

@router.get("", response_model=CompletionLogListResponse)
def get_completions(
    worker_id: Optional[UUID] = None,
    scenario_id: Optional[UUID] = None,
    passed: Optional[bool] = None,
    is_flagged: Optional[bool] = None,
    sync_path: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    query = db.query(CompletionLog)

    if worker_id:
        query = query.filter(CompletionLog.worker_id == worker_id)
    if scenario_id:
        query = query.filter(CompletionLog.scenario_id == scenario_id)
    if passed is not None:
        query = query.filter(CompletionLog.passed == passed)
    if is_flagged is not None:
        query = query.filter(CompletionLog.is_flagged == is_flagged)
    if sync_path:
        query = query.filter(CompletionLog.sync_path == sync_path)

    total = query.count()
    completions = query.order_by(CompletionLog.completed_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": completions,
        "page": page,
        "page_size": page_size,
        "total": total
    }

@router.get("/{completion_id}", response_model=CompletionDetailResponse)
def get_completion(
    completion_id: UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    completion = db.query(CompletionLog).filter(CompletionLog.id == completion_id).first()
    if not completion:
        raise HTTPException(status_code=404, detail="Completion record not found")

    steps = db.query(StepLog).filter(StepLog.completion_log_id == completion_id).order_by(StepLog.step_index.asc()).all()

    cert_status = "not_issued"
    if completion.certificate_issued:
        revoked = db.query(RevokedCertificate).filter(RevokedCertificate.completion_log_id == completion_id).first()
        if revoked:
            cert_status = "revoked"
        elif completion.certificate_expires_at and completion.certificate_expires_at < datetime.utcnow():
            cert_status = "expired"
        else:
            cert_status = "valid"

    return {
        "completion": completion,
        "steps": steps,
        "certificate_status": cert_status
    }
