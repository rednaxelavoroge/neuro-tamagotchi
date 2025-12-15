# NeuroTamagotchi API Documentation

## Overview

The NeuroTamagotchi API is a RESTful API built with FastAPI. All endpoints are prefixed with `/api/v1`.

## Base URL

- Development: `http://localhost:8000/api/v1`
- Production: `https://api.neurotamagotchi.com/api/v1`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Headers

```
Authorization: Bearer <access_token>
```

### Token Endpoints

#### Register

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "confirm_password": "password123"
}
```

Response:
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJ..."
}
```

#### Get Current User

```http
GET /auth/me
Authorization: Bearer <token>
```

## Characters

### List Characters

```http
GET /characters
Authorization: Bearer <token>
```

### Get Character

```http
GET /characters/{character_id}
Authorization: Bearer <token>
```

### Create Character

```http
POST /characters
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Luna",
  "style": "anime",
  "appearance": {
    "hair_color": "Silver",
    "eye_color": "Blue",
    "skin_tone": "Fair",
    "outfit": "Casual"
  },
  "personality": {
    "traits": ["cheerful", "curious"],
    "voice_tone": "friendly"
  },
  "avatar_url": "https://..."
}
```

### Update Character

```http
PATCH /characters/{character_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Name"
}
```

### Delete Character

```http
DELETE /characters/{character_id}
Authorization: Bearer <token>
```

### Generate Avatar

```http
POST /characters/generate-avatar
Authorization: Bearer <token>
Content-Type: application/json

{
  "style": "anime",
  "appearance": {
    "hair_color": "Silver",
    "eye_color": "Blue"
  }
}
```

Response:
```json
{
  "images": ["data:image/png;base64,...", ...]
}
```

## Chat

### Get Chat History

```http
GET /chat/{character_id}/history?page=1&page_size=50
Authorization: Bearer <token>
```

Response:
```json
{
  "items": [
    {
      "id": "uuid",
      "character_id": "uuid",
      "role": "assistant",
      "content": "Hello!",
      "emotion": "happy",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "page_size": 50,
  "total_pages": 2
}
```

### Send Message

```http
POST /chat/{character_id}/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hello, how are you?",
  "context": {}
}
```

Response:
```json
{
  "message": {
    "id": "uuid",
    "character_id": "uuid",
    "role": "assistant",
    "content": "I'm doing great! How about you?",
    "emotion": "happy",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "character_reaction": {
    "emotion": "happy",
    "animation": "talk",
    "stat_changes": {
      "happiness": 2,
      "affection": 1
    }
  }
}
```

## Missions

### List Missions

```http
GET /missions
Authorization: Bearer <token>
```

### Get User Missions

```http
GET /missions/user
Authorization: Bearer <token>
```

### Start Mission

```http
POST /missions/{mission_id}/start
Authorization: Bearer <token>
```

### Claim Reward

```http
POST /missions/{user_mission_id}/claim
Authorization: Bearer <token>
```

## Payments

### Get Plans

```http
GET /payments/plans
```

Response:
```json
[
  {
    "id": "pro",
    "name": "Pro",
    "description": "For dedicated companion owners",
    "price": 999,
    "currency": "USD",
    "interval": "month",
    "features": ["3 AI Companions", "Unlimited messages"],
    "is_popular": true
  }
]
```

### Create Checkout

```http
POST /payments/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "plan_id": "pro"
}
```

Response:
```json
{
  "checkout_url": "https://checkout.stripe.com/..."
}
```

### Get Subscription

```http
GET /payments/subscription
Authorization: Bearer <token>
```

### Cancel Subscription

```http
POST /payments/subscription/cancel
Authorization: Bearer <token>
```

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

- Free users: 100 requests/minute
- Premium users: 1000 requests/minute

## Webhooks

### Stripe Webhook

```http
POST /payments/webhook
Stripe-Signature: <signature>
```

Handles events:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

