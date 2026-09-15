from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models.admin_user import AdminUser
from app.models.audit_log import AuditLog
from app.schemas.auth import LoginRequest, Token
from app.core.security import verify_password, create_access_token
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    admin = db.query(AdminUser).filter(AdminUser.email == request.email).first()
    
    if not admin or not verify_password(request.password, admin.password_hash) or not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": admin.email, "role": admin.role},
        expires_delta=access_token_expires
    )

    admin.last_login_at = datetime.utcnow()
    
    # Create audit log
    audit_log = AuditLog(
        actor_type="admin_user",
        actor_id=admin.id,
        action="LOGIN",
        metadata_={"email": admin.email}
    )
    db.add(audit_log)
    db.commit()
    db.refresh(admin)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": admin
    }
