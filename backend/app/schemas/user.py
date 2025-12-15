"""User Pydantic schemas for API validation."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    """
    Schema for user registration request.
    
    Example:
        {
            "email": "user@example.com",
            "username": "CoolUser123",
            "password": "SecureP@ss123"
        }
    """
    
    email: EmailStr = Field(
        ...,
        description="User's email address",
        examples=["user@example.com"],
    )
    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
        description="Display username (3-50 characters)",
        examples=["CoolUser123"],
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="Password (minimum 8 characters)",
        examples=["SecureP@ss123"],
    )

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        """Validate username contains only alphanumeric and underscore."""
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Username must contain only letters, numbers, underscores, and hyphens")
        return v

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        """Validate password has sufficient complexity."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserLogin(BaseModel):
    """
    Schema for user login request.
    
    Example:
        {
            "email": "user@example.com",
            "password": "SecureP@ss123"
        }
    """
    
    email: EmailStr = Field(
        ...,
        description="User's email address",
        examples=["user@example.com"],
    )
    password: str = Field(
        ...,
        description="User's password",
        examples=["SecureP@ss123"],
    )


class UserUpdate(BaseModel):
    """
    Schema for updating user profile.
    
    Example:
        {
            "username": "NewUsername"
        }
    """
    
    username: Optional[str] = Field(
        None,
        min_length=3,
        max_length=50,
        description="New display username",
        examples=["NewUsername"],
    )


class UserResponse(BaseModel):
    """
    Schema for user data in API responses.
    
    Example:
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "email": "user@example.com",
            "username": "CoolUser123",
            "balance_ntg": 100,
            "created_at": "2024-01-15T10:30:00Z"
        }
    """
    
    id: UUID = Field(
        ...,
        description="User's unique identifier",
        examples=["550e8400-e29b-41d4-a716-446655440000"],
    )
    email: EmailStr = Field(
        ...,
        description="User's email address",
        examples=["user@example.com"],
    )
    username: str = Field(
        ...,
        description="User's display name",
        examples=["CoolUser123"],
    )
    balance_ntg: int = Field(
        ...,
        description="NTG token balance",
        examples=[100],
    )
    created_at: datetime = Field(
        ...,
        description="Account creation timestamp",
        examples=["2024-01-15T10:30:00Z"],
    )

    model_config = {"from_attributes": True}


class Token(BaseModel):
    """
    Schema for authentication tokens response.
    
    Example:
        {
            "access_token": "eyJhbGciOiJIUzI1NiIs...",
            "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
            "token_type": "bearer"
        }
    """
    
    access_token: str = Field(
        ...,
        description="JWT access token",
        examples=["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."],
    )
    refresh_token: str = Field(
        ...,
        description="JWT refresh token",
        examples=["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."],
    )
    token_type: str = Field(
        default="bearer",
        description="Token type",
        examples=["bearer"],
    )


class TokenRefresh(BaseModel):
    """
    Schema for token refresh request.
    
    Example:
        {
            "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
        }
    """
    
    refresh_token: str = Field(
        ...,
        description="Refresh token for obtaining new access token",
        examples=["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."],
    )


class TokenPayload(BaseModel):
    """Schema for decoded JWT token payload."""
    
    sub: str = Field(..., description="Subject (user ID)")
    exp: datetime = Field(..., description="Expiration timestamp")
    type: str = Field(..., description="Token type (access/refresh)")
