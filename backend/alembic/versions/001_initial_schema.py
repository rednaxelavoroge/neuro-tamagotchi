"""Initial database schema with all tables and seed data.

Revision ID: 001_initial
Revises: 
Create Date: 2024-01-15 10:00:00.000000

"""
from typing import Sequence, Union
import uuid

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("email", sa.String(255), unique=True, nullable=False, index=True),
        sa.Column("username", sa.String(100), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("balance_ntg", sa.Integer(), nullable=False, default=100),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_users_id", "users", ["id"])

    # Create characters table
    op.create_table(
        "characters",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("style", sa.String(20), nullable=False),
        sa.Column("avatar_url", sa.String(500), nullable=True),
        sa.Column("inworld_agent_id", sa.String(255), nullable=True),
        sa.Column("inworld_scene_id", sa.String(255), nullable=True),
        sa.Column("params_energy", sa.Integer(), nullable=False, default=100),
        sa.Column("params_mood", sa.Integer(), nullable=False, default=100),
        sa.Column("params_bond", sa.Integer(), nullable=False, default=0),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("params_energy >= 0 AND params_energy <= 100", name="check_energy_range"),
        sa.CheckConstraint("params_mood >= 0 AND params_mood <= 100", name="check_mood_range"),
        sa.CheckConstraint("params_bond >= 0", name="check_bond_positive"),
    )
    op.create_index("ix_characters_id", "characters", ["id"])
    op.create_index("ix_characters_user_id", "characters", ["user_id"])

    # Create missions table
    op.create_table(
        "missions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("cost_ntg", sa.Integer(), nullable=False),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("cooldown_seconds", sa.Integer(), nullable=False, default=3600),
        sa.Column("is_active", sa.Boolean(), nullable=False, default=True),
    )
    op.create_index("ix_missions_id", "missions", ["id"])

    # Create completed_missions table
    op.create_table(
        "completed_missions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("character_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("characters.id", ondelete="CASCADE"), nullable=False),
        sa.Column("mission_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("missions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("completed_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_completed_missions_id", "completed_missions", ["id"])
    op.create_index("ix_completed_missions_user_id", "completed_missions", ["user_id"])
    op.create_index("ix_completed_missions_character_id", "completed_missions", ["character_id"])
    op.create_index("ix_completed_missions_mission_id", "completed_missions", ["mission_id"])

    # Create payments table
    op.create_table(
        "payments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("stripe_payment_intent_id", sa.String(255), nullable=True, unique=True),
        sa.Column("amount_usd", sa.Integer(), nullable=False),
        sa.Column("amount_ntg", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, default="pending"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_payments_id", "payments", ["id"])
    op.create_index("ix_payments_user_id", "payments", ["user_id"])
    op.create_index("ix_payments_stripe_payment_intent_id", "payments", ["stripe_payment_intent_id"])

    # Seed default missions
    missions_table = sa.table(
        "missions",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("name", sa.String),
        sa.column("description", sa.Text),
        sa.column("cost_ntg", sa.Integer),
        sa.column("type", sa.String),
        sa.column("cooldown_seconds", sa.Integer),
        sa.column("is_active", sa.Boolean),
    )

    op.bulk_insert(
        missions_table,
        [
            {
                "id": uuid.uuid4(),
                "name": "Покорми питомца",
                "description": "Накорми своего питомца вкусной едой, чтобы восстановить его энергию и поднять настроение.",
                "cost_ntg": 50,
                "type": "feed",
                "cooldown_seconds": 3600,
                "is_active": True,
            },
            {
                "id": uuid.uuid4(),
                "name": "Смени прическу",
                "description": "Измени внешний вид своего питомца с новой стильной прической.",
                "cost_ntg": 150,
                "type": "hairstyle",
                "cooldown_seconds": 7200,
                "is_active": True,
            },
            {
                "id": uuid.uuid4(),
                "name": "Сделай селфи в новом образе",
                "description": "Сделай красивое селфи с питомцем в уникальном образе и сохрани на память.",
                "cost_ntg": 300,
                "type": "selfie",
                "cooldown_seconds": 14400,
                "is_active": True,
            },
            {
                "id": uuid.uuid4(),
                "name": "Поиграй с питомцем",
                "description": "Проведи время играя со своим питомцем, чтобы укрепить вашу связь.",
                "cost_ntg": 80,
                "type": "feed",
                "cooldown_seconds": 1800,
                "is_active": True,
            },
            {
                "id": uuid.uuid4(),
                "name": "Новый аксессуар",
                "description": "Укрась своего питомца новым модным аксессуаром.",
                "cost_ntg": 200,
                "type": "hairstyle",
                "cooldown_seconds": 10800,
                "is_active": True,
            },
        ],
    )


def downgrade() -> None:
    op.drop_table("payments")
    op.drop_table("completed_missions")
    op.drop_table("missions")
    op.drop_table("characters")
    op.drop_table("users")

