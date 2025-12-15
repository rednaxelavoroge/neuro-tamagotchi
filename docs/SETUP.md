# NeuroTamagotchi Setup Guide

This guide will help you set up the NeuroTamagotchi application for development.

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **PostgreSQL** 14+
- **Redis** 7+
- **Docker** (optional, for database services)

## Quick Start with Docker

The easiest way to get started is using Docker for the database services:

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Check services are running
docker-compose ps
```

## Backend Setup

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv

# Activate on macOS/Linux
source venv/bin/activate

# Activate on Windows
venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your settings
# At minimum, update:
# - DATABASE_URL
# - JWT_SECRET_KEY
# - SECRET_KEY
```

### 4. Initialize Database

```bash
# The database is auto-initialized on first run
# Or manually run migrations
alembic upgrade head
```

### 5. Run the Server

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --port 8000

# Or run directly
python -m app.main
```

The API will be available at http://localhost:8000

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create a `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run Development Server

```bash
npm run dev
```

The frontend will be available at http://localhost:3000

## External Services Configuration

### Stable Diffusion (Avatar Generation)

1. Sign up at [Stability AI](https://stability.ai/)
2. Get your API key
3. Add to `.env`:
   ```
   SD_API_KEY=your-api-key
   ```

### InWorld AI (Conversations)

1. Sign up at [InWorld AI](https://www.inworld.ai/)
2. Create a workspace and character
3. Add to `.env`:
   ```
   INWORLD_API_KEY=your-api-key
   INWORLD_WORKSPACE_ID=your-workspace-id
   INWORLD_CHARACTER_ID=your-character-id
   ```

### Stripe (Payments)

1. Sign up at [Stripe](https://stripe.com/)
2. Get your API keys from Dashboard
3. Create products and prices
4. Add to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## Running Tests

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm run test
```

## Common Issues

### Database Connection Failed

- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists: `createdb neuro_tamagotchi`

### Redis Connection Failed

- Ensure Redis is running
- Check REDIS_URL in .env

### CORS Errors

- Add frontend URL to CORS_ORIGINS in .env
- Example: `CORS_ORIGINS=http://localhost:3000`

### API Not Responding

- Check if backend is running on correct port
- Verify NEXT_PUBLIC_API_URL in frontend

## Production Deployment

For production deployment:

1. Use environment-specific `.env` files
2. Enable HTTPS
3. Use production database with proper credentials
4. Configure CDN for static assets
5. Set up monitoring and logging

See the deployment documentation for detailed instructions.

