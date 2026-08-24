from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.session import get_db
from core.security import get_current_user
from core.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/crop", tags=["Crop Recommendation"])

# Placeholder for Crop recommendation model (your friend's model)
class CropRecommendationService:
    @staticmethod
    def recommend_crops(soil_type: str, soil_ph: float, soil_npk: dict, location_lat: float, location_lng: float) -> dict:
        """
        Call your friend's crop recommendation model
        Expected return: [{"crop": "Wheat", "score": 0.92}, ...]
        """
        # TODO: Integrate friend's crop model
        return [
            {
                "rank": 1,
                "crop": "Wheat",
                "suitability_score": 0.92,
                "expected_yield": "45 quintals/acre",
                "water_requirement": "60cm"
            },
            {
                "rank": 2,
                "crop": "Barley",
                "suitability_score": 0.87,
                "expected_yield": "40 quintals/acre",
                "water_requirement": "45cm"
            }
        ]

@router.post("/recommend")
async def recommend_crops(
    soil_type: str,
    soil_ph: float,
    soil_n: float,
    soil_p: float,
    soil_k: float,
    farm_size_acres: float = 1.0,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get crop recommendations based on soil & location"""
    
    try:
        farmer_id = current_user["user_id"]
        
        # Get farmer's location from DB
        from db.models import Farmer
        farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
        if not farmer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Farmer not found"
            )
        
        # Prepare soil data
        soil_npk = {"n": soil_n, "p": soil_p, "k": soil_k}
        
        # Call recommendation model
        recommendations = CropRecommendationService.recommend_crops(
            soil_type=soil_type,
            soil_ph=soil_ph,
            soil_npk=soil_npk,
            location_lat=farmer.location_lat,
            location_lng=farmer.location_lng
        )
        
        logger.info(f"Crop recommendations generated for farmer {farmer_id}")
        
        return {
            "farmer_id": farmer_id,
            "recommendations": recommendations
        }
    
    except Exception as e:
        logger.error(f"Crop recommendation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate recommendations"
        )
