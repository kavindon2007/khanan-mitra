from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from uuid import UUID

from app.database import get_db
from app.models.worker import Worker
from app.models.completion_log import CompletionLog
from app.models.revoked_certificate import RevokedCertificate
from app.schemas.worker import WorkerListResponse, WorkerDetailResponse, WorkerResponse
from app.core.security import get_current_admin
from app.models.admin_user import AdminUser

router = APIRouter(prefix="/api/workers", tags=["workers"])

@router.get("", response_model=WorkerListResponse)
def get_workers(
    search: Optional[str] = None,
    vtc_id: Optional[UUID] = None,
    department: Optional[str] = None,
    preferred_language: Optional[str] = None,
    is_active: Optional[bool] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    query = db.query(Worker)

    if search:
        query = query.filter(
            or_(
                Worker.full_name.ilike(f"%{search}%"),
                Worker.short_worker_id.ilike(f"%{search}%"),
                Worker.phone_number.ilike(f"%{search}%")
            )
        )
    if vtc_id:
        query = query.filter(Worker.vtc_id == vtc_id)
    if department:
        query = query.filter(Worker.department == department)
    if preferred_language:
        query = query.filter(Worker.preferred_language == preferred_language)
    if is_active is not None:
        query = query.filter(Worker.is_active == is_active)

    total = query.count()
    workers = query.order_by(Worker.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": workers,
        "page": page,
        "page_size": page_size,
        "total": total
    }

@router.get("/{worker_id}", response_model=WorkerDetailResponse)
def get_worker(
    worker_id: UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    latest_completion = db.query(CompletionLog).filter(CompletionLog.worker_id == worker_id).order_by(CompletionLog.completed_at.desc()).first()
    
    cert_status = "none"
    latest_comp_dict = None
    if latest_completion:
        latest_comp_dict = {
            "id": latest_completion.id,
            "scenario": latest_completion.scenario.scenario_key,
            "passed": latest_completion.passed,
            "completed_at": latest_completion.completed_at
        }
        if latest_completion.certificate_issued:
            # check revocation
            revoked = db.query(RevokedCertificate).filter(RevokedCertificate.completion_log_id == latest_completion.id).first()
            if revoked:
                cert_status = "revoked"
            elif latest_completion.certificate_expires_at and latest_completion.certificate_expires_at < datetime.utcnow():
                cert_status = "expired"
            else:
                cert_status = "valid"

    return {
        "worker": worker,
        "latest_completion": latest_comp_dict,
        "certificate_status": cert_status
    }
