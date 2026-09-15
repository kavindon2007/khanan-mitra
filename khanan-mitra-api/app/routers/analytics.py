from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any

from app.database import get_db
from app.models.step_log import StepLog
from app.models.training_scenario import TrainingScenario
from app.core.security import get_current_admin
from app.models.admin_user import AdminUser

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/steps")
def get_step_analytics(
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    # Query to calculate step analytics
    # Group by scenario_id and step_key
    
    analytics = db.query(
        StepLog.scenario_id,
        StepLog.step_key,
        func.count(StepLog.id).label('attempts'),
        func.sum(func.cast(StepLog.correct, func.Integer())).label('correct'),
        func.avg(StepLog.time_taken_seconds).label('average_time')
    ).group_by(StepLog.scenario_id, StepLog.step_key).all()

    results = []
    
    for row in analytics:
        scenario = db.query(TrainingScenario).filter(TrainingScenario.id == row.scenario_id).first()
        scenario_key = scenario.scenario_key if scenario else "unknown"
        
        attempts = row.attempts or 0
        correct = int(row.correct) if row.correct is not None else 0
        incorrect = attempts - correct
        accuracy = (correct / attempts) if attempts > 0 else 0.0
        average_time = float(row.average_time) if row.average_time is not None else 0.0

        results.append({
            "scenario_key": scenario_key,
            "step_key": row.step_key,
            "attempts": attempts,
            "correct": correct,
            "incorrect": incorrect,
            "accuracy": accuracy,
            "average_time_seconds": average_time
        })
        
    return {"items": results}
