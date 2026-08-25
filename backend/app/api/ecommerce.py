from fastapi import APIRouter, Depends, HTTPException, status

from core.security import get_current_user
from core.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/ecommerce", tags=["E-Commerce Integration"])

class EcommerceService:
    """E-commerce product linking"""
    
    PRODUCT_LINKS = {
        "Chlorothalonil": {
            "amazon": "https://www.amazon.in/s?k=Chlorothalonil",
            "flipkart": "https://www.flipkart.com/s?q=Chlorothalonil",
            "local_brands": [
                {"name": "FMC Chlorothalonil", "price_inr": 450, "seller": "Local Agro Store"},
                {"name": "Cortex Chlorothalonil", "price_inr": 420, "seller": "Farmer's Choice"}
            ]
        },
        "Copper Sulfate": {
            "amazon": "https://www.amazon.in/s?k=Copper+Sulfate",
            "flipkart": "https://www.flipkart.com/s?q=Copper+Sulfate",
            "local_brands": [
                {"name": "Pure Copper Sulfate", "price_inr": 200, "seller": "Local Agro Store"},
                {"name": "Neem Copper Mix", "price_inr": 280, "seller": "Organic Farming Co"}
            ]
        },
        "Mancozeb": {
            "amazon": "https://www.amazon.in/s?k=Mancozeb",
            "flipkart": "https://www.flipkart.com/s?q=Mancozeb",
            "local_brands": [
                {"name": "Indofil Mancozeb", "price_inr": 350, "seller": "Indofil Store"},
                {"name": "BASF Mancozeb", "price_inr": 380, "seller": "BASF Dealer"}
            ]
        },
        "NPK Fertilizer": {
            "amazon": "https://www.amazon.in/s?k=NPK+Fertilizer",
            "flipkart": "https://www.flipkart.com/s?q=NPK",
            "local_brands": [
                {"name": "20:20:20 NPK", "price_inr": 600, "seller": "Local Agro Store"},
                {"name": "DAP Fertilizer", "price_inr": 800, "seller": "Farmer's Co-op"}
            ]
        },
        "Organic Neem Oil": {
            "amazon": "https://www.amazon.in/s?k=Neem+Oil",
            "flipkart": "https://www.flipkart.com/s?q=Neem+Oil",
            "local_brands": [
                {"name": "Pure Neem Oil", "price_inr": 250, "seller": "Organic Farming Co"},
                {"name": "Neem Extract", "price_inr": 220, "seller": "Local Agro Store"}
            ]
        }
    }

@router.get("/products/{product_name}")
async def get_product_links(
    product_name: str,
    current_user: dict = Depends(get_current_user)
):
    """Get e-commerce links for a product"""
    if product_name not in EcommerceService.PRODUCT_LINKS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product '{product_name}' links not found"
        )
    
    products = EcommerceService.PRODUCT_LINKS[product_name]
    logger.info(f"E-commerce links fetched for: {product_name}")
    
    return {
        "product": product_name,
        "online_links": {
            "amazon": products["amazon"],
            "flipkart": products["flipkart"]
        },
        "local_options": products["local_brands"],
        "recommendation": "Compare prices on online platforms and support local farmers/retailers"
    }

@router.get("/pesticides")
async def get_pesticide_products(
    current_user: dict = Depends(get_current_user)
):
    """Get all available pesticide products"""
    pesticides = {}
    for product, data in EcommerceService.PRODUCT_LINKS.items():
        if product not in ["NPK Fertilizer", "Organic Neem Oil"]:
            pesticides[product] = {
                "online_links": {
                    "amazon": data["amazon"],
                    "flipkart": data["flipkart"]
                },
                "local_options_count": len(data["local_brands"]),
                "min_price_inr": min(b["price_inr"] for b in data["local_brands"])
            }
    
    return {
        "total_pesticides": len(pesticides),
        "pesticides": pesticides
    }

@router.get("/fertilizers")
async def get_fertilizer_products(
    current_user: dict = Depends(get_current_user)
):
    """Get all available fertilizer products"""
    fertilizers = {}
    for product, data in EcommerceService.PRODUCT_LINKS.items():
        if product in ["NPK Fertilizer", "Organic Neem Oil"]:
            fertilizers[product] = {
                "online_links": {
                    "amazon": data["amazon"],
                    "flipkart": data["flipkart"]
                },
                "local_options": data["local_brands"]
            }
    
    return {
        "total_fertilizers": len(fertilizers),
        "fertilizers": fertilizers
    }

@router.post("/add-to-cart")
async def add_to_cart(
    product_name: str,
    quantity: int,
    platform: str,
    current_user: dict = Depends(get_current_user)
):
    """Simulate adding product to cart (redirect to actual e-commerce)"""
    if product_name not in EcommerceService.PRODUCT_LINKS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    products = EcommerceService.PRODUCT_LINKS[product_name]
    redirect_url = products.get(platform.lower(), products["amazon"])
    
    logger.info(f"Farmer added {product_name} to cart on {platform}")
    
    return {
        "status": "success",
        "message": f"Redirecting to {platform}...",
        "redirect_url": redirect_url,
        "quantity": quantity,
        "note": "Support local farmers when possible!"
    }
