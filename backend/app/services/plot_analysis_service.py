"""
Deterministic plot geometry analysis. This is the reliable core of the
"land analysis" feature — no ML required, always works, and is what
your demo should fall back to if the image pipeline misfires.

Configure setback rules per your local building bylaw (values below are
illustrative placeholders — replace with your municipality's actual code).
"""
from app.schemas.plot import ManualPlotInput, PlotAnalysisResult

# TODO: replace with your local development control regulations (DCR)
DEFAULT_SETBACKS_FT = {"front": 5.0, "rear": 5.0, "side": 3.0}


def analyze_manual_plot(payload: ManualPlotInput) -> PlotAnalysisResult:
    area = payload.length_ft * payload.width_ft

    setbacks = DEFAULT_SETBACKS_FT
    buildable_length = max(payload.length_ft - setbacks["front"] - setbacks["rear"], 0)
    buildable_width = max(payload.width_ft - 2 * setbacks["side"], 0)
    buildable_area = buildable_length * buildable_width

    return PlotAnalysisResult(
        area_sqft=round(area, 2),
        shape=payload.shape,
        buildable_area_sqft=round(buildable_area, 2),
        setback_front_ft=setbacks["front"],
        setback_rear_ft=setbacks["rear"],
        setback_side_ft=setbacks["side"],
        obstructions=[],
        segmentation_confidence=None,
        notes="Computed from manual dimensions using default setback rules.",
    )
