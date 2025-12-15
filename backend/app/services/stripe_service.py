"""Stripe payment integration service."""

from typing import Dict, Any, Optional
import stripe

from app.core.config import settings


class StripeService:
    """
    Service for handling Stripe payments.
    
    Handles:
    - Checkout session creation
    - Payment intent management
    - Webhook verification
    - Customer management
    
    For MVP, includes mock implementations that work without API key.
    """
    
    def __init__(self):
        self.api_key = settings.stripe_secret_key
        self.webhook_secret = settings.stripe_webhook_secret
        
        if self.api_key:
            stripe.api_key = self.api_key
    
    @property
    def is_configured(self) -> bool:
        """Check if Stripe API is configured."""
        return bool(self.api_key)
    
    async def create_checkout_session(
        self,
        amount_usd: int,
        amount_ntg: int,
        user_id: str,
        success_url: str,
        cancel_url: str,
    ) -> Dict[str, Any]:
        """
        Create a Stripe checkout session.
        
        Args:
            amount_usd: Amount in USD cents
            amount_ntg: NTG tokens to purchase
            user_id: User identifier
            success_url: URL to redirect on success
            cancel_url: URL to redirect on cancel
            
        Returns:
            Dictionary with checkout_url and session_id
        """
        if not self.is_configured:
            return {
                "checkout_url": f"{success_url}?mock=true",
                "session_id": f"cs_mock_{user_id}_{amount_ntg}",
            }
        
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[
                    {
                        "price_data": {
                            "currency": "usd",
                            "unit_amount": amount_usd,
                            "product_data": {
                                "name": f"{amount_ntg} NTG Tokens",
                                "description": f"Purchase {amount_ntg} NTG tokens for NeuroTamagotchi",
                            },
                        },
                        "quantity": 1,
                    },
                ],
                mode="payment",
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={
                    "user_id": user_id,
                    "amount_ntg": amount_ntg,
                },
            )
            
            return {
                "checkout_url": session.url,
                "session_id": session.id,
            }
            
        except stripe.error.StripeError as e:
            print(f"Stripe checkout creation failed: {e}")
            raise Exception(f"Payment setup failed: {str(e)}")
    
    async def create_payment_intent(
        self,
        amount_usd: int,
        user_id: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Create a Stripe payment intent.
        
        Args:
            amount_usd: Amount in USD cents
            user_id: User identifier
            metadata: Additional metadata
            
        Returns:
            Dictionary with client_secret and payment_intent_id
        """
        if not self.is_configured:
            return {
                "client_secret": f"pi_mock_secret_{user_id}",
                "payment_intent_id": f"pi_mock_{user_id}",
            }
        
        try:
            intent = stripe.PaymentIntent.create(
                amount=amount_usd,
                currency="usd",
                metadata={
                    "user_id": user_id,
                    **(metadata or {}),
                },
            )
            
            return {
                "client_secret": intent.client_secret,
                "payment_intent_id": intent.id,
            }
            
        except stripe.error.StripeError as e:
            print(f"Stripe payment intent creation failed: {e}")
            raise Exception(f"Payment setup failed: {str(e)}")
    
    def verify_webhook_signature(
        self,
        payload: bytes,
        signature: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Verify a Stripe webhook signature.
        
        Args:
            payload: Raw request body
            signature: Stripe-Signature header value
            
        Returns:
            Verified event data, or None if invalid
        """
        if not self.is_configured or not self.webhook_secret:
            # Return mock event for testing
            return {
                "type": "payment_intent.succeeded",
                "data": {"object": {"id": "pi_mock", "amount": 0}},
            }
        
        try:
            event = stripe.Webhook.construct_event(
                payload,
                signature,
                self.webhook_secret,
            )
            return {
                "type": event.type,
                "data": event.data,
            }
            
        except (stripe.error.SignatureVerificationError, ValueError) as e:
            print(f"Webhook signature verification failed: {e}")
            return None
    
    async def get_payment_intent(
        self,
        payment_intent_id: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Retrieve a payment intent by ID.
        
        Args:
            payment_intent_id: Stripe payment intent ID
            
        Returns:
            Payment intent data, or None if not found
        """
        if not self.is_configured:
            return {
                "id": payment_intent_id,
                "status": "succeeded",
                "amount": 0,
            }
        
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return {
                "id": intent.id,
                "status": intent.status,
                "amount": intent.amount,
                "metadata": intent.metadata,
            }
            
        except stripe.error.StripeError as e:
            print(f"Stripe payment intent retrieval failed: {e}")
            return None
    
    async def refund_payment(
        self,
        payment_intent_id: str,
        amount: Optional[int] = None,
    ) -> bool:
        """
        Refund a payment.
        
        Args:
            payment_intent_id: Stripe payment intent ID
            amount: Amount to refund in cents (None for full refund)
            
        Returns:
            True if refund successful, False otherwise
        """
        if not self.is_configured:
            return True
        
        try:
            refund_params = {"payment_intent": payment_intent_id}
            if amount:
                refund_params["amount"] = amount
            
            stripe.Refund.create(**refund_params)
            return True
            
        except stripe.error.StripeError as e:
            print(f"Stripe refund failed: {e}")
            return False


# Singleton instance
stripe_service = StripeService()
