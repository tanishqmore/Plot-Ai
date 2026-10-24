from pydantic import BaseModel, Field
from typing import Optional, Literal


class ManualPlotInput(BaseModel):
    length_ft: float = Field(..., gt=0)
    width_ft: float = Field(..., gt=0)
    shape: Literal["rectangular", "l_shape", "irregular"] = "rectangular"
    road_facing_side: Literal["north", "south", "east", "west"] = "north"
    zoning_code: Optional[str] = None


class Obstruction(BaseModel):
    type: str          # "tree" | "existing_structure" | "pole" | ...
    bbox: list[float]  # [x1, y1, x2, y2] in image coords


class PlotAnalysisResult(BaseModel):
    plot_id: Optional[str] = None
    area_sqft: float
    shape: str
    buildable_area_sqft: float
    setback_front_ft: float
    setback_rear_ft: float
    setback_side_ft: float
    obstructions: list[Obstruction] = []
    segmentation_confidence: Optional[float] = None  # only for image path
    notes: Optional[str] = None
