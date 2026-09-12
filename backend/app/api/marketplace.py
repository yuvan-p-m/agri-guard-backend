from fastapi import APIRouter,HTTPException,status,Query,Body
from typing import Optional,Dict,Any
from pydantic import BaseModel

from services.mandi_service import fetch_live_mandi_prices
from services.forecast_service import compute_price_forecast
from services.crop_calendar import get_crop_alert

router=APIRouter(tags=["Marketplace & Mandi Prices"])

class MandiRequest(BaseModel):
    crop:Optional[str]="Rice"
    state:Optional[str]="Tamil Nadu"

class ForecastRequest(BaseModel):
    crop:Optional[str]="Rice"
    state:Optional[str]="Tamil Nadu"

@router.post("/mandi-prices")
@router.post("/api/mandi-prices")
@router.post("/api/v1/mandi-prices")
@router.get("/mandi-prices")
@router.get("/api/mandi-prices")
@router.get("/api/v1/mandi-prices")
async def get_mandi_prices_endpoint(
    payload:Optional[MandiRequest]=None,
    crop:Optional[str]=Query(None),
    state:Optional[str]=Query(None)
):
    try:
        target_crop=(payload.crop if payload and payload.crop else crop) or "Rice"
        target_state=(payload.state if payload and payload.state else state) or "Tamil Nadu"
        result=fetch_live_mandi_prices(crop_name=target_crop,state_name=target_state)
        return {
            "status":"success",
            "source":result.get("source"),
            "state":result.get("state"),
            "crop":result.get("crop"),
            "last_updated":result.get("last_updated"),
            "records":result.get("records",[])
        }
    except Exception as e:
        return {
            "status":"error",
            "message":"No price data available for your crop in your state today. Try again tomorrow.",
            "records":[]
        }

@router.post("/price-forecast")
@router.post("/api/price-forecast")
@router.post("/api/v1/price-forecast")
@router.get("/price-forecast")
@router.get("/api/price-forecast")
@router.get("/api/v1/price-forecast")
async def get_price_forecast_endpoint(
    payload:Optional[ForecastRequest]=None,
    crop:Optional[str]=Query(None),
    state:Optional[str]=Query(None)
):
    try:
        target_crop=(payload.crop if payload and payload.crop else crop) or "Rice"
        target_state=(payload.state if payload and payload.state else state) or "Tamil Nadu"
        result=compute_price_forecast(crop_name=target_crop,state_name=target_state)
        return {
            "status":"success",
            **result
        }
    except Exception as e:
        return {
            "status":"error",
            "message":"Forecast data temporarily unavailable.",
            "weekly_prices":[],
            "forecast":[],
            "trend":"STABLE",
            "pct_change":0.0,
            "recommendation":"Monitor local market arrivals weekly.",
            "record_count":0
        }

@router.get("/crop-alert")
@router.get("/api/crop-alert")
@router.get("/api/v1/crop-alert")
async def get_crop_alert_endpoint(crop:str=Query(default="Rice")):
    try:
        result=get_crop_alert(crop_name=crop)
        return {
            "status":"success",
            **result
        }
    except Exception as e:
        return {
            "status":"error",
            "crop":crop,
            "alert_type":"general_monitoring",
            "message":f"Monitor local market prices for {crop}.",
            "recommendation":"Check multiple local mandis to find the highest price."
        }
