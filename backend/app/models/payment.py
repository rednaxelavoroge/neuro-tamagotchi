"""Payment database model."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class Payment(Base):
    """
    Payment model for tracking NTG token purchases.
    
    Attributes:
        id: Unique identifier (UUID)
        user_id: User who made the payment
        stripe_payment_intent_id: Stripe payment intent ID
        amount_usd: Amount in USD cents
        amount_ntg: NTG tokens purchased
        status: Payment status (pending, completed, failed)
        created_at: Payment creation timestamp
    """
    
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    stripe_payment_intent_id = Column(String(100), nullable=True)
    amount_usd = Column(Integer, nullable=False)  # Amount in cents
    amount_ntg = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="payments")

    def __repr__(self) -> str:
        return f"<Payment ${self.amount_usd/100:.2f} -> {self.amount_ntg} NTG ({self.status})>"

    @property
    def is_pending(self) -> bool:
        """Check if payment is pending."""
        return self.status == "pending"

    @property
    def is_completed(self) -> bool:
        """Check if payment is completed."""
        return self.status == "completed"

    @property
    def is_failed(self) -> bool:
        """Check if payment has failed."""
        return self.status == "failed"

    def complete(self) -> None:
        """Mark payment as completed."""
        self.status = "completed"

    def fail(self) -> None:
        """Mark payment as failed."""
        self.status = "failed"
