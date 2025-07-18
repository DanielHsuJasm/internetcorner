"""Add BirthPhoto table

Revision ID: d47eacb9ea0d
Revises: e7118e3feb13
Create Date: 2025-06-25 05:09:04.123865

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd47eacb9ea0d'
down_revision = 'e7118e3feb13'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('birth_photo',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('object_key', sa.String(length=512), nullable=False),
    sa.Column('url', sa.String(length=1024), nullable=False),
    sa.Column('birthday_year', sa.Integer(), nullable=True),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('uploaded_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('birth_photo')
    # ### end Alembic commands ###
