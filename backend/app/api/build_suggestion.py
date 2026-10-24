from fastapi import APIRouter
from app.schemas.build import BuildSuggestionRequest, BuildSuggestionResult
from app.services.recommendation_service import recommend_build_type

router = APIRouter()


@router.post("/", response_model=BuildSuggestionResult)
async def suggest_build(payload: BuildSuggestionRequest):
    """
    Given plot analysis results + the user's requested build type,
    return a feasibility score for every build type and flag whether
    the user's choice is actually viable.
    """
    return recommend_build_type(payload)
