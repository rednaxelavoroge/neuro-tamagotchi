-- ============================================================================
-- NeuroTamagotchi Database Initialization Script
-- This script runs on first database creation
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    balance_ntg INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);
CREATE INDEX IF NOT EXISTS ix_users_id ON users(id);

-- ============================================================================
-- CHARACTERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    style VARCHAR(20) NOT NULL CHECK (style IN ('anime', 'cyberpunk', 'fantasy')),
    avatar_url VARCHAR(500),
    inworld_agent_id VARCHAR(255),
    inworld_scene_id VARCHAR(255),
    params_energy INTEGER NOT NULL DEFAULT 100 CHECK (params_energy >= 0 AND params_energy <= 100),
    params_mood INTEGER NOT NULL DEFAULT 100 CHECK (params_mood >= 0 AND params_mood <= 100),
    params_bond INTEGER NOT NULL DEFAULT 0 CHECK (params_bond >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_characters_id ON characters(id);
CREATE INDEX IF NOT EXISTS ix_characters_user_id ON characters(user_id);

-- ============================================================================
-- MISSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    cost_ntg INTEGER NOT NULL CHECK (cost_ntg >= 0),
    type VARCHAR(50) NOT NULL CHECK (type IN ('feed', 'hairstyle', 'selfie')),
    cooldown_seconds INTEGER NOT NULL DEFAULT 3600,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS ix_missions_id ON missions(id);
CREATE INDEX IF NOT EXISTS ix_missions_type ON missions(type);

-- ============================================================================
-- COMPLETED_MISSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS completed_missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_completed_missions_id ON completed_missions(id);
CREATE INDEX IF NOT EXISTS ix_completed_missions_user_id ON completed_missions(user_id);
CREATE INDEX IF NOT EXISTS ix_completed_missions_character_id ON completed_missions(character_id);
CREATE INDEX IF NOT EXISTS ix_completed_missions_mission_id ON completed_missions(mission_id);

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    amount_usd INTEGER NOT NULL CHECK (amount_usd > 0),
    amount_ntg INTEGER NOT NULL CHECK (amount_ntg > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_payments_id ON payments(id);
CREATE INDEX IF NOT EXISTS ix_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS ix_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);

-- ============================================================================
-- SEED DATA: DEFAULT MISSIONS
-- ============================================================================
INSERT INTO missions (id, name, description, cost_ntg, type, cooldown_seconds, is_active)
VALUES 
    (uuid_generate_v4(), 'Покорми питомца', 'Накорми своего питомца вкусной едой, чтобы восстановить его энергию и поднять настроение.', 50, 'feed', 3600, TRUE),
    (uuid_generate_v4(), 'Смени прическу', 'Измени внешний вид своего питомца с новой стильной прической.', 150, 'hairstyle', 7200, TRUE),
    (uuid_generate_v4(), 'Сделай селфи в новом образе', 'Сделай красивое селфи с питомцем в уникальном образе и сохрани на память.', 300, 'selfie', 14400, TRUE),
    (uuid_generate_v4(), 'Поиграй с питомцем', 'Проведи время играя со своим питомцем, чтобы укрепить вашу связь.', 80, 'feed', 1800, TRUE),
    (uuid_generate_v4(), 'Новый аксессуар', 'Укрась своего питомца новым модным аксессуаром.', 200, 'hairstyle', 10800, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- GRANT PERMISSIONS (if running as superuser)
-- ============================================================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

