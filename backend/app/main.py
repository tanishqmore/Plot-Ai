
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api import (
    auth,
    land_analysis,
    build_suggestion,
    material_estimation,
    model_3d,
)


# ============================================================
# PLOT AI API — PROJECT INFORMATION
# Built by Tanishq More
# LinkedIn: https://www.linkedin.com/in/tanishq-more-863606344/
# ============================================================

app = FastAPI(
    title="PlotAI API",
    description="""
    AI-powered real estate platform for land analysis,
    build recommendations, construction material estimation,
    and 3D model generation.

    Developer: Tanishq More

    LinkedIn Profile:
    https://www.linkedin.com/in/tanishq-more-863606344/
    """,
    version="1.0.0",
    contact={
        "name": "Tanishq More",
        "url": "https://www.linkedin.com/in/tanishq-more-863606344/",
    },
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# STATIC 3D MODELS
# ============================================================

app.mount(
    "/generated-models",
    StaticFiles(directory="generated_models"),
    name="generated-models",
)


# ============================================================
# API ROUTES
# ============================================================

app.include_router(
    auth.router,
    prefix="/api/auth",
    tags=["auth"],
)

app.include_router(
    land_analysis.router,
    prefix="/api/land-analysis",
    tags=["land-analysis"],
)

app.include_router(
    build_suggestion.router,
    prefix="/api/build-suggestion",
    tags=["build-suggestion"],
)

app.include_router(
    material_estimation.router,
    prefix="/api/material-estimation",
    tags=["material-estimation"],
)

app.include_router(
    model_3d.router,
    prefix="/api/model-3d",
    tags=["3d-model"],
)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health", tags=["health"])
def health_check():
    return {
        "status": "ok",
        "project": "PlotAI",
        "developer": "Tanishq More",
        "linkedin": "https://www.linkedin.com/in/tanishq-more-863606344/",
    }
