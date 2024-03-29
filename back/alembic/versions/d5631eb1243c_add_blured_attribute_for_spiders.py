"""Add blured attribute for spiders

Revision ID: d5631eb1243c
Revises: 9e912e325947
Create Date: 2020-10-27 09:41:41.046907

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd5631eb1243c'
down_revision = '9e912e325947'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('pictures', sa.Column('blured', sa.Boolean(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('pictures', 'blured')
    # ### end Alembic commands ###
