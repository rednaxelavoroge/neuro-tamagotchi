"""Mission management endpoints."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db, seed_missions
from app.core.security import get_current_user
from app.models.mission import Mission, CompletedMission
from app.models.character import Character
from app.models.user import User
from app.schemas.mission import (
    MissionResponse,
    CompletedMissionResponse,
    MissionExecuteRequest,
    MissionExecuteResponse,
)

router = APIRouter(prefix="/missions", tags=["Missions"])


@router.get("", response_model=List[MissionResponse])
async def get_missions(
    db: Session = Depends(get_db),
) -> List[MissionResponse]:
    """
    Get all available missions.
    
    Returns:
        List of active mission objects with cost and cooldown info.
    """
    # Seed default missions if none exist
    seed_missions(db)
    
    missions = db.query(Mission).filter(Mission.is_active == True).all()
    return [MissionResponse.from_orm_model(m) for m in missions]


@router.get("/completed", response_model=List[CompletedMissionResponse])
async def get_completed_missions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[CompletedMissionResponse]:
    """
    Get completed missions for the current user.
    
    Returns:
        List of completed mission records with repeat availability.
    """
    completed = db.query(CompletedMission).filter(
        CompletedMission.user_id == current_user.id
    ).order_by(CompletedMission.completed_at.desc()).limit(50).all()
    
    return [CompletedMissionResponse.from_orm_model(c) for c in completed]


@router.post("/{mission_id}/execute", response_model=MissionExecuteResponse)
async def execute_mission(
    mission_id: UUID,
    request: MissionExecuteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MissionExecuteResponse:
    """
    Execute a mission with a character.
    
    This will:
    1. Check if user has sufficient NTG balance
    2. Check if mission is on cooldown for this character
    3. Deduct NTG from user balance
    4. Update character parameters based on mission type
    5. Record the completed mission
    
    Args:
        mission_id: UUID of the mission to execute
        request: Contains character_id to use
        
    Returns:
        Execution result with new balance and character params.
        
    Raises:
        404: Mission or character not found
        400: Insufficient balance or mission on cooldown
    """
    # Get mission
    mission = db.query(Mission).filter(
        Mission.id == mission_id,
        Mission.is_active == True,
    ).first()
    
    if not mission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mission not found",
        )
    
    # Get character
    character = db.query(Character).filter(
        Character.id == request.character_id,
        Character.user_id == current_user.id,
    ).first()
    
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found",
        )
    
    # Check cooldown - find last completion of this mission for this character
    last_completion = db.query(CompletedMission).filter(
        CompletedMission.user_id == current_user.id,
        CompletedMission.character_id == character.id,
        CompletedMission.mission_id == mission.id,
    ).order_by(CompletedMission.completed_at.desc()).first()
    
    if last_completion and not last_completion.can_repeat():
        time_remaining = last_completion.time_until_repeat()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Mission on cooldown. Try again in {time_remaining // 60} minutes.",
        )
    
    # Check balance
    if not current_user.has_sufficient_balance(mission.cost_ntg):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient balance. You need {mission.cost_ntg} NTG.",
        )
    
    # Deduct balance
    current_user.deduct_balance(mission.cost_ntg)
    
    # Update character parameters based on mission type
    if mission.type == "feed":
        character.update_energy(20)
        character.update_mood(10)
        character.update_bond(5)
    elif mission.type == "hairstyle":
        character.update_mood(15)
        character.update_bond(10)
    elif mission.type == "selfie":
        character.update_mood(25)
        character.update_bond(15)
    
    # Record completion
    completed = CompletedMission(
        user_id=current_user.id,
        character_id=character.id,
        mission_id=mission.id,
    )
    db.add(completed)
    db.commit()
    db.refresh(completed)
    db.refresh(character)
    db.refresh(current_user)
    
    return MissionExecuteResponse(
        success=True,
        message=f"Mission '{mission.name}' completed successfully!",
        completed_mission=CompletedMissionResponse.from_orm_model(completed),
        new_balance=current_user.balance_ntg,
        character_params={
            "energy": character.params_energy,
            "mood": character.params_mood,
            "bond": character.params_bond,
        },
    )


@router.get("/{mission_id}/cooldown/{character_id}")
async def check_cooldown(
    mission_id: UUID,
    character_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Check cooldown status for a mission and character.
    
    Args:
        mission_id: UUID of the mission
        character_id: UUID of the character
        
    Returns:
        Cooldown status with time remaining if applicable.
    """
    last_completion = db.query(CompletedMission).filter(
        CompletedMission.user_id == current_user.id,
        CompletedMission.character_id == character_id,
        CompletedMission.mission_id == mission_id,
    ).order_by(CompletedMission.completed_at.desc()).first()
    
    if not last_completion:
        return {
            "on_cooldown": False,
            "can_execute": True,
            "time_remaining": 0,
        }
    
    can_repeat = last_completion.can_repeat()
    time_remaining = last_completion.time_until_repeat()
    
    return {
        "on_cooldown": not can_repeat,
        "can_execute": can_repeat,
        "time_remaining": time_remaining,
        "time_remaining_minutes": time_remaining // 60,
    }
