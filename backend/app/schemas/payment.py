"""Pydantic schemas for payment data."""

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict


class PaymentStatus(str, Enum):
    """Payment status values."""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class PaymentBase(BaseModel):
    """Base schema for payment data."""
    amount_usd: int = Field(ge=0, description="Amount in USD cents")
    amount_ntg: int = Field(ge=0, description="NTG tokens to receive")


class PaymentCreate(PaymentBase):
    """Schema for creating a new payment."""
    stripe_payment_intent_id: Optional[str] = None


class PaymentResponse(BaseModel):
    """Schema for payment API responses."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID
    stripe_payment_intent_id: Optional[str]
    amount_usd: int
    amount_usd_dollars: float
    amount_ntg: int
    status: str
    created_at: datetime

    @classmethod
    def from_orm_model(cls, model) -> "PaymentResponse":
        """Convert ORM model to response schema."""
        return cls(
            id=model.id,
            user_id=model.user_id,
            stripe_payment_intent_id=model.stripe_payment_intent_id,
            amount_usd=model.amount_usd,
            amount_usd_dollars=model.amount_usd / 100,
            amount_ntg=model.amount_ntg,
            status=model.status,
            created_at=model.created_at,
        )


class BalanceResponse(BaseModel):
    """Schema for balance response."""
    balance_ntg: int = Field(description="Current NTG balance")
    currency: str = Field(default="NTG", description="Currency code")


class CheckoutSessionRequest(BaseModel):
    """Schema for creating a checkout session."""
    amount_usd: int = Field(ge=99, description="Amount in USD cents (min $0.99)")
    amount_ntg: int = Field(ge=1, description="NTG tokens to purchase")


class CheckoutSessionResponse(BaseModel):
    """Schema for checkout session response."""
    checkout_url: str = Field(description="Stripe checkout URL")
    session_id: str = Field(description="Checkout session ID")


class WebhookEvent(BaseModel):
    """Schema for Stripe webhook events."""
    type: str
    data: dict
