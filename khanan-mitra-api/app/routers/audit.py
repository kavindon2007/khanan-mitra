from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.audit_log import AuditLog
from app.schemas.audit import AuditLogListResponse
from app.core.security import get_current_admin
from app.models.admin_user import AdminUser

router = APIRouter(prefix="/api/audit", tags=["audit"])

@router.get("", response_model=AuditLogListResponse)
def get_audit_logs(
    actor_type: Optional[str] = None,
    action: Optional[str] = None,
    target_table: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    query = db.query(AuditLog)

    if actor_type:
        query = query.filter(AuditLog.actor_type == actor_type)
    if action:
        query = query.filter(AuditLog.action == action)
    if target_table:
        query = query.filter(AuditLog.target_table == target_table)

    total = query.count()
    logs = query.order_by(AuditLog.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": logs,
        "page": page,
        "page_size": page_size,
        "total": total
    }
