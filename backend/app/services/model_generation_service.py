"""
PlotAI Parametric Architectural 3D Generator

Generates clean procedural exterior 3D models for:
- Bungalow
- Rowhouse
- Villa
- Apartment

Supports:
- Multiple floors
- Windows
- Doors
- Balconies
- Entrance steps
- Flat / sloped / hip roofs
- Ground platform

Exports GLB for the FastAPI frontend.
"""

import os
import uuid

import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial

from app.schemas.model3d import Model3DRequest, Model3DResult


# ============================================================
# CONFIG
# ============================================================

FT_TO_M = 0.3048

FLOOR_HEIGHT_FT = 10.0
WALL_THICKNESS_FT = 0.35
FLOOR_THICKNESS_FT = 0.25

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "generated_models",
)

os.makedirs(MODEL_DIR, exist_ok=True)


# ============================================================
# MATERIALS
# ============================================================

def make_material(color):
    return PBRMaterial(
        baseColorFactor=[
            color[0],
            color[1],
            color[2],
            255,
        ],
        metallicFactor=0.0,
        roughnessFactor=0.65,
    )


WALL_MATERIAL = make_material((225, 220, 210))
WINDOW_MATERIAL = make_material((45, 120, 175))
DOOR_MATERIAL = make_material((105, 65, 35))
ROOF_MATERIAL = make_material((70, 70, 75))
FLOOR_MATERIAL = make_material((190, 185, 175))
BALCONY_MATERIAL = make_material((180, 180, 180))
GROUND_MATERIAL = make_material((140, 140, 135))
STEP_MATERIAL = make_material((165, 165, 160))
ACCENT_MATERIAL = make_material((200, 195, 185))


# ============================================================
# BASIC BOX
# ============================================================

def create_box(
    length_ft,
    width_ft,
    height_ft,
    x_ft=0.0,
    y_ft=0.0,
    z_ft=0.0,
    material=None,
):
    mesh = trimesh.creation.box(
        extents=[
            max(length_ft, 0.05) * FT_TO_M,
            max(width_ft, 0.05) * FT_TO_M,
            max(height_ft, 0.05) * FT_TO_M,
        ]
    )

    mesh.apply_translation([
        x_ft * FT_TO_M,
        y_ft * FT_TO_M,
        (z_ft + height_ft / 2) * FT_TO_M,
    ])

    if material is not None:
        mesh.visual.material = material

    return mesh


# ============================================================
# FLOOR SLAB
# ============================================================

def create_floor_slab(
    length_ft,
    width_ft,
    z_ft,
):
    return create_box(
        length_ft,
        width_ft,
        FLOOR_THICKNESS_FT,
        z_ft=z_ft,
        material=FLOOR_MATERIAL,
    )


# ============================================================
# BUILDING CORE
# ============================================================

def create_building_core(
    length_ft,
    width_ft,
    floors,
):
    """
    Clean solid building volume.

    Uses a solid architectural mass instead of overlapping
    interior wall planes to avoid broken geometry.
    """

    total_height = floors * FLOOR_HEIGHT_FT

    return create_box(
        length_ft,
        width_ft,
        total_height,
        z_ft=0,
        material=WALL_MATERIAL,
    )


# ============================================================
# WINDOW
# ============================================================

def create_window(
    x_ft,
    y_ft,
    z_ft,
    width_ft=3.5,
    height_ft=4.0,
):
    meshes = []

    # Glass
    meshes.append(
        create_box(
            width_ft,
            0.12,
            height_ft,
            x_ft=x_ft,
            y_ft=y_ft,
            z_ft=z_ft,
            material=WINDOW_MATERIAL,
        )
    )

    frame = 0.15

    # Left frame
    meshes.append(
        create_box(
            frame,
            0.18,
            height_ft + 0.3,
            x_ft=x_ft - width_ft / 2,
            y_ft=y_ft,
            z_ft=z_ft - 0.15,
            material=ACCENT_MATERIAL,
        )
    )

    # Right frame
    meshes.append(
        create_box(
            frame,
            0.18,
            height_ft + 0.3,
            x_ft=x_ft + width_ft / 2,
            y_ft=y_ft,
            z_ft=z_ft - 0.15,
            material=ACCENT_MATERIAL,
        )
    )

    # Top frame
    meshes.append(
        create_box(
            width_ft + frame,
            0.18,
            frame,
            x_ft=x_ft,
            y_ft=y_ft,
            z_ft=z_ft + height_ft,
            material=ACCENT_MATERIAL,
        )
    )

    # Bottom frame
    meshes.append(
        create_box(
            width_ft + frame,
            0.18,
            frame,
            x_ft=x_ft,
            y_ft=y_ft,
            z_ft=z_ft - 0.15,
            material=ACCENT_MATERIAL,
        )
    )

    return meshes


# ============================================================
# FRONT WINDOWS
# ============================================================

def add_front_windows(
    meshes,
    length_ft,
    width_ft,
    floor,
    count=3,
    offset_x=0.0,
):
    z_ft = (
        floor * FLOOR_HEIGHT_FT
        + 3.0
    )

    spacing = length_ft / (count + 1)

    for i in range(count):

        x_ft = (
            -length_ft / 2
            + spacing * (i + 1)
            + offset_x
        )

        meshes.extend(
            create_window(
                x_ft,
                -width_ft / 2 - 0.08,
                z_ft,
                width_ft=3.2,
                height_ft=4.0,
            )
        )


# ============================================================
# SIDE WINDOWS
# ============================================================

def add_side_windows(
    meshes,
    length_ft,
    width_ft,
    floor,
):
    z_ft = (
        floor * FLOOR_HEIGHT_FT
        + 3.0
    )

    for y_ft in [
        -width_ft * 0.25,
        width_ft * 0.25,
    ]:

        # Left
        meshes.append(
            create_box(
                0.12,
                3.0,
                3.5,
                x_ft=-length_ft / 2 - 0.08,
                y_ft=y_ft,
                z_ft=z_ft,
                material=WINDOW_MATERIAL,
            )
        )

        # Right
        meshes.append(
            create_box(
                0.12,
                3.0,
                3.5,
                x_ft=length_ft / 2 + 0.08,
                y_ft=y_ft,
                z_ft=z_ft,
                material=WINDOW_MATERIAL,
            )
        )


# ============================================================
# DOOR
# ============================================================

def create_door(
    x_ft,
    y_ft,
    z_ft=0,
    width_ft=4.0,
    height_ft=7.0,
):
    meshes = []

    # Door
    meshes.append(
        create_box(
            width_ft,
            0.20,
            height_ft,
            x_ft=x_ft,
            y_ft=y_ft,
            z_ft=z_ft,
            material=DOOR_MATERIAL,
        )
    )

    # Door header
    meshes.append(
        create_box(
            width_ft + 0.5,
            0.28,
            0.25,
            x_ft=x_ft,
            y_ft=y_ft,
            z_ft=z_ft + height_ft,
            material=ACCENT_MATERIAL,
        )
    )

    # Left frame
    meshes.append(
        create_box(
            0.20,
            0.28,
            height_ft,
            x_ft=x_ft - width_ft / 2,
            y_ft=y_ft,
            z_ft=z_ft,
            material=ACCENT_MATERIAL,
        )
    )

    # Right frame
    meshes.append(
        create_box(
            0.20,
            0.28,
            height_ft,
            x_ft=x_ft + width_ft / 2,
            y_ft=y_ft,
            z_ft=z_ft,
            material=ACCENT_MATERIAL,
        )
    )

    return meshes


# ============================================================
# ENTRANCE STEPS
# ============================================================

def create_steps(
    x_ft,
    y_ft,
    width_ft,
):
    meshes = []

    meshes.append(
        create_box(
            width_ft,
            2.5,
            0.35,
            x_ft=x_ft,
            y_ft=y_ft,
            z_ft=0,
            material=STEP_MATERIAL,
        )
    )

    meshes.append(
        create_box(
            width_ft - 0.5,
            1.2,
            0.35,
            x_ft=x_ft,
            y_ft=y_ft - 1.1,
            z_ft=0.35,
            material=STEP_MATERIAL,
        )
    )

    return meshes


# ============================================================
# BALCONY
# ============================================================

def create_balcony(
    length_ft,
    depth_ft,
    x_ft,
    y_ft,
    z_ft,
):
    meshes = []

    # Balcony floor
    meshes.append(
        create_box(
            length_ft,
            depth_ft,
            0.30,
            x_ft=x_ft,
            y_ft=y_ft,
            z_ft=z_ft,
            material=BALCONY_MATERIAL,
        )
    )

    railing_height = 3.0

    # Front railing
    meshes.append(
        create_box(
            length_ft,
            0.15,
            railing_height,
            x_ft=x_ft,
            y_ft=y_ft - depth_ft / 2,
            z_ft=z_ft + 0.30,
            material=BALCONY_MATERIAL,
        )
    )

    # Left railing
    meshes.append(
        create_box(
            0.15,
            depth_ft,
            railing_height,
            x_ft=x_ft - length_ft / 2,
            y_ft=y_ft,
            z_ft=z_ft + 0.30,
            material=BALCONY_MATERIAL,
        )
    )

    # Right railing
    meshes.append(
        create_box(
            0.15,
            depth_ft,
            railing_height,
            x_ft=x_ft + length_ft / 2,
            y_ft=y_ft,
            z_ft=z_ft + 0.30,
            material=BALCONY_MATERIAL,
        )
    )

    return meshes


# ============================================================
# BUNGALOW
# ============================================================

def create_bungalow(
    length_ft,
    width_ft,
    floors,
):
    meshes = []

    meshes.append(
        create_building_core(
            length_ft,
            width_ft,
            floors,
        )
    )

    for floor in range(floors):

        add_front_windows(
            meshes,
            length_ft,
            width_ft,
            floor,
            count=3,
        )

        add_side_windows(
            meshes,
            length_ft,
            width_ft,
            floor,
        )

    # Main entrance
    meshes.extend(
        create_door(
            0,
            -width_ft / 2 - 0.12,
            width_ft=4.0,
            height_ft=7.0,
        )
    )

    meshes.extend(
        create_steps(
            0,
            -width_ft / 2 - 1.4,
            6.0,
        )
    )

    return trimesh.util.concatenate(meshes)


# ============================================================
# ROWHOUSE
# ============================================================

def create_rowhouse(
    length_ft,
    width_ft,
    floors,
):
    """
    Creates 3 clearly separated rowhouse units
    across the frontage.
    """

    meshes = []

    units = 3

    unit_length = length_ft / units

    for unit in range(units):

        center_x = (
            -length_ft / 2
            + unit_length / 2
            + unit * unit_length
        )

        # Unit body
        meshes.append(
            create_box(
                unit_length - 0.25,
                width_ft,
                floors * FLOOR_HEIGHT_FT,
                x_ft=center_x,
                z_ft=0,
                material=WALL_MATERIAL,
            )
        )

        for floor in range(floors):

            # Main window
            meshes.extend(
                create_window(
                    center_x,
                    -width_ft / 2 - 0.08,
                    floor * FLOOR_HEIGHT_FT + 3.0,
                    width_ft=3.0,
                    height_ft=4.0,
                )
            )

        # Individual entrance
        meshes.extend(
            create_door(
                center_x,
                -width_ft / 2 - 0.12,
                width_ft=3.2,
                height_ft=7.0,
            )
        )

        meshes.extend(
            create_steps(
                center_x,
                -width_ft / 2 - 1.4,
                4.0,
            )
        )

    return trimesh.util.concatenate(meshes)


# ============================================================
# VILLA
# ============================================================

def create_villa(
    length_ft,
    width_ft,
    floors,
):
    meshes = []

    meshes.append(
        create_building_core(
            length_ft,
            width_ft,
            floors,
        )
    )

    for floor in range(floors):

        add_front_windows(
            meshes,
            length_ft,
            width_ft,
            floor,
            count=4,
        )

        add_side_windows(
            meshes,
            length_ft,
            width_ft,
            floor,
        )

    # Main entrance
    meshes.extend(
        create_door(
            0,
            -width_ft / 2 - 0.12,
            width_ft=4.5,
            height_ft=7.5,
        )
    )

    meshes.extend(
        create_steps(
            0,
            -width_ft / 2 - 1.5,
            7.0,
        )
    )

    # Large upper balcony
    if floors > 1:

        meshes.extend(
            create_balcony(
                length_ft * 0.55,
                5.0,
                0,
                -width_ft / 2 - 2.5,
                FLOOR_HEIGHT_FT,
            )
        )

    return trimesh.util.concatenate(meshes)


# ============================================================
# APARTMENT
# ============================================================

def create_apartment(
    length_ft,
    width_ft,
    floors,
):
    meshes = []

    meshes.append(
        create_building_core(
            length_ft,
            width_ft,
            floors,
        )
    )

    for floor in range(floors):

        add_front_windows(
            meshes,
            length_ft,
            width_ft,
            floor,
            count=5,
        )

        add_side_windows(
            meshes,
            length_ft,
            width_ft,
            floor,
        )

        # Balcony on upper floors
        if floor > 0:

            meshes.extend(
                create_balcony(
                    length_ft * 0.55,
                    4.0,
                    0,
                    -width_ft / 2 - 2.0,
                    floor * FLOOR_HEIGHT_FT,
                )
            )

    meshes.extend(
        create_door(
            0,
            -width_ft / 2 - 0.12,
            width_ft=5.0,
            height_ft=8.0,
        )
    )

    meshes.extend(
        create_steps(
            0,
            -width_ft / 2 - 1.5,
            7.0,
        )
    )

    return trimesh.util.concatenate(meshes)


# ============================================================
# FLAT ROOF
# ============================================================

def create_flat_roof(
    length_ft,
    width_ft,
    floors,
):
    return create_box(
        length_ft + 0.8,
        width_ft + 0.8,
        0.45,
        z_ft=floors * FLOOR_HEIGHT_FT,
        material=ROOF_MATERIAL,
    )


# ============================================================
# SLOPED ROOF
# ============================================================

def create_sloped_roof(
    length_ft,
    width_ft,
    floors,
):
    l = length_ft * FT_TO_M
    w = width_ft * FT_TO_M

    base_z = floors * FLOOR_HEIGHT_FT * FT_TO_M
    roof_height = 2.5 * FT_TO_M

    vertices = np.array([
        [-l / 2, -w / 2, base_z],
        [l / 2, -w / 2, base_z],
        [l / 2, w / 2, base_z],
        [-l / 2, w / 2, base_z],
        [-l / 2, 0, base_z + roof_height],
        [l / 2, 0, base_z + roof_height],
    ])

    faces = [
        [0, 1, 5],
        [0, 5, 4],
        [3, 4, 5],
        [3, 5, 2],
        [0, 4, 3],
        [1, 2, 5],
    ]

    roof = trimesh.Trimesh(
        vertices=vertices,
        faces=faces,
        process=True,
    )

    roof.visual.material = ROOF_MATERIAL

    return roof


# ============================================================
# HIP ROOF
# ============================================================

def create_hip_roof(
    length_ft,
    width_ft,
    floors,
):
    l = length_ft * FT_TO_M
    w = width_ft * FT_TO_M

    base_z = floors * FLOOR_HEIGHT_FT * FT_TO_M
    roof_height = 2.3 * FT_TO_M

    vertices = np.array([
        [-l / 2, -w / 2, base_z],
        [l / 2, -w / 2, base_z],
        [l / 2, w / 2, base_z],
        [-l / 2, w / 2, base_z],
        [0, 0, base_z + roof_height],
    ])

    faces = [
        [0, 1, 4],
        [1, 2, 4],
        [2, 3, 4],
        [3, 0, 4],
    ]

    roof = trimesh.Trimesh(
        vertices=vertices,
        faces=faces,
        process=True,
    )

    roof.visual.material = ROOF_MATERIAL

    return roof


# ============================================================
# ROOF SELECTOR
# ============================================================

def create_roof(
    length_ft,
    width_ft,
    floors,
    roof_type,
):
    roof_type = roof_type.lower()

    if roof_type == "sloped":

        return create_sloped_roof(
            length_ft,
            width_ft,
            floors,
        )

    if roof_type == "hip":

        return create_hip_roof(
            length_ft,
            width_ft,
            floors,
        )

    return create_flat_roof(
        length_ft,
        width_ft,
        floors,
    )


# ============================================================
# GROUND
# ============================================================

def create_ground(
    length_ft,
    width_ft,
):
    return create_box(
        length_ft + 14,
        width_ft + 14,
        0.25,
        z_ft=-0.25,
        material=GROUND_MATERIAL,
    )


# ============================================================
# MAIN GENERATOR
# ============================================================

def generate_3d_model(
    req: Model3DRequest,
) -> Model3DResult:

    build_type = req.build_type.lower()

    length_ft = float(req.length_ft)
    width_ft = float(req.width_ft)

    floors = max(
        1,
        int(req.floors),
    )

    roof_type = req.roof_type.lower()

    # --------------------------------------------------------
    # BUILDING TYPE
    # --------------------------------------------------------

    if build_type == "bungalow":

        building = create_bungalow(
            length_ft,
            width_ft,
            floors,
        )

    elif build_type == "rowhouse":

        building = create_rowhouse(
            length_ft,
            width_ft,
            floors,
        )

    elif build_type == "villa":

        building = create_villa(
            length_ft,
            width_ft,
            floors,
        )

    elif build_type == "apartment":

        building = create_apartment(
            length_ft,
            width_ft,
            floors,
        )

    else:

        building = create_villa(
            length_ft,
            width_ft,
            floors,
        )

    # --------------------------------------------------------
    # ROOF
    # --------------------------------------------------------

    roof = create_roof(
        length_ft,
        width_ft,
        floors,
        roof_type,
    )

    # --------------------------------------------------------
    # GROUND
    # --------------------------------------------------------

    ground = create_ground(
        length_ft,
        width_ft,
    )

    # --------------------------------------------------------
    # FINAL MODEL
    # --------------------------------------------------------

    final_mesh = trimesh.util.concatenate([
        ground,
        building,
        roof,
    ])

    # --------------------------------------------------------
    # EXPORT
    # --------------------------------------------------------

    filename = (
        f"{build_type}_"
        f"{roof_type}_"
        f"{floors}floor_"
        f"{uuid.uuid4().hex[:8]}.glb"
    )

    output_path = os.path.join(
        MODEL_DIR,
        filename,
    )

    final_mesh.export(
        output_path,
        file_type="glb",
    )

    model_url = (
        f"/generated-models/{filename}"
    )

    return Model3DResult(
        model_url=model_url,
        template_used=(
            f"{build_type}_"
            f"{roof_type}_"
            f"architectural"
        ),
        generation_params=req.model_dump(),
    )