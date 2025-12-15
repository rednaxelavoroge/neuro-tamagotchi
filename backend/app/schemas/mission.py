"""Pydantic schemas for mission data."""

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict


class MissionType(str, Enum):
    """Available mission types."""
    FEED = "feed"
    HAIRSTYLE = "hairstyle"
    SELFIE = "selfie"


class MissionBase(BaseModel):
    """Base schema for mission data."""
    name: str = Field(min_length=1, max_length=100, description="Mission name")
    description: Optional[str] = Field(None, max_length=500, description="Mission description")
    cost_ntg: int = Field(ge=0, description="Cost in NTG tokens")
    type: MissionType = Field(description="Mission type")
    cooldown_seconds: int = Field(ge=0, description="Cooldown in seconds")


class MissionCreate(MissionBase):
    """Schema for creating a new mission."""
    is_active: bool = True


class MissionUpdate(BaseModel):
    """Schema for updating an existing mission."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    cost_ntg: Optional[int] = Field(None, ge=0)
    cooldown_seconds: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class MissionResponse(BaseModel):
    """Schema for mission API responses."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    name: str
    description: Optional[str]
    cost_ntg: int
    type: str
    cooldown_seconds: int
    cooldown_minutes: int
    is_active: bool

    @classmethod
    def from_orm_model(cls, model) -> "MissionResponse":
        """Convert ORM model to response schema."""
        return cls(
            id=model.id,
            name=model.name,
            description=model.description,
            cost_ntg=model.cost_ntg,
            type=model.type,
            cooldown_seconds=model.cooldown_seconds,
            cooldown_minutes=model.cooldown_seconds // 60,
            is_active=model.is_active,
        )


class CompletedMissionResponse(BaseModel):
    """Schema for completed mission API responses."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID
    character_id: UUID
    mission_id: UUID
    mission: Optional[MissionResponse]
    completed_at: datetime
    can_repeat: bool
    time_until_repeat: int

    @classmethod
    def from_orm_model(cls, model) -> "CompletedMissionResponse":
        """Convert ORM model to response schema."""
        mission_response = None
        if model.mission:
            mission_response = MissionResponse.from_orm_model(model.mission)
        
        return cls(
            id=model.id,
            user_id=model.user_id,
            character_id=model.character_id,
            mission_id=model.mission_id,
            mission=mission_response,
            completed_at=model.completed_at,
            can_repeat=model.can_repeat(),
            time_until_repeat=model.time_until_repeat(),
        )


class MissionExecuteRequest(BaseModel):
    """Schema for mission execution request."""
    character_id: UUID = Field(description="Character ID to execute mission with")


class MissionExecuteResponse(BaseModel):
    """Schema for mission execution response."""
    success: bool
    message: str
    completed_mission: Optional[CompletedMissionResponse]
    new_balance: int
    character_params: Optional[dict]
