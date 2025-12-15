"""
Authentication endpoints for user registration, login, and profile management.

Endpoints:
- POST /auth/register - Create new user account
- POST /auth/login - Authenticate and get token
- POST /auth/forgot-password - Request password reset
- GET /auth/me - Get current user profile
"""

import re
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field, field_validator
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    validate_password_strength,
    validate_username,
)
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ============================================================================
# Request/Response Schemas
# ============================================================================

class RegisterRequest(BaseModel):
    """Request schema for user registration."""
    
    email: EmailStr = Field(
        ...,
        description="User's email address",
        examples=["user@example.com"],
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)",
        examples=["SecurePass123"],
    )
    username: str = Field(
        ...,
        min_length=3,
        max_length=20,
        description="Display username (3-20 alphanumeric characters)",
        examples=["CoolUser123"],
    )

    @field_validator("username")
    @classmethod
    def validate_username_format(cls, v: str) -> str:
        is_valid, error = validate_username(v)
        if not is_valid:
            raise ValueError(error)
        return v

    @field_validator("password")
    @classmethod
    def validate_password_format(cls, v: str) -> str:
        is_valid, error = validate_password_strength(v)
        if not is_valid:
            raise ValueError(error)
        return v


class RegisterResponse(BaseModel):
    """Response schema for successful registration."""
    
    user_id: str = Field(..., description="Created user's UUID")
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    balance_ntg: int = Field(..., description="Initial NTG balance")
    message: str = Field(..., description="Success message")


class LoginRequest(BaseModel):
    """Request schema for user login."""
    
    email: EmailStr = Field(
        ...,
        description="User's email address",
        examples=["user@example.com"],
    )
    password: str = Field(
        ...,
        description="User's password",
        examples=["SecurePass123"],
    )


class LoginResponse(BaseModel):
    """Response schema for successful login."""
    
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    user_id: str = Field(..., description="User's UUID")
    username: str = Field(..., description="User's display name")
    balance_ntg: int = Field(..., description="Current NTG balance")


class ForgotPasswordRequest(BaseModel):
    """Request schema for password reset."""
    
    email: EmailStr = Field(
        ...,
        description="User's email address",
        examples=["user@example.com"],
    )


class ForgotPasswordResponse(BaseModel):
    """Response schema for password reset request."""
    
    message: str = Field(..., description="Status message")


class MeResponse(BaseModel):
    """Response schema for current user profile."""
    
    id: str = Field(..., description="User's UUID")
    email: str = Field(..., description="User's email")
    username: str = Field(..., description="User's display name")
    balance_ntg: int = Field(..., description="Current NTG balance")
    created_at: datetime = Field(..., description="Account creation date")


# ============================================================================
# Endpoints
# ============================================================================

@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account with email, password, and username.",
)
async def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
) -> RegisterResponse:
    """
    Register a new user account.
    
    This endpoint:
    1. Validates email format and uniqueness
    2. Validates password strength
    3. Validates username format and uniqueness
    4. Creates user with 100 NTG initial balance
    5. Returns access token for immediate login
    
    Args:
        request: Registration data (email, password, username)
        db: Database session
        
    Returns:
        User ID, access token, and initial balance
        
    Raises:
        400: Email or username already exists
        422: Validation error
    """
    # Check if email already exists
    existing_email = db.query(User).filter(User.email == request.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Check if username already exists
    existing_username = db.query(User).filter(User.username == request.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )
    
    # Create new user with hashed password
    user = User(
        email=request.email,
        username=request.username,
        password_hash=hash_password(request.password),
        balance_ntg=100,  # Initial balance
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return RegisterResponse(
        user_id=str(user.id),
        access_token=access_token,
        token_type="bearer",
        balance_ntg=user.balance_ntg,
        message="Registration successful! Welcome to NeuroTamagotchi!",
    )


@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    summary="Login user",
    description="Authenticate user with email and password.",
)
async def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
) -> LoginResponse:
    """
    Authenticate user and return access token.
    
    This endpoint:
    1. Finds user by email
    2. Verifies password
    3. Creates and returns JWT access token
    
    Args:
        request: Login credentials (email, password)
        db: Database session
        
    Returns:
        Access token, user info, and balance
        
    Raises:
        401: Invalid email or password
    """
    # Find user by email
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=str(user.id),
        username=user.username,
        balance_ntg=user.balance_ntg,
    )


@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse,
    status_code=status.HTTP_200_OK,
    summary="Request password reset",
    description="Send password reset email to user.",
)
async def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
) -> ForgotPasswordResponse:
    """
    Request a password reset email.
    
    For MVP, this is a mock implementation that always returns success.
    In production, this would:
    1. Check if email exists
    2. Generate reset token
    3. Send email with reset link
    
    Args:
        request: Email address for reset
        db: Database session
        
    Returns:
        Success message (always, for security)
    """
    # Check if user exists (but don't reveal this to the client)
    user = db.query(User).filter(User.email == request.email).first()
    
    if user:
        # In production: Generate reset token and send email
        # For MVP: Just log the request
        print(f"Password reset requested for: {request.email}")
    
    # Always return success message for security
    # Don't reveal whether email exists or not
    return ForgotPasswordResponse(
        message="If this email exists, a password reset link has been sent."
    )


@router.get(
    "/me",
    response_model=MeResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user",
    description="Get the currently authenticated user's profile.",
)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> MeResponse:
    """
    Get the current authenticated user's profile.
    
    Requires valid Bearer token in Authorization header.
    
    Args:
        current_user: User from authentication dependency
        
    Returns:
        User profile with id, email, username, balance, and creation date
        
    Raises:
        401: Not authenticated or invalid token
    """
    return MeResponse(
        id=str(current_user.id),
        email=current_user.email,
        username=current_user.username,
        balance_ntg=current_user.balance_ntg,
        created_at=current_user.created_at,
    )


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Logout user",
    description="Logout the current user (client-side token removal).",
)
async def logout() -> dict:
    """
    Logout the current user.
    
    In a stateless JWT system, logout is handled client-side by
    removing the token. This endpoint exists for API completeness.
    
    Returns:
        Success message
    """
    return {"message": "Successfully logged out"}


@router.post(
    "/refresh",
    status_code=status.HTTP_200_OK,
    summary="Refresh access token",
    description="Get a new access token using the current valid token.",
)
async def refresh_token(
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Refresh the access token.
    
    Requires a valid current token. Returns a new token with
    extended expiration time.
    
    Args:
        current_user: User from authentication dependency
        
    Returns:
        New access token
    """
    access_token = create_access_token(data={"sub": str(current_user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }
