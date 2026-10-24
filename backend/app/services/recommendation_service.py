"""
Build-type recommendation engine.

Start rule-based (deterministic, explainable, easy to defend in a viva).
Once you have this working end-to-end, you can optionally replace/augment
the scoring function with a trained classifier (see ml/build_recommendation/)
using the same input features — the API contract will not need to change.

Rules encoded below are illustrative minimums — replace with your local
municipal building code / FSI table.
"""
from app.schemas.build import BuildSuggestionRequest, BuildSuggestionResult, BuildType

MIN_WIDTH_FT = {
    "rowhouse": 18,
    "bungalow": 30,
    "villa": 40,
    "apartment": 50,
}
MIN_AREA_SQFT = {
    "rowhouse": 900,
    "bungalow": 1800,
    "villa": 3000,
    "apartment": 5000,
}


def _score(build_type: BuildType, req: BuildSuggestionRequest) -> float:
    width_score = min(req.width_ft / MIN_WIDTH_FT[build_type], 1.0)
    area_score = min(req.area_sqft / MIN_AREA_SQFT[build_type], 1.0)
    # Simple weighted average; tune weights as you validate against real cases
    return round(0.5 * width_score + 0.5 * area_score, 3)


def recommend_build_type(req: BuildSuggestionRequest) -> BuildSuggestionResult:
    scores: dict[str, float] = {bt: _score(bt, req) for bt in MIN_WIDTH_FT}
    recommended = max(scores, key=scores.get)

    requested_feasible = True
    reasoning = []
    if req.requested_type:
        requested_feasible = (
            req.width_ft >= MIN_WIDTH_FT[req.requested_type]
            and req.area_sqft >= MIN_AREA_SQFT[req.requested_type]
        )
        if not requested_feasible:
            reasoning.append(
                f"Requested '{req.requested_type}' needs at least "
                f"{MIN_WIDTH_FT[req.requested_type]} ft width and "
                f"{MIN_AREA_SQFT[req.requested_type]} sqft area; this plot "
                f"has {req.width_ft} ft width and {req.area_sqft} sqft."
            )

    reasoning.append(f"Best-fit type based on plot dimensions: '{recommended}'.")

    # Very rough floor suggestion based on buildable area vs desired living area
    floors = 1 if req.buildable_area_sqft < 1500 else 2

    return BuildSuggestionResult(
        recommended_type=recommended,
        requested_type_feasible=requested_feasible,
        scores=scores,
        floors_suggested=floors,
        reasoning=reasoning,
    )
