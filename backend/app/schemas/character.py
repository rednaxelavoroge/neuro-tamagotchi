"""Pydantic schemas for character data."""

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict


class CharacterStyle(str, Enum):
    """Available character visual styles."""
    ANIME = "anime"
    CYBERPUNK = "cyberpunk"
    FANTASY = "fantasy"


class CharacterStatus(str, Enum):
    """Character status based on parameters."""
    HAPPY = "happy"
    NORMAL = "normal"
    BORED = "bored"
    TIRED = "tired"
    SAD = "sad"
    EXHAUSTED = "exhausted"


class CharacterParams(BaseModel):
    """Character parameters (stats)."""
    energy: int = Field(ge=0, le=100, description="Energy level (0-100)")
    mood: int = Field(ge=0, le=100, description="Mood/happiness level (0-100)")
    bond: int = Field(ge=0, description="Bond/affection level (0+)")


class CharacterBase(BaseModel):
    """Base schema for character data."""
    name: str = Field(min_length=1, max_length=50, description="Character name")
    style: CharacterStyle = Field(description="Visual style")


class CharacterCreate(CharacterBase):
    """Schema for creating a new character."""
    pass


class CharacterUpdate(BaseModel):
    """Schema for updating an existing character."""
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    avatar_url: Optional[str] = None


class CharacterResponse(BaseModel):
    """Schema for character API responses."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID
    name: str
    style: str
    avatar_url: Optional[str]
    inworld_agent_id: Optional[str]
    inworld_scene_id: Optional[str]
    params: CharacterParams
    status: str
    created_at: datetime

    @classmethod
    def from_orm_model(cls, model) -> "CharacterResponse":
        """Convert ORM model to response schema."""
        return cls(
            id=model.id,
            user_id=model.user_id,
            name=model.name,
            style=model.style,
            avatar_url=model.avatar_url,
            inworld_agent_id=model.inworld_agent_id,
            inworld_scene_id=model.inworld_scene_id,
            params=CharacterParams(
                energy=model.params_energy,
                mood=model.params_mood,
                bond=model.params_bond,
            ),
            status=model.calculate_status(),
            created_at=model.created_at,
        )


class CharacterListResponse(BaseModel):
    """Schema for list of characters response."""
    characters: list[CharacterResponse]
    total: int
