"""Character database model."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class Character(Base):
    """
    Character model representing a user's AI companion.
    
    Attributes:
        id: Unique identifier (UUID)
        user_id: Owner's user ID
        name: Character's display name
        style: Visual style (anime, cyberpunk, fantasy)
        avatar_url: URL to character's avatar image
        inworld_agent_id: InWorld AI agent identifier
        inworld_scene_id: InWorld AI scene identifier
        params_energy: Energy level (0-100)
        params_mood: Mood/happiness level (0-100)
        params_bond: Bond/affection level (0+)
        created_at: Creation timestamp
    """
    
    __tablename__ = "characters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(50), nullable=False)
    style = Column(String(20), nullable=False, default="anime")
    avatar_url = Column(Text, nullable=True)
    inworld_agent_id = Column(String(100), nullable=True)
    inworld_scene_id = Column(String(100), nullable=True)
    
    # Character parameters (stats)
    params_energy = Column(Integer, nullable=False, default=100)
    params_mood = Column(Integer, nullable=False, default=100)
    params_bond = Column(Integer, nullable=False, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="characters")
    completed_missions = relationship("CompletedMission", back_populates="character", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Character {self.name} ({self.style})>"

    def calculate_status(self) -> str:
        """
        Calculate character status based on parameters.
        
        Returns:
            Status string: happy, normal, bored, tired, sad, exhausted
        """
        avg = (self.params_energy + self.params_mood) / 2
        
        if avg >= 80:
            return "happy"
        elif avg >= 60:
            return "normal"
        elif avg >= 40:
            return "bored"
        elif avg >= 20:
            if self.params_energy < self.params_mood:
                return "tired"
            return "sad"
        return "exhausted"

    def update_energy(self, amount: int) -> None:
        """
        Update energy parameter.
        
        Args:
            amount: Amount to add (can be negative)
        """
        self.params_energy = max(0, min(100, self.params_energy + amount))

    def update_mood(self, amount: int) -> None:
        """
        Update mood parameter.
        
        Args:
            amount: Amount to add (can be negative)
        """
        self.params_mood = max(0, min(100, self.params_mood + amount))

    def update_bond(self, amount: int) -> None:
        """
        Update bond parameter.
        
        Args:
            amount: Amount to add (can be negative)
        """
        self.params_bond = max(0, self.params_bond + amount)

    @property
    def is_happy(self) -> bool:
        """Check if character is in happy state."""
        return self.calculate_status() == "happy"

    @property
    def is_exhausted(self) -> bool:
        """Check if character is exhausted."""
        return self.calculate_status() == "exhausted"

    @property
    def needs_attention(self) -> bool:
        """Check if character needs attention (low stats)."""
        return self.params_energy < 30 or self.params_mood < 30
