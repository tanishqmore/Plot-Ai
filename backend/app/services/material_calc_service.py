"""
Quantity-takeoff based material & cost estimation.

These per-sqft consumption norms are widely published civil-engineering
thumb rules (cement bags, steel kg, bricks per sqft of built-up area for
a standard RCC-framed structure). Cite your source in the report (e.g.
a construction estimation textbook or a contractor's published norms) and
clearly state these are approximate, not a substitute for a quantity
surveyor's BOQ.

Rates (rate_per_unit) MUST be updated to your region/market — hardcoded
placeholder values below are for demo purposes only.
"""
from app.schemas.material import MaterialEstimateRequest, MaterialEstimateResult, LineItem

# Consumption per sqft of built-up area (illustrative thumb-rule values)
CONSUMPTION_NORMS = {
    "cement_bags_per_sqft": 0.4,
    "steel_kg_per_sqft": 4.0,
    "bricks_per_sqft": 8.0,
    "sand_cft_per_sqft": 1.2,
    "aggregate_cft_per_sqft": 0.9,
    "tiles_sqft_per_sqft": 1.05,  # ~5% wastage allowance
    "paint_liters_per_sqft": 0.04,
}

# TODO: replace with real, current regional market rates
DEFAULT_RATES = {
    "cement": {"unit": "bags", "rate": 400},
    "steel": {"unit": "kg", "rate": 65},
    "bricks": {"unit": "pcs", "rate": 8},
    "sand": {"unit": "cft", "rate": 55},
    "aggregate": {"unit": "cft", "rate": 60},
    "tiles": {"unit": "sqft", "rate": 70},
    "paint": {"unit": "liters", "rate": 350},
}


def estimate_materials(req: MaterialEstimateRequest) -> MaterialEstimateResult:
    total_bua = req.built_up_area_sqft * req.floors

    quantities = {
        "cement": total_bua * CONSUMPTION_NORMS["cement_bags_per_sqft"],
        "steel": total_bua * CONSUMPTION_NORMS["steel_kg_per_sqft"],
        "bricks": total_bua * CONSUMPTION_NORMS["bricks_per_sqft"],
        "sand": total_bua * CONSUMPTION_NORMS["sand_cft_per_sqft"],
        "aggregate": total_bua * CONSUMPTION_NORMS["aggregate_cft_per_sqft"],
        "tiles": total_bua * CONSUMPTION_NORMS["tiles_sqft_per_sqft"],
        "paint": total_bua * CONSUMPTION_NORMS["paint_liters_per_sqft"],
    }

    line_items = []
    total_cost = 0.0
    for material, qty in quantities.items():
        rate_info = DEFAULT_RATES[material]
        subtotal = round(qty * rate_info["rate"], 2)
        total_cost += subtotal
        line_items.append(
            LineItem(
                material_name=material,
                quantity=round(qty, 2),
                unit=rate_info["unit"],
                rate_per_unit=rate_info["rate"],
                subtotal=subtotal,
            )
        )

    return MaterialEstimateResult(
        build_type=req.build_type,
        built_up_area_sqft=req.built_up_area_sqft,
        floors=req.floors,
        line_items=line_items,
        total_cost=round(total_cost, 2),
    )
