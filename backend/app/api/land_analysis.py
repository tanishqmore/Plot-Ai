"""
Routes for submitting a plot either as an image (auto-analyzed) or as
manual dimensions. Delegates all logic to services/ — routes stay thin.
"""
from fastapi import APIRouter, UploadFile, File, Form
from app.schemas.plot import ManualPlotInput, PlotAnalysisResult
from app.services.image_analysis_service import analyze_plot_image
from app.services.plot_analysis_service import analyze_manual_plot

router = APIRouter()


@router.post("/from-image", response_model=PlotAnalysisResult)
async def analyze_from_image(file: UploadFile = File(...)):
    """
    Upload a top-down / satellite / drone image of the plot.
    Runs segmentation (SAM/U-Net) to find the boundary polygon, computes
    area + shape, and runs YOLO to flag obstructions (trees, structures).
    Falls back to requesting manual input if confidence is too low.
    """
    image_bytes = await file.read()
    result = analyze_plot_image(image_bytes)
    return result


@router.post("/manual", response_model=PlotAnalysisResult)
async def analyze_manual(payload: ManualPlotInput):
    """
    User enters length, width, shape and road-facing side directly.
    This is the reliable fallback path — always keep this working.
    """
    result = analyze_manual_plot(payload)
    return result
