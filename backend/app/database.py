import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.config import settings

logger = logging.getLogger("database")

def get_engine_and_db_url():
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgresql"):
        try:
            # Test PostgreSQL connection
            test_engine = create_engine(db_url, pool_pre_ping=True)
            conn = test_engine.connect()
            conn.close()
            logger.info("Successfully connected to PostgreSQL database!")
            return test_engine, db_url
        except Exception as e:
            fallback_url = "sqlite:///./railway_planner.db"
            logger.warning(
                f"⚠️ Could not connect to PostgreSQL at {db_url}. "
                f"Falling back to local SQLite database ({fallback_url}). Error details: {e}"
            )
            fallback_engine = create_engine(fallback_url, connect_args={"check_same_thread": False})
            return fallback_engine, fallback_url
    else:
        connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}
        return create_engine(db_url, connect_args=connect_args, pool_pre_ping=True), db_url

engine, ACTIVE_DATABASE_URL = get_engine_and_db_url()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency generator yielding database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
