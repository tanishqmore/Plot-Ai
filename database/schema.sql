-- PlotAI Database Schema
-- Postgres 16 + PostGIS extension

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- draft | analyzed | recommended | quoted | modeled
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE plots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    input_mode VARCHAR(20) NOT NULL, -- 'image' | 'manual'
    length_ft NUMERIC(8,2),
    width_ft NUMERIC(8,2),
    area_sqft NUMERIC(10,2),
    shape VARCHAR(30), -- rectangular | l_shape | irregular
    road_facing_side VARCHAR(20), -- north/south/east/west
    boundary_geom geometry(Polygon, 4326), -- from segmentation, optional
    zoning_code VARCHAR(50),
    setback_front_ft NUMERIC(6,2) DEFAULT 5,
    setback_rear_ft NUMERIC(6,2) DEFAULT 5,
    setback_side_ft NUMERIC(6,2) DEFAULT 3,
    max_far NUMERIC(4,2) DEFAULT 1.5, -- floor area ratio limit
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE plot_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plot_id UUID REFERENCES plots(id) ON DELETE CASCADE,
    storage_url TEXT NOT NULL, -- MinIO/S3 path
    segmentation_confidence NUMERIC(4,3),
    detected_obstructions JSONB, -- e.g. [{"type": "tree", "bbox": [...]}]
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE build_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plot_id UUID REFERENCES plots(id) ON DELETE CASCADE,
    requested_type VARCHAR(50), -- what the user picked
    recommended_type VARCHAR(50), -- what the engine suggests best
    scores JSONB, -- {"bungalow": 0.82, "rowhouse": 0.55, ...}
    feasibility_notes TEXT,
    floors_suggested INT,
    buildable_area_sqft NUMERIC(10,2),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE material_estimates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plot_id UUID REFERENCES plots(id) ON DELETE CASCADE,
    build_type VARCHAR(50),
    floors INT,
    total_cost NUMERIC(14,2),
    currency VARCHAR(10) DEFAULT 'INR',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE estimate_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estimate_id UUID REFERENCES material_estimates(id) ON DELETE CASCADE,
    material_name VARCHAR(100), -- cement, bricks, steel, sand, tiles, paint...
    quantity NUMERIC(12,2),
    unit VARCHAR(20), -- bags, sqft, kg, m3
    rate_per_unit NUMERIC(10,2),
    subtotal NUMERIC(14,2)
);

CREATE TABLE generated_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plot_id UUID REFERENCES plots(id) ON DELETE CASCADE,
    build_type VARCHAR(50),
    template_used VARCHAR(100),
    model_url TEXT, -- path to generated .glb in MinIO
    generation_params JSONB, -- dims/floors/roof type used to parametrize
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_plots_project ON plots(project_id);
CREATE INDEX idx_boundary_geom ON plots USING GIST(boundary_geom);
