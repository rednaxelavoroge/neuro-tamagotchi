"""Mission database models."""

import uuid
from datetime import datetime, timedelta
from typing import TYPE_CHECKING

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.character import Character


class Mission(Base):
    """
    Mission model representing an action a user can perform with their character.
    
    Attributes:
        id: Unique identifier (UUID)
        name: Mission display name
        description: Mission description
        cost_ntg: Cost in NTG tokens
        type: Mission type (feed, hairstyle, selfie)
        cooldown_seconds: Cooldown period in seconds
        is_active: Whether mission is available
        created_at: Creation timestamp
    """
    
    __tablename__ = "missions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    cost_ntg = Column(Integer, nullable=False, default=0)
    type = Column(String(20), nullable=False)
    cooldown_seconds = Column(Integer, nullable=False, default=3600)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    completed_missions = relationship("CompletedMission", back_populates="mission")

    def __repr__(self) -> str:
        return f"<Mission {self.name} ({self.type})>"

    @property
    def cooldown_minutes(self) -> int:
        """Get cooldown in minutes."""
        return self.cooldown_seconds // 60


class CompletedMission(Base):
    """
    CompletedMission model tracking mission completion history.
    
    Attributes:
        id: Unique identifier (UUID)
        user_id: User who completed the mission
        character_id: Character used for the mission
        mission_id: The mission that was completed
        completed_at: Completion timestamp
    """
    
    __tablename__ = "completed_missions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    character_id = Column(UUID(as_uuid=True), ForeignKey("characters.id", ondelete="CASCADE"), nullable=False)
    mission_id = Column(UUID(as_uuid=True), ForeignKey("missions.id", ondelete="CASCADE"), nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="completed_missions")
    character = relationship("Character", back_populates="completed_missions")
    mission = relationship("Mission", back_populates="completed_missions")

    def __repr__(self) -> str:
        return f"<CompletedMission {self.mission_id} by {self.user_id}>"

    def can_repeat(self) -> bool:
        """
        Check if mission can be repeated (cooldown expired).
        
        Returns:
            True if cooldown has passed, False otherwise
        """
        if not self.mission:
            return True
        
        cooldown = timedelta(seconds=self.mission.cooldown_seconds)
        return datetime.utcnow() >= self.completed_at + cooldown

    def time_until_repeat(self) -> int:
        """
        Get seconds until mission can be repeated.
        
        Returns:
            Seconds remaining, 0 if can repeat now
        """
        if not self.mission:
            return 0
        
        cooldown = timedelta(seconds=self.mission.cooldown_seconds)
        available_at = self.completed_at + cooldown
        remaining = available_at - datetime.utcnow()
        
        return max(0, int(remaining.total_seconds()))
