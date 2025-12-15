"""User database model."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List

from sqlalchemy import Column, String, Integer, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.character import Character
    from app.models.mission import CompletedMission
    from app.models.payment import Payment


class User(Base):
    """
    User model for authentication and account management.
    
    Attributes:
        id: Unique identifier (UUID)
        email: User's email address (unique)
        username: Display name
        password_hash: Hashed password
        balance_ntg: NTG token balance
        free_generation_used: Whether free avatar generation has been used
        is_active: Whether account is active
        is_verified: Whether email is verified
        created_at: Account creation timestamp
        last_login: Last login timestamp
    """
    
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    balance_ntg = Column(Integer, default=100, nullable=False)
    free_generation_used = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    characters = relationship("Character", back_populates="user", cascade="all, delete-orphan")
    completed_missions = relationship("CompletedMission", back_populates="user", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User {self.email}>"

    def has_sufficient_balance(self, amount: int) -> bool:
        """
        Check if user has sufficient NTG balance.
        
        Args:
            amount: Required amount
            
        Returns:
            True if balance >= amount
        """
        return self.balance_ntg >= amount

    def deduct_balance(self, amount: int) -> bool:
        """
        Deduct NTG from user's balance.
        
        Args:
            amount: Amount to deduct
            
        Returns:
            True if successful, False if insufficient balance
        """
        if not self.has_sufficient_balance(amount):
            return False
        self.balance_ntg -= amount
        return True

    def add_balance(self, amount: int) -> None:
        """
        Add NTG to user's balance.
        
        Args:
            amount: Amount to add
        """
        self.balance_ntg += amount

    def update_last_login(self) -> None:
        """Update last login timestamp to now."""
        self.last_login = datetime.utcnow()

    def has_free_generation(self) -> bool:
        """
        Check if user has a free avatar generation available.
        
        Each user gets 1 free generation per account.
        
        Returns:
            True if free generation is available
        """
        return not self.free_generation_used

    def use_free_generation(self) -> bool:
        """
        Use the free avatar generation quota.
        
        Returns:
            True if successfully used, False if already used
        """
        if self.free_generation_used:
            return False
        self.free_generation_used = True
        return True
