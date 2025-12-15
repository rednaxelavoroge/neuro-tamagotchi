"""Payment management endpoints."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user
from app.models.user import User
from app.models.payment import Payment
from app.schemas.payment import (
    PaymentResponse,
    BalanceResponse,
    CheckoutSessionRequest,
    CheckoutSessionResponse,
)
from app.services.stripe_service import stripe_service

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.get("/balance", response_model=BalanceResponse)
async def get_balance(
    current_user: User = Depends(get_current_user),
) -> BalanceResponse:
    """
    Get the current user's NTG balance.
    
    Returns:
        Current balance in NTG tokens.
    """
    return BalanceResponse(balance_ntg=current_user.balance_ntg)


@router.get("", response_model=List[PaymentResponse])
async def get_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[PaymentResponse]:
    """
    Get payment history for the current user.
    
    Returns:
        List of payment records ordered by date descending.
    """
    payments = db.query(Payment).filter(
        Payment.user_id == current_user.id
    ).order_by(Payment.created_at.desc()).limit(50).all()
    
    return [PaymentResponse.from_orm_model(p) for p in payments]


@router.post("/checkout", response_model=CheckoutSessionResponse)
async def create_checkout(
    request: CheckoutSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CheckoutSessionResponse:
    """
    Create a Stripe checkout session for purchasing NTG tokens.
    
    Args:
        request: Amount in USD cents and NTG tokens to purchase
        
    Returns:
        Stripe checkout URL and session ID.
    """
    # Create pending payment record
    payment = Payment(
        user_id=current_user.id,
        amount_usd=request.amount_usd,
        amount_ntg=request.amount_ntg,
        status="pending",
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    # Create Stripe checkout session
    success_url = f"{settings.frontend_url}/payments/success?payment_id={payment.id}"
    cancel_url = f"{settings.frontend_url}/payments/cancel"
    
    try:
        # In production, use Stripe checkout
        # For demo, return mock URL
        checkout_url = f"{success_url}&mock=true"
        session_id = f"cs_demo_{payment.id}"
        
        return CheckoutSessionResponse(
            checkout_url=checkout_url,
            session_id=session_id,
        )
    except Exception as e:
        # Mark payment as failed
        payment.fail()
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create checkout session: {str(e)}",
        )


@router.post("/confirm/{payment_id}")
async def confirm_payment(
    payment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Confirm a payment and add NTG to user balance.
    
    This endpoint is called after successful Stripe payment.
    In production, this should be handled by Stripe webhooks.
    
    Args:
        payment_id: UUID of the payment to confirm
        
    Returns:
        Confirmation message with new balance.
    """
    payment = db.query(Payment).filter(
        Payment.id == payment_id,
        Payment.user_id == current_user.id,
    ).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found",
        )
    
    if payment.is_completed:
        return {
            "message": "Payment already completed",
            "balance_ntg": current_user.balance_ntg,
        }
    
    if payment.is_failed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment has failed",
        )
    
    # Mark as completed and add balance
    payment.complete()
    current_user.add_balance(payment.amount_ntg)
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": f"Payment confirmed! Added {payment.amount_ntg} NTG to your balance.",
        "balance_ntg": current_user.balance_ntg,
    }


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db),
) -> dict:
    """
    Handle Stripe webhook events.
    
    Processes payment_intent.succeeded and payment_intent.failed events.
    """
    payload = await request.body()
    signature = request.headers.get("stripe-signature", "")
    
    event = stripe_service.verify_webhook_signature(payload, signature)
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature",
        )
    
    event_type = event.get("type", "")
    data = event.get("data", {}).get("object", {})
    
    if event_type == "payment_intent.succeeded":
        payment_intent_id = data.get("id")
        payment = db.query(Payment).filter(
            Payment.stripe_payment_intent_id == payment_intent_id
        ).first()
        
        if payment and payment.is_pending:
            payment.complete()
            user = payment.user
            if user:
                user.add_balance(payment.amount_ntg)
            db.commit()
    
    elif event_type == "payment_intent.payment_failed":
        payment_intent_id = data.get("id")
        payment = db.query(Payment).filter(
            Payment.stripe_payment_intent_id == payment_intent_id
        ).first()
        
        if payment and payment.is_pending:
            payment.fail()
            db.commit()
    
    return {"received": True}


# NTG Token packages for purchase
NTG_PACKAGES = [
    {"amount_usd": 99, "amount_ntg": 100, "bonus": 0},
    {"amount_usd": 499, "amount_ntg": 550, "bonus": 50},
    {"amount_usd": 999, "amount_ntg": 1200, "bonus": 200},
    {"amount_usd": 1999, "amount_ntg": 2600, "bonus": 600},
    {"amount_usd": 4999, "amount_ntg": 7000, "bonus": 2000},
]


@router.get("/packages")
async def get_packages() -> List[dict]:
    """
    Get available NTG token packages for purchase.
    
    Returns:
        List of packages with USD price, NTG amount, and bonus.
    """
    return [
        {
            "amount_usd": pkg["amount_usd"],
            "amount_usd_dollars": pkg["amount_usd"] / 100,
            "amount_ntg": pkg["amount_ntg"],
            "bonus": pkg["bonus"],
            "price_per_ntg": pkg["amount_usd"] / pkg["amount_ntg"],
        }
        for pkg in NTG_PACKAGES
    ]
