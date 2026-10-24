import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { estimateMaterials } from "../services/api";
import { usePlotStore } from "../store/plotStore";

export default function Quotation() {
  const navigate = useNavigate();

  const plotAnalysis = usePlotStore(
    (state) => state.plotAnalysis
  );
  const selectedBuildType = usePlotStore(
    (state) => state.selectedBuildType
  );
  const floors = usePlotStore((state) => state.floors);

  const materialEstimate = usePlotStore(
    (state) => state.materialEstimate
  );

  const setMaterialEstimate = usePlotStore(
    (state) => state.setMaterialEstimate
  );
  const setCurrentStep = usePlotStore(
    (state) => state.setCurrentStep
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const builtUpArea = useMemo(() => {
    if (!plotAnalysis) return 0;

    return plotAnalysis.buildable_area_sqft * floors;
  }, [plotAnalysis, floors]);

  useEffect(() => {
    if (!plotAnalysis || !selectedBuildType) {
      navigate("/");
      return;
    }

    const loadEstimate = async () => {
      try {
        setLoading(true);
        setError("");

        const estimate = await estimateMaterials({
          build_type: selectedBuildType,
          built_up_area_sqft: builtUpArea,
          floors,
        });

        setMaterialEstimate(estimate);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to generate the quotation. Make sure the FastAPI backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    loadEstimate();
  }, [
    plotAnalysis,
    selectedBuildType,
    floors,
    builtUpArea,
    navigate,
    setMaterialEstimate,
  ]);

  if (!plotAnalysis || !selectedBuildType) {
    return null;
  }

  const currency =
    materialEstimate?.currency || "INR";

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency:
        currency === "â‚¹" ? "INR" : currency,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleBackToBuild = () => {
    setCurrentStep(2);
    navigate("/build");
  };

  const handleBackToPlot = () => {
    setCurrentStep(1);
    navigate("/");
  };
  const handleBack = () => {
    setCurrentStep(2);
    navigate("/build");
  };
  const handleContinue = () => {
    setCurrentStep(4);
    navigate("/model");
  };

  const handleDownload = () => {
    if (!materialEstimate) return;

    const lines = [
      "PLOTAI â€” CONSTRUCTION QUOTATION",
      "",
      `Build Type: ${materialEstimate.build_type}`,
      `Built-up Area: ${materialEstimate.built_up_area_sqft} sq ft`,
      `Floors: ${materialEstimate.floors}`,
      "",
      "MATERIALS",
      "----------------------------------------",
      ...materialEstimate.line_items.map(
        (item) =>
          `${item.material_name} | ${item.quantity} ${item.unit} | ${formatCurrency(item.rate_per_unit)} | ${formatCurrency(item.subtotal)}`
      ),
      "",
      "----------------------------------------",
      `TOTAL ESTIMATED COST: ${formatCurrency(
        materialEstimate.total_cost
      )}`,
    ];

    const blob = new Blob(
      [lines.join("\n")],
      { type: "text/plain" }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "plotai-quotation.txt";
    anchor.click();

    URL.revokeObjectURL(url);
  };

  return (
    <section className="app-container py-10 sm:py-14">
      <div className="mb-6">
        <button type="button" onClick={handleBack} className="secondary-button">
          ← Back
        </button>
      </div>
      <div className="mb-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          Step 03
        </p>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
          Your construction estimate.
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Review the estimated materials and construction
          cost based on your selected building configuration.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_0.35fr]">
        <div className="card overflow-hidden">
          <div className="grid gap-4 border-b border-border bg-canvas p-6 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted">
                Build type
              </p>

              <p className="mt-1 text-lg font-semibold capitalize">
                {selectedBuildType}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted">
                Built-up area
              </p>

              <p className="mt-1 text-lg font-semibold">
                {builtUpArea.toLocaleString()} ftÂ²
              </p>
            </div>

            <div>
              <p className="text-xs text-muted">
                Floors
              </p>

              <p className="mt-1 text-lg font-semibold">
                {floors}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-10 text-center text-sm text-muted">
                Generating material estimate...
              </div>
            ) : materialEstimate ? (
              <table className="w-full min-w-[680px] text-left">
                <thead className="border-b border-border bg-white">
                  <tr className="text-xs uppercase tracking-wider text-muted">
                    <th className="px-6 py-4 font-medium">
                      Material
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Quantity
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Rate
                    </th>

                    <th className="px-6 py-4 text-right font-medium">
                      Subtotal
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {materialEstimate.line_items.map(
                    (item) => (
                      <tr
                        key={`${item.material_name}-${item.unit}`}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-6 py-4 font-medium">
                          {item.material_name}
                        </td>

                        <td className="px-6 py-4 text-muted">
                          {item.quantity.toLocaleString()}{" "}
                          {item.unit}
                        </td>

                        <td className="px-6 py-4 text-muted">
                          {formatCurrency(
                            item.rate_per_unit
                          )}
                        </td>

                        <td className="px-6 py-4 text-right font-medium">
                          {formatCurrency(
                            item.subtotal
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <p className="text-sm font-medium text-muted">
              Estimated total
            </p>

            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {loading || !materialEstimate
                ? "â€”"
                : formatCurrency(
                    materialEstimate.total_cost
                  )}
            </p>

            <p className="mt-3 text-sm leading-6 text-muted">
              This is an AI-generated estimate based on
              the selected build configuration and
              available material rates.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              disabled={
                loading || !materialEstimate
              }
              onClick={handleDownload}
              className="secondary-button w-full"
            >
              Download Quotation
            </button>

            <button
              type="button"
              disabled={
                loading || !materialEstimate
              }
              onClick={handleContinue}
              className="primary-button w-full"
            >
              Continue to 3D Model
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


