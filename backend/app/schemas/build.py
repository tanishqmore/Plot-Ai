from pydantic import BaseModel
from typing import Literal, Optional

BuildType = Literal["bungalow", "rowhouse", "apartment", "villa"]


class BuildSuggestionRequest(BaseModel):
    area_sqft: float
    width_ft: float
    length_ft: float
    buildable_area_sqft: float
    road_facing_side: str
    requested_type: Optional[BuildType] = None


class BuildSuggestionResult(BaseModel):
    recommended_type: BuildType
    requested_type_feasible: bool
    scores: dict[BuildType, float]  # 0-1 suitability score per type
    floors_suggested: int
    reasoning: list[str]
