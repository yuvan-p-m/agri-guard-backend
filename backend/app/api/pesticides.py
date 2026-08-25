from fastapi import APIRouter, Depends, HTTPException, status

from core.security import get_current_user
from core.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/pesticides", tags=["Pesticide Advisor"])

class PesticicdeAdvisor:
    """Pesticide dosage recommendations"""
    
    PESTICIDE_DATABASE = {
        "Chlorothalonil": {
            "common_name": "Chlorothalonil",
            "fungicide_type": "Contact Fungicide",
            "for_diseases": ["Early Blight", "Leaf Spot"],
            "for_crops": ["Potato", "Tomato", "Pepper"],
            "dilution_ratio": "1:200",
            "quantity_per_liter": 2.5,
            "spray_interval_days": 7,
            "max_applications": 4,
            "safety": {
                "ppe": "Gloves, mask, eye protection",
                "avoid": "Near water sources, during rain",
                "re_entry_hours": 24
            }
        },
        "Copper Sulfate": {
            "common_name": "Copper Sulfate",
            "fungicide_type": "Contact Fungicide",
            "for_diseases": ["Powdery Mildew", "Rust"],
            "for_crops": ["Wheat", "Barley", "Grapes"],
            "dilution_ratio": "1:100",
            "quantity_per_liter": 1.0,
            "spray_interval_days": 10,
            "max_applications": 3,
            "safety": {
                "ppe": "Gloves, mask",
                "avoid": "Sulfur-based products, during heat",
                "re_entry_hours": 12
            }
        },
        "Mancozeb": {
            "common_name": "Mancozeb",
            "fungicide_type": "Protective Fungicide",
            "for_diseases": ["Early Blight", "Late Blight", "Downy Mildew"],
            "for_crops": ["Potato", "Grape", "Tomato"],
            "dilution_ratio": "1:500",
            "quantity_per_liter": 2.0,
            "spray_interval_days": 7,
            "max_applications": 5,
            "safety": {
                "ppe": "Gloves, mask, full sleeves",
                "avoid": "Extreme heat, near soil",
                "re_entry_hours": 48
            }
        }
    }
    
    @staticmethod
    def get_dosage(disease: str, pesticide_name: str, farm_size_acres: float, crop: str) -> dict:
        if pesticide_name not in PesticicdeAdvisor.PESTICIDE_DATABASE:
            return None
        
        pest_data = PesticicdeAdvisor.PESTICIDE_DATABASE[pesticide_name]
        total_liters = farm_size_acres * 550
        qty_per_liter = pest_data["quantity_per_liter"]
        total_quantity_ml = total_liters * qty_per_liter
        
        spray_schedule = {
            "first_spray": "Within 2 days of disease detection",
            "second_spray": f"{pest_data['spray_interval_days']} days after first spray",
            "third_spray": f"{pest_data['spray_interval_days'] * 2} days after first spray"
        }
        
        return {
            "pesticide": pesticide_name,
            "disease_target": disease,
            "crop": crop,
            "total_quantity_ml": round(total_quantity_ml, 2),
            "dilution_ratio": pest_data["dilution_ratio"],
            "quantity_per_liter_ml": qty_per_liter,
            "total_liters_needed": round(total_liters, 2),
            "spray_schedule": spray_schedule,
            "max_applications_season": pest_data["max_applications"],
            "safety_notes": {
                "ppe": pest_data["safety"]["ppe"],
                "avoid": pest_data["safety"]["avoid"],
                "re_entry_hours": pest_data["safety"]["re_entry_hours"],
                "storage": "Store in cool, dry place away from children"
            },
            "cost_estimate": {
                "price_per_ml": 0.5,
                "estimated_cost": round(total_quantity_ml * 0.5 / 1000, 2)
            }
        }

@router.post("/recommend-dose")
async def recommend_pesticide_dose(
    disease: str,
    pesticide_name: str,
    farm_size_acres: float,
    crop: str,
    current_user: dict = Depends(get_current_user)
):
    """Get pesticide dosage recommendation"""
    
    try:
        farmer_id = str(current_user.get("user_id", "1"))
        dosage = PesticicdeAdvisor.get_dosage(disease, pesticide_name, farm_size_acres, crop)
        
        if not dosage:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pesticide '{pesticide_name}' not found in database"
            )
        
        logger.info(f"Pesticide recommendation: {pesticide_name} for {disease} - Farmer {farmer_id}")
        return dosage
    
    except Exception as e:
        logger.error(f"Pesticide recommendation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate dosage"
        )

@router.get("/available")
async def get_available_pesticides(
    disease: str = None,
    crop: str = None,
    current_user: dict = Depends(get_current_user)
):
    """Get available pesticides for disease/crop"""
    results = []
    for name, data in PesticicdeAdvisor.PESTICIDE_DATABASE.items():
        match = True
        if disease and disease not in data["for_diseases"]:
            match = False
        if crop and crop not in data["for_crops"]:
            match = False
        if match:
            results.append({
                "name": name,
                "type": data["fungicide_type"],
                "for_diseases": data["for_diseases"],
                "for_crops": data["for_crops"]
            })
    return {"total": len(results), "pesticides": results}

@router.get("/database")
async def get_pesticide_database(
    current_user: dict = Depends(get_current_user)
):
    """Get full pesticide database (reference)"""
    return {
        "total_pesticides": len(PesticicdeAdvisor.PESTICIDE_DATABASE),
        "database": PesticicdeAdvisor.PESTICIDE_DATABASE
    }
