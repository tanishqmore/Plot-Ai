
from fastapi import APIRouter, Depends
from app.schemas.material import MaterialEstimateRequest, MaterialEstimateResult
from app.services.material_calc_service import estimate_materials
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/", response_model=MaterialEstimateResult)
async def get_material_estimate(
    payload: MaterialEstimateRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Requires authentication.
    Calculates material quantities based on built-up area, build type,
    and floor count.
    """
    return estimate_materials(payload)
