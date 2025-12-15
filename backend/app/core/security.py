"""
Security utilities for authentication and authorization.

This module provides:
- Password hashing with bcrypt
- JWT token creation and verification
- Authentication dependencies for FastAPI
"""

from datetime import datetime, timedelta
from typing import Any, Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db

# Password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer token scheme for FastAPI
security = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    Args:
        password: Plain text password to hash
        
    Returns:
        Hashed password string
        
    Example:
        >>> hashed = hash_password("mysecurepassword")
        >>> hashed.startswith("$2b$")
        True
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.
    
    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password to compare against
        
    Returns:
        True if password matches, False otherwise
        
    Example:
        >>> hashed = hash_password("mysecurepassword")
        >>> verify_password("mysecurepassword", hashed)
        True
        >>> verify_password("wrongpassword", hashed)
        False
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Dictionary of claims to encode in the token.
              Must include 'sub' (subject) claim with user ID.
        expires_delta: Optional custom expiration time.
                      Defaults to 7 days from settings.
                      
    Returns:
        Encoded JWT token string
        
    Example:
        >>> token = create_access_token({"sub": "user-uuid-123"})
        >>> len(token) > 100
        True
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        # Default: 7 days expiration
        expire = datetime.utcnow() + timedelta(days=7)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access",
    })
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )
    
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    """
    Decode and validate a JWT token.
    
    Args:
        token: JWT token string to decode
        
    Returns:
        Decoded token payload as dictionary, or None if invalid
        
    Raises:
        None - Returns None on any error for safe handling
        
    Example:
        >>> token = create_access_token({"sub": "user-123"})
        >>> payload = decode_token(token)
        >>> payload["sub"]
        'user-123'
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        return payload
    except JWTError:
        return None


def get_token_payload(token: str) -> dict:
    """
    Get token payload or raise 401 exception.
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded token payload
        
    Raises:
        HTTPException: 401 if token is invalid or expired
    """
    payload = decode_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return payload


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
):
    """
    FastAPI dependency to get the current authenticated user.
    
    This function:
    1. Extracts the Bearer token from the Authorization header
    2. Decodes and validates the JWT token
    3. Retrieves the user from the database
    4. Returns the user object
    
    Args:
        credentials: HTTP Bearer credentials from request header
        db: Database session from dependency
        
    Returns:
        User object for the authenticated user
        
    Raises:
        HTTPException: 401 if token is missing, invalid, or user not found
        
    Usage:
        @app.get("/protected")
        async def protected_route(user: User = Depends(get_current_user)):
            return {"user_id": user.id}
    """
    from app.models.user import User
    
    # Check if credentials are provided
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    # Decode and validate token
    payload = get_token_payload(token)
    
    # Extract user ID from token
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    try:
        user = db.query(User).filter(User.id == user_id).first()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
):
    """
    Optional version of get_current_user that returns None instead of raising.
    
    Useful for endpoints that work with or without authentication.
    
    Args:
        credentials: HTTP Bearer credentials from request header
        db: Database session from dependency
        
    Returns:
        User object if authenticated, None otherwise
    """
    from app.models.user import User
    
    if credentials is None:
        return None
    
    try:
        token = credentials.credentials
        payload = decode_token(token)
        
        if payload is None:
            return None
        
        user_id = payload.get("sub")
        if user_id is None:
            return None
        
        user = db.query(User).filter(User.id == user_id).first()
        return user
        
    except Exception:
        return None


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password meets security requirements.
    
    Requirements:
    - Minimum 8 characters
    - At least 1 uppercase letter
    - At least 1 lowercase letter
    - At least 1 number
    
    Args:
        password: Password to validate
        
    Returns:
        Tuple of (is_valid, error_message)
        
    Example:
        >>> validate_password_strength("weak")
        (False, 'Password must be at least 8 characters')
        >>> validate_password_strength("StrongPass123")
        (True, '')
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least 1 uppercase letter"
    
    if not any(c.islower() for c in password):
        return False, "Password must contain at least 1 lowercase letter"
    
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least 1 number"
    
    return True, ""


def validate_username(username: str) -> tuple[bool, str]:
    """
    Validate username meets requirements.
    
    Requirements:
    - 3-20 characters
    - Alphanumeric (letters, numbers, underscores, hyphens)
    
    Args:
        username: Username to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if len(username) < 3:
        return False, "Username must be at least 3 characters"
    
    if len(username) > 20:
        return False, "Username must be at most 20 characters"
    
    if not username.replace("_", "").replace("-", "").isalnum():
        return False, "Username can only contain letters, numbers, underscores, and hyphens"
    
    return True, ""


# Alias for backwards compatibility
get_password_hash = hash_password
