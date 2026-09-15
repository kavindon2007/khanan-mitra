from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app.database import get_db
from app.models.worker import Worker
from app.models.vtc import VTC
from app.models.completion_log import CompletionLog
from app.schemas.dashboard import DashboardOverview, VTCStatsResponse
from app.core.security import get_current_admin
from app.models.admin_user import AdminUser

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/overview", response_model=DashboardOverview)
def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    # Total Workers
    total_workers = db.query(Worker).count()
    active_workers = db.query(Worker).filter(Worker.is_active == True).count()
    
    # VTCs
    total_vtcs = db.query(VTC).count()

    # Completions
    total_completions = db.query(CompletionLog).count()
    passed_completions = db.query(CompletionLog).filter(CompletionLog.passed == True).count()
    failed_completions = db.query(CompletionLog).filter(CompletionLog.passed == False).count()
    
    pass_rate = (passed_completions / total_completions) if total_completions > 0 else 0.0

    flagged_completions = db.query(CompletionLog).filter(CompletionLog.is_flagged == True).count()

    # Expiring Certificates (next 30 days)
    now = datetime.utcnow()
    thirty_days_later = now + timedelta(days=30)
    expiring_certificates = db.query(CompletionLog).filter(
        CompletionLog.certificate_issued == True,
        CompletionLog.certificate_expires_at > now,
        CompletionLog.certificate_expires_at <= thirty_days_later
    ).count()

    return DashboardOverview(
        total_workers=total_workers,
        active_workers=active_workers,
        total_vtcs=total_vtcs,
        total_completions=total_completions,
        passed_completions=passed_completions,
        failed_completions=failed_completions,
        pass_rate=pass_rate,
        flagged_completions=flagged_completions,
        expiring_certificates=expiring_certificates
    )

@router.get("/vtcs", response_model=VTCStatsResponse)
def get_vtc_stats(
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    vtcs = db.query(VTC).all()
    results = []
    
    for vtc in vtcs:
        worker_count = db.query(Worker).filter(Worker.vtc_id == vtc.id).count()
        completion_count = db.query(CompletionLog).join(Worker).filter(Worker.vtc_id == vtc.id).count()
        passed_count = db.query(CompletionLog).join(Worker).filter(Worker.vtc_id == vtc.id, CompletionLog.passed == True).count()
        
        pass_rate = (passed_count / completion_count) if completion_count > 0 else 0.0

        results.append({
            "id": str(vtc.id),
            "name": vtc.name,
            "district": vtc.district,
            "state": vtc.state,
            "sector": vtc.sector,
            "worker_count": worker_count,
            "completion_count": completion_count,
            "pass_rate": pass_rate
        })
    
    return {"items": results}
