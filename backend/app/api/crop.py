from fastapi import APIRouter, Depends, HTTPException, status

from db.firestore_db import get_user_by_id
from core.security import get_current_user
from core.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/crop", tags=["Crop Recommendation"])

class CropRecommendationService:
    @staticmethod
    def recommend_crops(soil_type: str, soil_ph: float, soil_npk: dict, location_lat: float, location_lng: float) -> list:
        """
        Call crop recommendation model
        """
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
    current_user: dict = Depends(get_current_user)
):
    """Get crop recommendations based on soil & location"""
    
    try:
        farmer_id = str(current_user.get("user_id", "1"))
        user = get_user_by_id(farmer_id)
        
        lat = float(user.get("latitude") or 21.1458) if user else 21.1458
        lng = float(user.get("longitude") or 79.0882) if user else 79.0882
        
        soil_npk = {"n": soil_n, "p": soil_p, "k": soil_k}
        
        recommendations = CropRecommendationService.recommend_crops(
            soil_type=soil_type,
            soil_ph=soil_ph,
            soil_npk=soil_npk,
            location_lat=lat,
            location_lng=lng
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
