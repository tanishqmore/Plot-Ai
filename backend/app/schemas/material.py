from pydantic import BaseModel
from app.schemas.build import BuildType


class MaterialEstimateRequest(BaseModel):
    build_type: BuildType
    built_up_area_sqft: float
    floors: int = 1
    region: str = "default"  # keys into the rates table for regional pricing


class LineItem(BaseModel):
    material_name: str
    quantity: float
    unit: str
    rate_per_unit: float
    subtotal: float


class MaterialEstimateResult(BaseModel):
    build_type: BuildType
    built_up_area_sqft: float
    floors: int
    line_items: list[LineItem]
    total_cost: float
    currency: str = "INR"
