from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Session:
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database - create all tables and migrate missing columns"""
    from db.models import Base
    Base.metadata.create_all(bind=engine)
    
    # Auto-add missing columns for SQLite
    with engine.connect() as conn:
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        if "farmers" in inspector.get_table_names():
            columns = [c["name"] for c in inspector.get_columns("farmers")]
            missing_cols = {
                "username": "VARCHAR",
                "primary_crop": "VARCHAR",
                "farm_unit": "VARCHAR DEFAULT 'Acres'",
                "state": "VARCHAR",
                "district": "VARCHAR",
            }
            for col_name, col_type in missing_cols.items():
                if col_name not in columns:
                    try:
                        conn.execute(text(f"ALTER TABLE farmers ADD COLUMN {col_name} {col_type}"))
                        conn.commit()
                    except Exception:
                        pass
