# NeuroTamagotchi

An AI-powered virtual companion application that combines the nostalgic charm of Tamagotchi with modern AI technology. Create, customize, and interact with your unique AI companion.

## 🌟 Features

- **AI Avatar Creation**: Design your unique companion using Stable Diffusion
- **Intelligent Conversations**: Natural language interactions powered by InWorld AI
- **Mission System**: Complete daily missions to level up your companion
- **Customization**: Personalize appearance, personality, and behavior
- **Cross-Platform**: Web-based application accessible from any device

## 🏗️ Project Structure

```
/neuro-tamagotchi
├── /frontend          # Next.js 14 application
│   ├── /app          # App Router pages
│   ├── /components   # React components
│   ├── /lib          # Utilities and API client
│   └── /types        # TypeScript definitions
├── /backend          # Python FastAPI application
│   ├── /app          # Application code
│   │   ├── /api      # API endpoints
│   │   ├── /core     # Core configuration
│   │   ├── /models   # Database models
│   │   ├── /schemas  # Pydantic schemas
│   │   └── /services # External service integrations
│   └── requirements.txt
└── /docs             # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose (optional)

### Using Docker Compose

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Setup Frontend
cd frontend
npm install
npm run dev

# Setup Backend (in a new terminal)
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Environment Setup

1. Copy environment example files:
```bash
cp backend/.env.example backend/.env
```

2. Update the `.env` file with your credentials:
   - Database connection
   - JWT secret
   - Stable Diffusion API key
   - InWorld AI credentials
   - Stripe API keys

## 📚 API Documentation

Once the backend is running, access the API docs at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy
- **Cache**: Redis
- **Task Queue**: Celery
- **Authentication**: JWT

### External Services
- **AI Avatars**: Stable Diffusion API
- **Conversations**: InWorld AI
- **Payments**: Stripe

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

# Deploy
