from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from db.session import get_db
from db.models import Farmer
from schemas.common import FarmerRegister, FarmerLogin, TokenResponse
from core.security import hash_password, verify_password, create_access_token
from core.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(payload: FarmerRegister, db: Session = Depends(get_db)):
    """Register a new farmer"""
    
    # Check if farmer already exists
    existing = db.query(Farmer).filter(Farmer.phone == payload.phone).first()
    if existing:
        logger.warning(f"Registration attempt with existing phone: {payload.phone}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )
    
    # Create new farmer
    farmer = Farmer(
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        name=payload.name,
        location_lat=payload.location_lat,
        location_lng=payload.location_lng,
        soil_type=payload.soil_type
    )
    
    db.add(farmer)
    db.commit()
    db.refresh(farmer)
    
    # Create access token
    access_token = create_access_token(data={"sub": str(farmer.id)})
    logger.info(f"Farmer registered: {farmer.id} - {farmer.phone}")
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=TokenResponse)
def login(payload: FarmerLogin, db: Session = Depends(get_db)):
    """Login farmer"""
    
    # Find farmer by phone
    farmer = db.query(Farmer).filter(Farmer.phone == payload.phone).first()
    if not farmer:
        logger.warning(f"Login attempt with non-existent phone: {payload.phone}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Verify password
    if not verify_password(payload.password, farmer.password_hash):
        logger.warning(f"Failed login attempt for: {payload.phone}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(farmer.id)})
    logger.info(f"Farmer logged in: {farmer.id} - {farmer.phone}")
    
    return {"access_token": access_token, "token_type": "bearer"}
