"""
Computer Vision based plot image analysis for PlotAI.

Pipeline:
1. OpenCV loads and preprocesses the uploaded image.
2. Contours are used to estimate a possible plot boundary.
3. YOLO detects common objects/obstructions.
4. The result is converted into the existing PlotAnalysisResult schema.
5. Manual input remains the reliable fallback.

IMPORTANT:
Image-only dimensions are approximate unless the image contains
a known scale/reference. Therefore, this module does not pretend
to know exact real-world dimensions from pixels alone.
"""

from __future__ import annotations

import io
import math
from typing import Any

import cv2
import numpy as np
from PIL import Image

from app.schemas.plot import PlotAnalysisResult


CONFIDENCE_THRESHOLD = 0.60

# YOLO model used for general object detection.
YOLO_MODEL_NAME = "yolo11n.pt"

# Objects that may be relevant when analyzing a plot.
OBSTRUCTION_CLASSES = {
    "car",
    "truck",
    "bus",
    "motorcycle",
    "bicycle",
    "tree",
    "bench",
    "building",
}


def _load_image(image_bytes: bytes) -> np.ndarray:
    """Convert uploaded bytes into an OpenCV BGR image."""

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    return cv2.cvtColor(
        np.array(image),
        cv2.COLOR_RGB2BGR,
    )


def _estimate_boundary(
    image: np.ndarray,
) -> tuple[list[tuple[int, int]], float]:
    """
    Estimate a possible plot boundary using OpenCV contours.

    This is a lightweight CV baseline. It is intentionally not
    presented as architectural-grade segmentation.
    """

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Reduce noise.
    blurred = cv2.GaussianBlur(
        gray,
        (5, 5),
        0,
    )

    # Detect edges.
    edges = cv2.Canny(
        blurred,
        50,
        150,
    )

    # Close small gaps in boundaries.
    kernel = np.ones(
        (7, 7),
        np.uint8,
    )

    closed = cv2.morphologyEx(
        edges,
        cv2.MORPH_CLOSE,
        kernel,
        iterations=2,
    )

    contours, _ = cv2.findContours(
        closed,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE,
    )

    if not contours:
        return [], 0.0

    image_area = image.shape[0] * image.shape[1]

    # Ignore extremely tiny contours.
    valid_contours = [
        contour
        for contour in contours
        if cv2.contourArea(contour) > image_area * 0.01
    ]

    if not valid_contours:
        return [], 0.0

    contour = max(
        valid_contours,
        key=cv2.contourArea,
    )

    contour_area = cv2.contourArea(contour)

    perimeter = cv2.arcLength(
        contour,
        True,
    )

    approximation = cv2.approxPolyDP(
        contour,
        0.02 * perimeter,
        True,
    )

    polygon = [
        (
            int(point[0][0]),
            int(point[0][1]),
        )
        for point in approximation
    ]

    coverage = contour_area / max(
        image_area,
        1,
    )

    # Convert coverage into a conservative CV confidence.
    confidence = min(
        0.95,
        max(
            0.20,
            coverage * 1.5,
        ),
    )

    return polygon, confidence


def _classify_shape(
    polygon: list[tuple[int, int]],
) -> str:
    """Estimate a simple plot shape from polygon complexity."""

    if len(polygon) == 4:
        return "rectangular"

    if 5 <= len(polygon) <= 8:
        return "l_shape"

    return "irregular"


def _estimate_pixel_area_sqft(
    polygon: list[tuple[int, int]],
) -> float:
    """
    Return a normalized area estimate.

    IMPORTANT:
    Without a real-world reference scale, this is not an exact
    square-foot measurement.

    We use a conservative placeholder conversion only so the
    existing API can continue operating.
    """

    if len(polygon) < 3:
        return 0.0

    points = np.array(
        polygon,
        dtype=np.float32,
    )

    area_pixels = abs(
        cv2.contourArea(points)
    )

    if area_pixels <= 0:
        return 0.0

    # Prototype normalization.
    #
    # This should eventually be replaced by:
    # - known plot dimension supplied by user
    # - GPS/GIS scale
    # - drone metadata
    # - detected reference object
    #
    # Never treat this as survey-grade measurement.
    scale = 0.01

    return round(
        area_pixels * scale,
        2,
    )


def _detect_obstructions(
    image: np.ndarray,
) -> list[dict[str, Any]]:
    """
    Run YOLO object detection.

    If YOLO cannot load/download its model, return an empty
    obstruction list instead of breaking the entire plot analysis.
    """

    try:
        from ultralytics import YOLO

        model = YOLO(YOLO_MODEL_NAME)

        results = model(
            image,
            verbose=False,
        )

        obstructions: list[dict[str, Any]] = []

        for result in results:
            names = result.names

            if result.boxes is None:
                continue

            for box in result.boxes:
                cls_id = int(
                    box.cls[0].item()
                )

                confidence = float(
                    box.conf[0].item()
                )

                class_name = names.get(
                    cls_id,
                    str(cls_id),
                )

                if (
                    class_name.lower()
                    not in OBSTRUCTION_CLASSES
                ):
                    continue

                coordinates = (
                    box.xyxy[0]
                    .cpu()
                    .numpy()
                    .tolist()
                )

                obstructions.append(
                    {
                        "type": class_name,
                        "confidence": round(
                            confidence,
                            3,
                        ),
                        "bbox": [
                            round(float(value), 1)
                            for value in coordinates
                        ],
                    }
                )

        return obstructions

    except Exception as exc:
        print(
            "YOLO detection unavailable:",
            exc,
        )

        return []


def _calculate_buildable_area(
    area_sqft: float,
) -> float:
    """
    Apply the project's existing conservative setback assumption.

    This is an approximate planning calculation, not a legal
    building-code calculation.
    """

    if area_sqft <= 0:
        return 0.0

    estimated_buildable = area_sqft * 0.70

    return round(
        estimated_buildable,
        2,
    )


def analyze_plot_image(
    image_bytes: bytes,
) -> PlotAnalysisResult:
    """Analyze an uploaded plot image using computer vision."""

    if not image_bytes:
        raise ValueError(
            "Uploaded image is empty."
        )

    image = _load_image(
        image_bytes
    )

    polygon, confidence = _estimate_boundary(
        image
    )

    if not polygon:
        return PlotAnalysisResult(
            area_sqft=0.0,
            shape="irregular",
            buildable_area_sqft=0.0,
            setback_front_ft=5.0,
            setback_rear_ft=5.0,
            setback_side_ft=3.0,
            obstructions=[],
            segmentation_confidence=0.0,
            notes=(
                "Computer vision could not detect a reliable "
                "plot boundary. Please use manual plot dimensions."
            ),
        )

    shape = _classify_shape(
        polygon
    )

    area_sqft = _estimate_pixel_area_sqft(
        polygon
    )

    buildable_area_sqft = _calculate_buildable_area(
        area_sqft
    )

    obstructions = _detect_obstructions(
        image
    )

    notes_parts = [
        "Plot boundary estimated using OpenCV.",
        f"Detected polygon points: {len(polygon)}.",
        f"Estimated plot shape: {shape}.",
        (
            "Area is approximate because the uploaded image "
            "does not provide a verified real-world scale."
        ),
    ]

    if obstructions:
        notes_parts.append(
            f"Detected {len(obstructions)} possible obstruction(s)."
        )
    else:
        notes_parts.append(
            "No supported obstruction was confidently detected."
        )

    if confidence < CONFIDENCE_THRESHOLD:
        notes_parts.append(
            "CV confidence is low. Manual dimensions are recommended."
        )

    return PlotAnalysisResult(
        area_sqft=area_sqft,
        shape=shape,
        buildable_area_sqft=buildable_area_sqft,
        setback_front_ft=5.0,
        setback_rear_ft=5.0,
        setback_side_ft=3.0,
        obstructions=obstructions,
        segmentation_confidence=round(
            confidence,
            3,
        ),
        notes=" ".join(notes_parts),
    )