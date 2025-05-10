"""cleanup dates

Revision ID: cleanup_dates
Revises: eae269a8ba00
Create Date: 2025-05-10 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'cleanup_dates'
down_revision = 'eae269a8ba00'
branch_labels = None
depends_on = None

def upgrade():
    # Suppression des colonnes de dates inutiles
    with op.batch_alter_table('tournament', schema=None) as batch_op:
        batch_op.drop_column('start_date')
        batch_op.drop_column('end_date')
        batch_op.drop_column('created_at')

    with op.batch_alter_table('match', schema=None) as batch_op:
        batch_op.drop_column('scheduled_time')
        batch_op.drop_column('created_at')

    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('created_at')

    with op.batch_alter_table('tournament_participant', schema=None) as batch_op:
        batch_op.drop_column('joined_at')

def downgrade():
    # Recréation des colonnes de dates si nécessaire
    with op.batch_alter_table('tournament', schema=None) as batch_op:
        batch_op.add_column(sa.Column('start_date', postgresql.TIMESTAMP(), nullable=True))
        batch_op.add_column(sa.Column('end_date', postgresql.TIMESTAMP(), nullable=True))
        batch_op.add_column(sa.Column('created_at', postgresql.TIMESTAMP(), nullable=True))

    with op.batch_alter_table('match', schema=None) as batch_op:
        batch_op.add_column(sa.Column('scheduled_time', postgresql.TIMESTAMP(), nullable=True))
        batch_op.add_column(sa.Column('created_at', postgresql.TIMESTAMP(), nullable=True))

    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('created_at', postgresql.TIMESTAMP(), nullable=True))

    with op.batch_alter_table('tournament_participant', schema=None) as batch_op:
        batch_op.add_column(sa.Column('joined_at', postgresql.TIMESTAMP(), nullable=True)) 