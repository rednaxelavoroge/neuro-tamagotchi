"""Character management endpoints - Avatar Studio API."""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.character import Character
from app.models.user import User
from app.schemas.character import (
    CharacterCreate,
    CharacterUpdate,
    CharacterResponse,
    CharacterStyle,
)
from app.services.sd_service import sd_service
from app.services.inworld_service import inworld_service

router = APIRouter(prefix="/characters", tags=["Characters"])


# ============================================================================
# Constants
# ============================================================================

GENERATION_COST_NTG = 100  # Cost for avatar generation after free tier
MAX_CHARACTERS_FREE = 3    # Maximum characters for free users


# ============================================================================
# Request/Response Schemas for Avatar Studio
# ============================================================================

class CreateCharacterRequest(BaseModel):
    """Request schema for character creation with appearance generation."""
    
    name: str = Field(
        min_length=2,
        max_length=50,
        description="Character name (2-50 characters)",
        examples=["Luna"],
    )
    style: str = Field(
        description="Visual style: anime, cyberpunk, fantasy",
        examples=["anime"],
    )
    prompt: Optional[str] = Field(
        None,
        max_length=500,
        description="Appearance description prompt",
        examples=["рыжие волосы, зеленые глаза, веснушки, улыбка"],
    )


class CharacterWithVariantsResponse(BaseModel):
    """Response schema for character creation with avatar variants."""
    
    character_id: str = Field(description="Character UUID")
    name: str = Field(description="Character name")
    style: str = Field(description="Visual style")
    avatar_url: Optional[str] = Field(description="Selected avatar URL")
    variants: List[str] = Field(description="4 generated avatar variant URLs")
    inworld_scene_id: Optional[str] = Field(description="InWorld scene ID")
    inworld_agent_id: Optional[str] = Field(description="InWorld agent ID")
    params: dict = Field(description="Character parameters")


class GenerateVariantsRequest(BaseModel):
    """Request schema for generating new avatar variants."""
    
    style: str = Field(description="Visual style: anime, cyberpunk, fantasy")
    prompt: Optional[str] = Field(None, max_length=500, description="Appearance prompt")


class GenerateVariantsResponse(BaseModel):
    """Response schema for generated variants."""
    
    variants: List[str] = Field(description="4 generated avatar URLs")


class SelectVariantRequest(BaseModel):
    """Request schema for selecting an avatar variant."""
    
    variant_url: str = Field(description="URL of selected variant")


class FinalizeCharacterRequest(BaseModel):
    """Request schema for finalizing character creation."""
    
    name: str = Field(min_length=2, max_length=50, description="Character name")


class GenerationQuotaResponse(BaseModel):
    """Response schema for generation quota check."""
    
    has_free_generation: bool = Field(description="Whether user has free generation available")
    generation_cost_ntg: int = Field(description="Cost in NTG for generation after free tier")
    current_balance: int = Field(description="User's current NTG balance")
    can_generate: bool = Field(description="Whether user can generate (free or has balance)")
    character_count: int = Field(description="Number of existing characters")
    max_characters: int = Field(description="Maximum characters allowed")
    can_create_character: bool = Field(description="Whether user can create another character")


class PaginatedCharactersResponse(BaseModel):
    """Response schema for paginated character list."""
    
    characters: List[CharacterResponse] = Field(description="List of characters")
    total: int = Field(description="Total number of characters")
    skip: int = Field(description="Number of records skipped")
    limit: int = Field(description="Maximum records per page")
    has_more: bool = Field(description="Whether there are more records")


# ============================================================================
# Avatar Studio Endpoints
# ============================================================================

@router.get("/quota", response_model=GenerationQuotaResponse)
async def get_generation_quota(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> GenerationQuotaResponse:
    """
    Check user's avatar generation quota and balance.
    
    Returns information about:
    - Whether free generation is available
    - Current NTG balance
    - Whether user can generate (free or paid)
    - Character slot availability
    
    Use this before showing the Avatar Studio to determine UI state.
    """
    character_count = db.query(Character).filter(
        Character.user_id == current_user.id
    ).count()
    
    has_free = current_user.has_free_generation()
    can_afford = current_user.has_sufficient_balance(GENERATION_COST_NTG)
    can_create = character_count < MAX_CHARACTERS_FREE
    
    return GenerationQuotaResponse(
        has_free_generation=has_free,
        generation_cost_ntg=GENERATION_COST_NTG,
        current_balance=current_user.balance_ntg,
        can_generate=has_free or can_afford,
        character_count=character_count,
        max_characters=MAX_CHARACTERS_FREE,
        can_create_character=can_create,
    )


@router.post("/create", response_model=CharacterWithVariantsResponse, status_code=status.HTTP_201_CREATED)
async def create_character_with_generation(
    request: CreateCharacterRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CharacterWithVariantsResponse:
    """
    Create a new character with AI-generated avatar variants.
    
    This endpoint:
    1. Checks user has free generation quota (1 free per account) OR sufficient NTG balance
    2. Checks user has character slots available (max 3)
    3. Generates 4 avatar variants using Stable Diffusion
    4. Creates InWorld AI agent for conversation
    5. Saves character to database with initial params
    6. Returns character with all variants
    
    Args:
        request: Name, style, and optional appearance prompt
        
    Returns:
        Character data with 4 avatar variant URLs
        
    Raises:
        400: Maximum characters reached or insufficient balance
        402: Payment required (no free generation and insufficient NTG)
        500: Generation failed
    """
    # Check character limit (3 for free users)
    existing_count = db.query(Character).filter(
        Character.user_id == current_user.id
    ).count()
    
    if existing_count >= MAX_CHARACTERS_FREE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum of {MAX_CHARACTERS_FREE} characters allowed. Delete a character to create a new one.",
        )
    
    # Check free generation quota or NTG balance
    using_free_generation = False
    if current_user.has_free_generation():
        using_free_generation = True
    elif not current_user.has_sufficient_balance(GENERATION_COST_NTG):
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Insufficient NTG balance. Character creation costs {GENERATION_COST_NTG} NTG. "
                   f"Your balance: {current_user.balance_ntg} NTG.",
        )
    
    # Validate style
    valid_styles = ["anime", "cyberpunk", "fantasy"]
    style = request.style.lower()
    if style not in valid_styles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid style. Must be one of: {', '.join(valid_styles)}",
        )
    
    # Generate avatar variants
    try:
        variants = await sd_service.generate_portraits(
            style=style,
            prompt=request.prompt or "",
        )
    except Exception as e:
        print(f"Avatar generation failed: {e}")
        # Use fallback placeholders
        variants = sd_service.get_placeholder_avatars(style, 4)
    
    # Create InWorld AI agent
    try:
        inworld_data = await inworld_service.create_agent(
            name=request.name,
            style=style,
        )
    except Exception as e:
        print(f"InWorld agent creation failed: {e}")
        inworld_data = {
            "agent_id": f"mock_agent_{request.name.lower()}",
            "scene_id": f"mock_scene_{request.name.lower()}",
        }
    
    # Deduct cost or use free generation
    if using_free_generation:
        current_user.use_free_generation()
    else:
        current_user.deduct_balance(GENERATION_COST_NTG)
    
    # Create character with first variant as default and initial params
    character = Character(
        user_id=current_user.id,
        name=request.name,
        style=style,
        avatar_url=variants[0] if variants else None,
        inworld_agent_id=inworld_data.get("agent_id"),
        inworld_scene_id=inworld_data.get("scene_id"),
        params_energy=100,
        params_mood=100,
        params_bond=0,
    )
    
    db.add(character)
    db.commit()
    db.refresh(character)
    
    return CharacterWithVariantsResponse(
        character_id=str(character.id),
        name=character.name,
        style=character.style,
        avatar_url=character.avatar_url,
        variants=variants,
        inworld_scene_id=character.inworld_scene_id,
        inworld_agent_id=character.inworld_agent_id,
        params={
            "energy": character.params_energy,
            "mood": character.params_mood,
            "bond": character.params_bond,
        },
    )


@router.post("/generate-variants", response_model=GenerateVariantsResponse)
async def generate_avatar_variants(
    request: GenerateVariantsRequest,
    current_user: User = Depends(get_current_user),
) -> GenerateVariantsResponse:
    """
    Generate 4 new avatar variants without creating a character.
    
    Useful for regenerating options before finalizing.
    
    Args:
        request: Style and optional appearance prompt
        
    Returns:
        List of 4 avatar URLs
    """
    valid_styles = ["anime", "cyberpunk", "fantasy"]
    style = request.style.lower()
    if style not in valid_styles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid style. Must be one of: {', '.join(valid_styles)}",
        )
    
    try:
        variants = await sd_service.generate_portraits(
            style=style,
            prompt=request.prompt or "",
        )
    except Exception as e:
        print(f"Avatar generation failed: {e}")
        variants = sd_service.get_placeholder_avatars(style, 4)
    
    return GenerateVariantsResponse(variants=variants)


@router.patch("/{character_id}/select-variant", response_model=CharacterResponse)
async def select_avatar_variant(
    character_id: UUID,
    request: SelectVariantRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CharacterResponse:
    """
    Select a specific avatar variant for a character.
    
    Args:
        character_id: Character UUID
        request: URL of selected variant
        
    Returns:
        Updated character data
    """
    character = db.query(Character).filter(
        Character.id == character_id,
        Character.user_id == current_user.id,
    ).first()
    
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found",
        )
    
    character.avatar_url = request.variant_url
    db.commit()
    db.refresh(character)
    
    return CharacterResponse.from_orm_model(character)


@router.patch("/{character_id}/finalize", response_model=CharacterResponse)
async def finalize_character(
    character_id: UUID,
    request: FinalizeCharacterRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CharacterResponse:
    """
    Finalize character creation with final name.
    
    Args:
        character_id: Character UUID
        request: Final character name
        
    Returns:
        Finalized character data
    """
    character = db.query(Character).filter(
        Character.id == character_id,
        Character.user_id == current_user.id,
    ).first()
    
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found",
        )
    
    character.name = request.name
    db.commit()
    db.refresh(character)
    
    return CharacterResponse.from_orm_model(character)


# ============================================================================
# Standard CRUD Endpoints
# ============================================================================

@router.get("", response_model=List[CharacterResponse])
async def get_characters(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[CharacterResponse]:
    """
    Get all characters for the current user.
    
    Returns:
        List of character objects with all parameters and status.
    """
    characters = db.query(Character).filter(
        Character.user_id == current_user.id
    ).order_by(Character.created_at.desc()).all()
    
    return [CharacterResponse.from_orm_model(c) for c in characters]


@router.get("/my", response_model=PaginatedCharactersResponse)
async def get_my_characters(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaginatedCharactersResponse:
    """
    Get all characters for the current user with pagination.
    
    Args:
        skip: Number of records to skip (default: 0)
        limit: Maximum records to return (default: 10, max: 50)
        
    Returns:
        Paginated list of characters with metadata
    """
    # Clamp limit to reasonable range
    limit = min(max(1, limit), 50)
    
    # Get total count
    total = db.query(Character).filter(
        Character.user_id == current_user.id
    ).count()
    
    # Get paginated results
    characters = db.query(Character).filter(
        Character.user_id == current_user.id
    ).order_by(Character.created_at.desc()).offset(skip).limit(limit).all()
    
    return PaginatedCharactersResponse(
        characters=[CharacterResponse.from_orm_model(c) for c in characters],
        total=total,
        skip=skip,
        limit=limit,
        has_more=(skip + len(characters)) < total,
    )


@router.get("/{character_id}", response_model=CharacterResponse)
async def get_character(
    character_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CharacterResponse:
    """
    Get a specific character by ID.
    
    Args:
        character_id: UUID of the character
        
    Returns:
        Character object with all parameters and status.
    """
    character = db.query(Character).filter(
        Character.id == character_id,
        Character.user_id == current_user.id,
    ).first()
    
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found",
        )
    
    return CharacterResponse.from_orm_model(character)


@router.patch("/{character_id}", response_model=CharacterResponse)
async def update_character(
    character_id: UUID,
    character_data: CharacterUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CharacterResponse:
    """
    Update an existing character.
    
    Args:
        character_id: UUID of the character to update
        character_data: Fields to update (name, avatar_url)
        
    Returns:
        Updated character object.
    """
    character = db.query(Character).filter(
        Character.id == character_id,
        Character.user_id == current_user.id,
    ).first()
    
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found",
        )
    
    if character_data.name is not None:
        character.name = character_data.name
    if character_data.avatar_url is not None:
        character.avatar_url = character_data.avatar_url
    
    db.commit()
    db.refresh(character)
    
    return CharacterResponse.from_orm_model(character)


@router.delete("/{character_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_character(
    character_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Delete a character.
    
    Args:
        character_id: UUID of the character to delete
    """
    character = db.query(Character).filter(
        Character.id == character_id,
        Character.user_id == current_user.id,
    ).first()
    
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found",
        )
    
    db.delete(character)
    db.commit()


@router.post("/{character_id}/regenerate-avatar", response_model=GenerateVariantsResponse)
async def regenerate_avatar(
    character_id: UUID,
    request: GenerateVariantsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> GenerateVariantsResponse:
    """
    Generate new avatar variants for an existing character.
    
    Args:
        character_id: UUID of the character
        request: Style and optional prompt
        
    Returns:
        List of 4 new avatar URLs
    """
    character = db.query(Character).filter(
        Character.id == character_id,
        Character.user_id == current_user.id,
    ).first()
    
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found",
        )
    
    try:
        variants = await sd_service.generate_portraits(
            style=request.style or character.style,
            prompt=request.prompt or "",
        )
    except Exception as e:
        print(f"Avatar regeneration failed: {e}")
        variants = sd_service.get_placeholder_avatars(character.style, 4)
    
    return GenerateVariantsResponse(variants=variants)
