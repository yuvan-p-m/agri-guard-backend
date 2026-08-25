import bcrypt
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from core.config import settings
from core.firebase import is_firebase_initialized

logger = logging.getLogger(__name__)
security = HTTPBearer()

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    pw_bytes = password.encode('utf-8')
    if len(pw_bytes) > 72:
        pw_bytes = pw_bytes[:72]
    return bcrypt.hashpw(pw_bytes, bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash using bcrypt"""
    try:
        pw_bytes = plain_password.encode('utf-8')
        if len(pw_bytes) > 72:
            pw_bytes = pw_bytes[:72]
        return bcrypt.checkpw(pw_bytes, hashed_password.encode('utf-8'))
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT / Firebase-compatible access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Optional[dict]:
    """Decode and verify token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user from Firebase ID token or Bearer token"""
    token = credentials.credentials
    
    # Try verifying as Firebase ID token if Firebase Admin is initialized
    if is_firebase_initialized():
        try:
            from firebase_admin import auth as fb_auth
            decoded_token = fb_auth.verify_id_token(token)
            uid = decoded_token.get("uid")
            email = decoded_token.get("email")
            return {"user_id": uid, "email": email, "firebase": True}
        except Exception as e:
            logger.debug(f"Firebase token verification failed: {e}")

    # Fallback to local token / JWT decode
    payload = decode_token(token)
    if payload and payload.get("sub"):
        return {
            "user_id": payload.get("sub"),
            "email": payload.get("email"),
            "name": payload.get("name")
        }
    
    # Development/Test fallback for plain strings
    if token and not token.startswith("ey"):
        return {"user_id": token, "email": f"{token}@example.com"}

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
