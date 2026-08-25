from fastapi import APIRouter, Depends, HTTPException, status
import re
import uuid
from datetime import datetime, timezone

from firebase_admin import auth as fb_auth

from db.firestore_db import get_user_by_email, get_user_by_id, create_user
from schemas.common import UserRegister, UserLogin, TokenResponse, UserProfileResponse
from core.security import hash_password, verify_password, create_access_token, get_current_user
from core.firebase import is_firebase_initialized
from core.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])

def _build_user_profile_dict(user: dict) -> UserProfileResponse:
    email = user.get("email", "")
    username = email.split('@')[0] if '@' in email else email
    return UserProfileResponse(
        id=str(user.get("id") or user.get("uid") or "1"),
        name=user.get("full_name") or user.get("name") or "Farmer",
        email=email,
        username=username,
        phone=user.get("phone") or "",
        cropType=user.get("crop_type") or "Citrus (Orange / Lemon)",
        primaryCrop=user.get("crop_type") or "Citrus (Orange / Lemon)",
        location=user.get("location") or "Nagpur",
        latitude=user.get("latitude"),
        longitude=user.get("longitude"),
        role=user.get("role") or "farmer",
        farmSize=float(user.get("farm_size_acres") or 2.5),
        farmUnit=user.get("farm_unit") or "Acres",
        state=user.get("state") or user.get("location") or "Maharashtra",
        district=user.get("district") or user.get("location") or "Nagpur",
        isLoggedIn=True,
    )

@router.post("/signup", response_model=TokenResponse)
@router.post("/register", response_model=TokenResponse)
def signup(payload: UserRegister):
    """
    Signup Route (/signup)
    1. Validates email format, password match & length.
    2. Checks if email already exists in Auth / Firestore -> returns 'account already exists.'
    3. Creates user in Firebase Auth (`auth.create_user`) if enabled.
    4. Stores complete profile in Firestore (`users/{uid}`).
    5. Returns success token & user profile.
    """
    email_clean = payload.email.strip().lower()
    
    # 1. Input validations
    if not re.match(r"^[^@]+@[^@]+\.[^@]+$", email_clean):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid email address format."
        )

    if payload.password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )

    if len(payload.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is too weak. Must be at least 6 characters long."
        )

    # 2. Strict Uniqueness Check: Check if account already exists in Firestore
    existing_firestore = get_user_by_email(email_clean)
    if existing_firestore:
        logger.warning(f"Signup attempt with existing email in Firestore: {email_clean}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="account already exists."
        )

    # Check Firebase Auth for existing user
    if is_firebase_initialized():
        try:
            fb_auth.get_user_by_email(email_clean)
            logger.warning(f"Signup attempt with existing email in Firebase Auth: {email_clean}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="account already exists."
            )
        except fb_auth.UserNotFoundError:
            pass  # Does not exist, proceed with creation
        except HTTPException:
            raise
        except Exception as e:
            logger.debug(f"Firebase Auth check notice: {e}")

    # 3. Create User in Firebase Authentication
    uid = None
    if is_firebase_initialized():
        try:
            fb_user = fb_auth.create_user(
                email=email_clean,
                password=payload.password,
                display_name=payload.full_name.strip()
            )
            uid = fb_user.uid
            logger.info(f"Firebase Auth user created: UID {uid}")
        except fb_auth.EmailAlreadyExistsError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="account already exists."
            )
        except Exception as e:
            logger.warning(f"Firebase Auth create_user warning (falling back to direct Firestore record): {e}")

    if not uid:
        uid = str(uuid.uuid4())

    # 4. Store user details in Firestore under `users/{uid}`
    timestamp = datetime.now(timezone.utc).isoformat()
    user_data = {
        "id": uid,
        "uid": uid,
        "name": payload.full_name.strip(),
        "full_name": payload.full_name.strip(),
        "email": email_clean,
        "phone": payload.phone.strip() if payload.phone else "",
        "password_hash": hash_password(payload.password),
        "crop_type": payload.crop_type or "Citrus (Orange / Lemon)",
        "location": payload.location or "Nagpur",
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "role": payload.role or "farmer",
        "created_at": timestamp
    }

    try:
        user_record = create_user(user_data, custom_id=uid)
    except Exception as e:
        logger.error(f"Error inserting user document into Firestore: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to store user profile in Firestore: {str(e)}"
        )

    # 5. Issue token and return user profile from Firestore
    access_token = create_access_token(data={"sub": uid, "email": email_clean})
    logger.info(f"User signed up successfully: UID {uid} - {email_clean}")

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": _build_user_profile_dict(user_record)
    }

@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin):
    """
    Login Route (/login)
    1. Lookup user in Firestore / Firebase Auth.
    2. If email does not exist -> returns 'account not found.'
    3. Verifies password -> if wrong returns 'invalid credentials.'
    4. Fetches Firestore user profile (`users/{uid}`) and returns token + profile.
    """
    email_clean = payload.email.strip().lower()

    if not email_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide your email address to sign in."
        )

    # 1. Strict Lookup: Check if account exists in Firestore
    user = get_user_by_email(email_clean)

    # If not in Firestore, check Firebase Auth
    fb_user = None
    if not user and is_firebase_initialized():
        try:
            fb_user = fb_auth.get_user_by_email(email_clean)
        except fb_auth.UserNotFoundError:
            fb_user = None
        except Exception as e:
            logger.debug(f"Firebase Auth login lookup notice: {e}")

    # 2. Strict Error: If account does NOT exist in Firestore or Firebase Auth
    if not user and not fb_user:
        logger.warning(f"Login attempt for non-existent account: '{email_clean}'")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="account not found."
        )

    # 3. Strict Password Verification
    if user and user.get("password_hash"):
        if not verify_password(payload.password, user["password_hash"]):
            logger.warning(f"Failed password attempt for account: '{email_clean}'")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="invalid credentials."
            )

    uid = str(user.get("id") or user.get("uid")) if user else fb_user.uid

    # 4. Database Consistency: Always fetch Firestore profile after verification
    firestore_profile = get_user_by_id(uid)
    if not firestore_profile and user:
        firestore_profile = user
    elif not firestore_profile and fb_user:
        timestamp = datetime.now(timezone.utc).isoformat()
        user_data = {
            "id": uid,
            "uid": uid,
            "name": fb_user.display_name or email_clean.split('@')[0].capitalize(),
            "full_name": fb_user.display_name or email_clean.split('@')[0].capitalize(),
            "email": email_clean,
            "password_hash": hash_password(payload.password),
            "created_at": timestamp
        }
        firestore_profile = create_user(user_data, custom_id=uid)

    access_token = create_access_token(data={"sub": uid, "email": email_clean})
    logger.info(f"User logged in successfully: UID {uid} - {email_clean}")

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": _build_user_profile_dict(firestore_profile)
    }

@router.get("/me", response_model=UserProfileResponse)
def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user profile from Firestore"""
    user_id = current_user.get("user_id")
    email = current_user.get("email")

    user = get_user_by_id(user_id) if user_id else None
    if not user and email:
        user = get_user_by_email(email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="account not found."
        )
    
    return _build_user_profile_dict(user)

# Root-level router for direct /signup, /register, /login requests
root_router = APIRouter(tags=["Authentication"])
root_router.add_api_route("/signup", signup, methods=["POST"], response_model=TokenResponse)
root_router.add_api_route("/register", signup, methods=["POST"], response_model=TokenResponse)
root_router.add_api_route("/login", login, methods=["POST"], response_model=TokenResponse)
