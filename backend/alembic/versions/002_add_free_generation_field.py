"""Add free_generation_used field to users table.

Revision ID: 002_add_free_generation
Revises: 001_initial
Create Date: 2024-01-16 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "002_add_free_generation"
down_revision: Union[str, None] = "001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add free_generation_used column to users table
    op.add_column(
        "users",
        sa.Column(
            "free_generation_used",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )


def downgrade() -> None:
    op.drop_column("users", "free_generation_used")
