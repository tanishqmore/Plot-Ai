from pydantic import BaseModel
from app.schemas.build import BuildType


class Model3DRequest(BaseModel):
    build_type: BuildType
    length_ft: float
    width_ft: float
    floors: int = 1
    roof_type: str = "flat"  # flat | sloped | hip


class Model3DResult(BaseModel):
    model_url: str          # path/URL to generated .glb
    template_used: str
    generation_params: dict
