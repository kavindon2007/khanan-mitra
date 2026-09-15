from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime, timezone

from app.database import get_db
from app.models.completion_log import CompletionLog
from app.models.revoked_certificate import RevokedCertificate
from app.models.audit_log import AuditLog
from app.core.security import get_current_admin
from app.models.admin_user import AdminUser

router = APIRouter(prefix="/api/verify", tags=["verify"])

class VerifyRequest(BaseModel):
    certificate_jwt: str

class RevokeRequest(BaseModel):
    reason: str

@router.post("")
def verify_certificate(
    request: VerifyRequest,
    db: Session = Depends(get_db)
):
    # Currently matching the dummy JWT strictly by exact match in DB
    completion = db.query(CompletionLog).filter(CompletionLog.certificate_jwt == request.certificate_jwt).first()
    
    if not completion:
        return {"valid": False, "status": "not_found"}
    
    if not completion.passed:
        return {"valid": False, "status": "invalid"}

    if not completion.certificate_issued:
        return {"valid": False, "status": "not_issued"}

    # Check revocation
    revoked = db.query(RevokedCertificate).filter(RevokedCertificate.completion_log_id == completion.id).first()
    if revoked:
        return {"valid": False, "status": "revoked"}
    
    # Check expiration
    now_tz = datetime.now(timezone.utc)
    if completion.certificate_expires_at and completion.certificate_expires_at < now_tz:
        return {"valid": False, "status": "expired"}

    return {
        "valid": True,
        "status": "valid",
        "worker": {
            "id": completion.worker.id,
            "full_name": completion.worker.full_name,
            "short_worker_id": completion.worker.short_worker_id,
            "vtc": completion.worker.vtc.name
        },
        "training": {
            "scenario": completion.scenario.title_en,
            "score": float(completion.score)
        },
        "completed_at": completion.completed_at,
        "expires_at": completion.certificate_expires_at
    }

@router.post("/{completion_id}/revoke")
def revoke_certificate(
    completion_id: UUID,
    request: RevokeRequest,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    if current_user.role not in ["super_admin", "safety_officer"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to revoke certificates")

    completion = db.query(CompletionLog).filter(CompletionLog.id == completion_id).first()
    if not completion:
        raise HTTPException(status_code=404, detail="Completion record not found")

    existing_revocation = db.query(RevokedCertificate).filter(RevokedCertificate.completion_log_id == completion_id).first()
    if existing_revocation:
        raise HTTPException(status_code=400, detail="Certificate is already revoked")

    revocation = RevokedCertificate(
        completion_log_id=completion.id,
        revoked_by=current_user.id,
        reason=request.reason
    )
    db.add(revocation)
    
    audit = AuditLog(
        actor_type="admin_user",
        actor_id=current_user.id,
        action="CERTIFICATE_REVOKED",
        target_table="completion_log",
        target_id=completion.id,
        metadata_={"reason": request.reason, "worker_id": str(completion.worker_id)}
    )
    db.add(audit)
    
    db.commit()

    return {"message": "Certificate revoked successfully"}
