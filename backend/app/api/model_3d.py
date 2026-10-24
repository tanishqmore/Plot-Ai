
from fastapi import APIRouter, Depends
from app.schemas.model3d import Model3DRequest, Model3DResult
from app.services.model_generation_service import generate_3d_model
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/generate", response_model=Model3DResult)
async def generate_model(
    payload: Model3DRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Requires authentication.
    Generates a parametric 3D model (.glb) for the selected build type
    and plot dimensions.
    """
    return generate_3d_model(payload)
