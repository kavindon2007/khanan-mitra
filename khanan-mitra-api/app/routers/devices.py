from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database import get_db
from app.models.device import Device
from app.schemas.device import DeviceListResponse
from app.core.security import get_current_admin
from app.models.admin_user import AdminUser

router = APIRouter(prefix="/api/devices", tags=["devices"])

@router.get("", response_model=DeviceListResponse)
def get_devices(
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    devices = db.query(Device).all()
    results = []
    
    now = datetime.utcnow()
    # timezone-aware now might be needed depending on DB, but Neon + utcnow usually works if we compare naïve or tz-aware correctly
    # PostgreSQL TIMESTAMPTZ gets returned as timezone-aware datetimes in SQLAlchemy
    # So we'll use now with timezone
    from datetime import timezone
    now_tz = datetime.now(timezone.utc)
    
    for device in devices:
        status = "offline"
        if device.last_heartbeat_at:
            diff = now_tz - device.last_heartbeat_at
            minutes_diff = diff.total_seconds() / 60
            if minutes_diff <= 30:
                status = "healthy"
            elif minutes_diff <= 120:
                status = "warning"
                
        # create dict that pydantic can convert
        device_dict = {
            "id": device.id,
            "device_label": device.device_label,
            "android_id": device.android_id,
            "vtc": device.vtc,
            "last_synced_at": device.last_synced_at,
            "last_heartbeat_at": device.last_heartbeat_at,
            "pending_records": device.pending_records,
            "app_version": device.app_version,
            "encryption_key_version": device.encryption_key_version,
            "created_at": device.created_at,
            "status": status
        }
        results.append(device_dict)

    return {"items": results}
