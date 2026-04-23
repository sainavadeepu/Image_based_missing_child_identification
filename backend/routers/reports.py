"""
Reports and Children listing router.
GET /children — All registered children
GET /reports  — Statistics + recent search logs
"""
import logging
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from database import get_db
from models import Child, SearchLog
from schemas import ChildOut, ReportsResponse, SearchLogOut
from auth import get_current_user

router = APIRouter(tags=["Reports"])
logger = logging.getLogger(__name__)


@router.get("/children", response_model=list[ChildOut])
async def list_children(
    status: str = Query(None, description="Filter by status: 'missing' or 'found'"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """List all registered children (public endpoint)."""
    query = select(Child).order_by(desc(Child.created_at)).offset(skip).limit(limit)
    if status:
        query = query.where(Child.status == status)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/reports", response_model=ReportsResponse)
async def get_reports(
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """Get system statistics and recent search history. Requires authentication."""
    # Counts
    total_result = await db.execute(select(func.count(Child.id)))
    total = total_result.scalar() or 0

    missing_result = await db.execute(
        select(func.count(Child.id)).where(Child.status == "missing")
    )
    missing_count = missing_result.scalar() or 0

    found_count = total - missing_count

    # Search stats
    searches_result = await db.execute(select(func.count(SearchLog.id)))
    total_searches = searches_result.scalar() or 0

    matches_result = await db.execute(
        select(func.count(SearchLog.id)).where(SearchLog.match_found == True)
    )
    matches_found = matches_result.scalar() or 0

    # Recent searches
    logs_result = await db.execute(
        select(SearchLog).order_by(desc(SearchLog.searched_at)).limit(20)
    )
    recent_searches = logs_result.scalars().all()

    # All children
    children_result = await db.execute(
        select(Child).order_by(desc(Child.created_at)).limit(100)
    )
    children = children_result.scalars().all()

    return ReportsResponse(
        total_children=total,
        missing_count=missing_count,
        found_count=found_count,
        total_searches=total_searches,
        matches_found=matches_found,
        recent_searches=[SearchLogOut.model_validate(log) for log in recent_searches],
        children=[ChildOut.model_validate(c) for c in children],
    )
