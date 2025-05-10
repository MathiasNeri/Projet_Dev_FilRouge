"""remove is_admin column

Revision ID: remove_is_admin
Revises: cleanup_dates
Create Date: 2025-05-10 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'remove_is_admin'
down_revision = 'cleanup_dates'
branch_labels = None
depends_on = None

def upgrade():
    # Suppression de la colonne is_admin
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('is_admin')

def downgrade():
    # Recréation de la colonne is_admin si nécessaire
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('is_admin', sa.Boolean(), nullable=True)) 