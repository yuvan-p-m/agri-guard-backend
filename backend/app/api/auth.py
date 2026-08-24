from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
import re

from db.session import get_db
from db.models import User, Farmer
from schemas.common import UserRegister, UserLogin, FarmerRegister, FarmerLogin, TokenResponse, UserProfileResponse
from core.security import hash_password, verify_password, create_access_token, get_current_user
from core.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])

def _build_user_profile(user: User) -> UserProfileResponse:
    return UserProfileResponse(
        id=f"user-{user.id}",
        name=user.full_name,
        email=user.email,
        username=user.email.split('@')[0],
        phone=user.phone or "",
        cropType=user.crop_type or "Citrus (Orange / Lemon)",
        primaryCrop=user.crop_type or "Citrus (Orange / Lemon)",
        location=user.location or "Nagpur",
        role=user.role or "farmer",
        farmSize=2.5,
        farmUnit="Acres",
        state=user.location or "",
        district=user.location or "",
        isLoggedIn=True,
    )

@router.post("/register", response_model=TokenResponse)
@router.post("/signup", response_model=TokenResponse)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """Register a new user account (Sign Up) into the database"""
    email_clean = payload.email.strip().lower()
    
    # 1. Email format validation
    if not re.match(r"^[^@]+@[^@]+\.[^@]+$", email_clean):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid email address format."
        )

    # 2. Confirm Password match validation
    if payload.password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match. Please re-enter your password carefully."
        )

    # 3. Password strength validation
    if len(payload.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is too weak. Must be at least 6 characters long."
        )

    # 4. Check email uniqueness in users table
    existing = db.query(User).filter(func.lower(User.email) == email_clean).first()
    if existing:
        logger.warning(f"Registration attempt with existing email: {email_clean}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in."
        )

    # 5. Create new User securely with bcrypt hash and commit to database
    try:
        new_user = User(
            full_name=payload.full_name.strip(),
            email=email_clean,
            phone=payload.phone.strip() if payload.phone else "",
            password_hash=hash_password(payload.password),
            crop_type=payload.crop_type,
            location=payload.location,
            role=payload.role or "farmer"
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Also sync/create a matching record in the Farmer table for cross-service compatibility
        existing_farmer = db.query(Farmer).filter(
            or_(Farmer.id == new_user.id, (Farmer.phone == new_user.phone) if new_user.phone else False)
        ).first()
        if not existing_farmer:
            new_farmer = Farmer(
                id=new_user.id,
                phone=new_user.phone or f"+91_{new_user.id}",
                username=email_clean.split('@')[0],
                password_hash=new_user.password_hash,
                name=new_user.full_name,
                primary_crop=new_user.crop_type,
                district=new_user.location,
                state=new_user.location
            )
            db.add(new_farmer)
            db.commit()

    except Exception as e:
        db.rollback()
        logger.error(f"Error inserting user into DB: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create account due to a database error: {str(e)}"
        )

    # Create access token
    access_token = create_access_token(data={"sub": str(new_user.id)})
    logger.info(f"User registered successfully: ID {new_user.id} - {new_user.email}")

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": _build_user_profile(new_user)
    }

@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Login user - queries by email, phone, or username and verifies hashed password"""
    identifier_clean = payload.email.strip().lower()

    if not identifier_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide your email address to sign in."
        )

    # 1. Lookup user in database by email, phone, or username prefix
    user = db.query(User).filter(
        or_(
            func.lower(User.email) == identifier_clean,
            User.phone == payload.email.strip(),
            func.lower(User.email).like(f"{identifier_clean}@%")
        )
    ).first()
    
    # 2. Check if account exists
    if not user:
        # Check farmer table as fallback
        farmer = db.query(Farmer).filter(
            or_(
                Farmer.phone == payload.email.strip(),
                func.lower(Farmer.username) == identifier_clean
            )
        ).first()

        if farmer and verify_password(payload.password, farmer.password_hash):
            # Create user mirror for this farmer
            user = User(
                id=farmer.id,
                full_name=farmer.name or "Farmer",
                email=f"{farmer.username or 'farmer'}@agriguard.ai" if not '@' in identifier_clean else identifier_clean,
                phone=farmer.phone or "",
                password_hash=farmer.password_hash,
                crop_type=farmer.primary_crop,
                location=farmer.district or "Nagpur",
                role="farmer"
            )
            try:
                db.add(user)
                db.commit()
                db.refresh(user)
            except Exception:
                db.rollback()
                user = db.query(User).filter(User.id == farmer.id).first()

        if not user:
            logger.warning(f"Login attempt for non-existent account: '{identifier_clean}'")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unable to login: Account not found with this email address. Please create an account first."
            )

    # 3. Verify password against stored bcrypt hash
    if not verify_password(payload.password, user.password_hash):
        logger.warning(f"Failed password attempt for account: '{identifier_clean}'")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unable to login: Incorrect password. Please try again."
        )

    # 4. Generate JWT session token
    access_token = create_access_token(data={"sub": str(user.id)})
    logger.info(f"User logged in successfully: ID {user.id} - {user.email}")

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": _build_user_profile(user)
    }

@router.get("/me", response_model=UserProfileResponse)
def get_current_user_profile(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current authenticated user profile"""
    user_id = current_user.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    return _build_user_profile(user)

# Root-level router for direct /signup, /register, /login requests
root_router = APIRouter(tags=["Authentication"])
root_router.add_api_route("/signup", register, methods=["POST"], response_model=TokenResponse)
root_router.add_api_route("/register", register, methods=["POST"], response_model=TokenResponse)
root_router.add_api_route("/login", login, methods=["POST"], response_model=TokenResponse)

