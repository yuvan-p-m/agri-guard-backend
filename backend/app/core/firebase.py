import os
import logging
import firebase_admin
from firebase_admin import credentials, firestore, auth

logger = logging.getLogger(__name__)

_firebase_app = None
_db = None
_is_initialized = False

def init_firebase():
    """
    Initialize Firebase Admin SDK safely.
    Checks ENABLE_FIREBASE env var (defaults to true if key exists) and serviceAccountKey.json.
    """
    global _firebase_app, _db, _is_initialized
    if _firebase_app:
        return _firebase_app

    enable_fb = os.getenv("ENABLE_FIREBASE", "true").lower() in ("true", "1", "yes")
    cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY", "serviceAccountKey.json")
    
    if enable_fb and os.path.exists(cred_path):
        try:
            cred = credentials.Certificate(cred_path)
            _firebase_app = firebase_admin.initialize_app(cred)
            _db = firestore.client()
            _is_initialized = True
            logger.info("Firebase Admin initialized successfully using service account key.")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin with key '{cred_path}': {e}")
            _is_initialized = False
    else:
        _is_initialized = False

    return _firebase_app

def is_firebase_initialized() -> bool:
    global _is_initialized
    return _is_initialized and _firebase_app is not None

def get_firestore_db():
    """
    Get Firestore DB client instance.
    """
    global _db
    if _db is None:
        init_firebase()
    return _db

# Attempt initialization at import time
init_firebase()
