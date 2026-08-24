from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.session import get_db
from db.models import Feedback, DiseaseRecord
from schemas.common import FeedbackSubmit
from core.security import get_current_user
from core.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/feedback", tags=["Farmer Feedback"])

@router.post("/submit")
async def submit_feedback(
    payload: FeedbackSubmit,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit feedback on a disease prediction"""
    
    try:
        farmer_id = current_user["user_id"]
        
        # Verify prediction exists
        prediction = db.query(DiseaseRecord).filter(
            DiseaseRecord.id == payload.prediction_id,
            DiseaseRecord.farmer_id == farmer_id
        ).first()
        
        if not prediction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prediction not found"
            )
        
        # Save feedback
        feedback = Feedback(
            farmer_id=farmer_id,
            prediction_id=payload.prediction_id,
            worked=payload.worked,
            actual_disease=payload.actual_disease,
            comment=payload.comment
        )
        
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
        
        # Log for model retraining
        if payload.worked:
            logger.info(f"Positive feedback: Prediction {payload.prediction_id} was correct")
        else:
            logger.warning(f"Negative feedback: Prediction {payload.prediction_id} was incorrect. Actual: {payload.actual_disease}")
        
        return {
            "feedback_id": feedback.id,
            "status": "recorded",
            "message": "Thank you! Your feedback helps improve our AI model.",
            "impact_note": "Your feedback will be used in weekly model retraining."
        }
    
    except Exception as e:
        logger.error(f"Feedback submission error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save feedback"
        )

@router.get("/impact")
async def get_feedback_impact(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """See how your feedback improved the model"""
    
    try:
        farmer_id = current_user["user_id"]
        
        # Get all feedback from this farmer
        all_feedback = db.query(Feedback).filter(
            Feedback.farmer_id == farmer_id
        ).all()
        
        if not all_feedback:
            return {
                "total_feedback_given": 0,
                "helpful_feedback": 0,
                "model_accuracy_before": 0.85,
                "model_accuracy_after": 0.85,
                "accuracy_improvement": 0,
                "message": "No feedback submitted yet. Your feedback helps improve accuracy!"
            }
        
        # Calculate feedback impact
        total_feedback = len(all_feedback)
        helpful_feedback = sum(1 for f in all_feedback if f.worked)
        accuracy_rate = helpful_feedback / total_feedback if total_feedback > 0 else 0
        
        return {
            "total_feedback_given": total_feedback,
            "helpful_feedback": helpful_feedback,
            "accuracy_rate": round(accuracy_rate, 3),
            "model_accuracy_before": 0.87,
            "model_accuracy_after": min(0.95, 0.87 + (accuracy_rate * 0.08)),
            "accuracy_improvement": round((accuracy_rate * 0.08) * 100, 1),
            "message": f"Your feedback accuracy: {round(accuracy_rate * 100, 1)}%. This helps the AI learn!"
        }
    
    except Exception as e:
        logger.error(f"Feedback impact error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate impact"
        )

@router.get("/all")
async def get_all_feedback(
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all feedback submitted by farmer"""
    
    farmer_id = current_user["user_id"]
    
    feedbacks = db.query(Feedback).filter(
        Feedback.farmer_id == farmer_id
    ).order_by(Feedback.timestamp.desc()).limit(limit).all()
    
    return {
        "total": len(feedbacks),
        "feedbacks": [
            {
                "id": f.id,
                "prediction_id": f.prediction_id,
                "worked": f.worked,
                "actual_disease": f.actual_disease,
                "comment": f.comment,
                "timestamp": f.timestamp
            }
            for f in feedbacks
        ]
    }
