"""Database configuration and session management."""

from typing import Generator
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool

from app.core.config import settings


# Create SQLAlchemy engine with connection pooling
engine = create_engine(
    settings.database_url,
    poolclass=QueuePool,
    pool_size=settings.database_pool_size,
    max_overflow=settings.database_max_overflow,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=settings.debug,
    future=True,
)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,
)

# Base class for declarative models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function that provides a database session.
    
    Yields:
        Session: SQLAlchemy database session
        
    Usage:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            return db.query(User).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Initialize the database by creating all tables.
    
    This function should be called on application startup
    to ensure all tables exist.
    """
    from app.models import User, Character, Mission, CompletedMission, Payment
    Base.metadata.create_all(bind=engine)


def drop_db() -> None:
    """
    Drop all database tables.
    
    WARNING: This will delete all data! Use with caution.
    Only use in development/testing environments.
    """
    Base.metadata.drop_all(bind=engine)


def seed_missions(db: Session) -> None:
    """
    Seed the database with default missions.
    
    Args:
        db: Database session
    """
    from app.models.mission import Mission
    
    # Check if missions already exist
    existing = db.query(Mission).first()
    if existing:
        return
    
    default_missions = [
        Mission(
            name="Покорми питомца",
            description="Накорми своего питомца вкусной едой, чтобы восстановить его энергию и поднять настроение.",
            cost_ntg=50,
            type="feed",
            cooldown_seconds=3600,
            is_active=True,
        ),
        Mission(
            name="Смени прическу",
            description="Измени внешний вид своего питомца с новой стильной прической.",
            cost_ntg=150,
            type="hairstyle",
            cooldown_seconds=7200,
            is_active=True,
        ),
        Mission(
            name="Сделай селфи в новом образе",
            description="Сделай красивое селфи с питомцем в уникальном образе и сохрани на память.",
            cost_ntg=300,
            type="selfie",
            cooldown_seconds=14400,
            is_active=True,
        ),
        Mission(
            name="Поиграй с питомцем",
            description="Проведи время играя со своим питомцем, чтобы укрепить вашу связь.",
            cost_ntg=80,
            type="feed",
            cooldown_seconds=1800,
            is_active=True,
        ),
        Mission(
            name="Новый аксессуар",
            description="Укрась своего питомца новым модным аксессуаром.",
            cost_ntg=200,
            type="hairstyle",
            cooldown_seconds=10800,
            is_active=True,
        ),
    ]
    
    for mission in default_missions:
        db.add(mission)
    
    db.commit()


@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """
    Set SQLite pragmas for better performance (only applies to SQLite).
    PostgreSQL connections are unaffected.
    """
    if "sqlite" in settings.database_url:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.close()
