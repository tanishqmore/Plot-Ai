from pathlib import Path

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


app = FastAPI(
    title="PlotAI API",
    description="""
    AI-powered real estate platform for land analysis,
    build recommendations, construction material estimation,
    and 3D model generation.

    Developer: Tanishq More
    LinkedIn: https://www.linkedin.com/in/tanishq-more-863606344/
    """,
    version="1.0.0",
    contact={
        "name": "Tanishq More",
        "url": "https://www.linkedin.com/in/tanishq-more-863606344/",
    },
)


# CORS: allow local development and the production Vercel frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://plot-ai-lilac.vercel.app",
        "https://plot-33bhghqqf-tanishqmore.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create and serve the generated 3D models directory.
generated_models_dir = Path("generated_models")
generated_models_dir.mkdir(parents=True, exist_ok=True)

app.mount(
    "/generated-models",
    StaticFiles(directory=str(generated_models_dir)),
    name="generated-models",
)


# API routes
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


# Health check
@app.get("/health", tags=["health"])
def health_check():
    return {
        "status": "ok",
        "project": "PlotAI",
        "developer": "Tanishq More",
        "linkedin": "https://www.linkedin.com/in/tanishq-more-863606344/",
    }


# API root
@app.get("/", tags=["health"])
def root():
    return {
        "status": "ok",
        "message": "PlotAI API is running",
        "docs": "/docs",
    }
