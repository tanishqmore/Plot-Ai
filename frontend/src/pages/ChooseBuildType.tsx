import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { suggestBuildType } from "../services/api";
import HousePreview from "../viewer3d/HousePreview";
import {
  BuildType,
  RoofType,
  usePlotStore,
} from "../store/plotStore";

const buildTypes: {
  type: BuildType;
  title: string;
  description: string;
}[] = [
  {
    type: "bungalow",
    title: "Bungalow",
    description: "Independent home with a spacious layout.",
  },
  {
    type: "rowhouse",
    title: "Rowhouse",
    description: "Efficient multi-unit residential planning.",
  },
  {
    type: "villa",
    title: "Villa",
    description: "Premium independent residential design.",
  },
  {
    type: "apartment",
    title: "Apartment",
    description: "Vertical planning for multiple floors.",
  },
];

export default function ChooseBuildType() {
  const navigate = useNavigate();

  const plotInput = usePlotStore((state) => state.plotInput);
  const plotAnalysis = usePlotStore(
    (state) => state.plotAnalysis
  );

  const selectedBuildType = usePlotStore(
    (state) => state.selectedBuildType
  );
  const floors = usePlotStore((state) => state.floors);
  const roofType = usePlotStore((state) => state.roofType);

  const setSelectedBuildType = usePlotStore(
    (state) => state.setSelectedBuildType
  );
  const setFloors = usePlotStore((state) => state.setFloors);
  const setRoofType = usePlotStore(
    (state) => state.setRoofType
  );
  const setBuildSuggestion = usePlotStore(
    (state) => state.setBuildSuggestion
  );
  const setCurrentStep = usePlotStore(
    (state) => state.setCurrentStep
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!plotInput || !plotAnalysis) {
      navigate("/");
      return;
    }

    const loadSuggestion = async () => {
      try {
        setLoading(true);
        setError("");

        const suggestion = await suggestBuildType({
          area_sqft: plotAnalysis.area_sqft,
          width_ft: plotInput.width_ft,
          length_ft: plotInput.length_ft,
          buildable_area_sqft:
            plotAnalysis.buildable_area_sqft,
          road_facing_side:
            plotInput.road_facing_side,
        });

        setBuildSuggestion(suggestion);

        if (!selectedBuildType) {
          setSelectedBuildType(
            suggestion.recommended_type
          );
        }

        if (suggestion.floors_suggested) {
          setFloors(suggestion.floors_suggested);
        }
      } catch (err) {
        console.error(err);
        setError(
          "Unable to generate a building recommendation. Check that the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSuggestion();
  }, [
    plotInput,
    plotAnalysis,
    navigate,
    selectedBuildType,
    setBuildSuggestion,
    setSelectedBuildType,
    setFloors,
  ]);

  if (!plotInput || !plotAnalysis) {
    return null;
  }

  const currentBuildType =
    selectedBuildType ?? "bungalow";

  const recommendedType =
    usePlotStore(
      (state) => state.buildSuggestion
    )?.recommended_type;

  const reasoning =
    usePlotStore(
      (state) => state.buildSuggestion
    )?.reasoning ?? [];

  const scores =
  usePlotStore(
    (state) => state.buildSuggestion
  )?.scores;

const selectedScore =
  scores?.[currentBuildType] ?? 0;

  const handleContinue = () => {
    setCurrentStep(3);
    navigate("/quotation");
  };

  return (
    <section className="app-container py-10 sm:py-14">
      <div className="mb-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          Step 02
        </p>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
          Choose your build.
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          PlotAI has analyzed your land. Choose a building
          type or use the recommended option.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <div className="space-y-6">
          <div className="card p-6">
            <p className="text-sm font-medium text-muted">
              Plot analysis
            </p>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-canvas p-4">
                <p className="text-xs text-muted">
                  Total area
                </p>
                <p className="mt-1 text-xl font-semibold">
                  {plotAnalysis.area_sqft.toLocaleString()} ft²
                </p>
              </div>

              <div className="rounded-xl bg-canvas p-4">
                <p className="text-xs text-muted">
                  Buildable area
                </p>
                <p className="mt-1 text-xl font-semibold">
                  {plotAnalysis.buildable_area_sqft.toLocaleString()}{" "}
                  ft²
                </p>
              </div>

              <div className="rounded-xl bg-canvas p-4">
                <p className="text-xs text-muted">
                  Dimensions
                </p>
                <p className="mt-1 font-semibold">
                  {plotInput.length_ft} ×{" "}
                  {plotInput.width_ft} ft
                </p>
              </div>

              <div className="rounded-xl bg-canvas p-4">
                <p className="text-xs text-muted">
                  Road side
                </p>
                <p className="mt-1 font-semibold capitalize">
                  {plotInput.road_facing_side}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">
                  Building type
                </p>
                <p className="mt-1 font-semibold">
                  Select a design direction
                </p>
              </div>

              {recommendedType && (
                <span className="rounded-full bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">
                  AI Recommended
                </span>
              )}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {buildTypes.map((item) => {
                const selected =
                  currentBuildType === item.type;

                const recommended =
                  recommendedType === item.type;

                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() =>
                      setSelectedBuildType(item.type)
                    }
                    className={[
                      "rounded-2xl border p-4 text-left transition",
                      selected
                        ? "border-accent bg-accent/5 ring-2 ring-accent/10"
                        : "border-border bg-white hover:border-accent/40",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-muted">
                          {item.description}
                        </p>
                      </div>

                      {recommended && (
                        <span className="text-xs font-medium text-accent">
                          Recommended
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {!loading && selectedScore < 0.5 && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                This building type has a lower compatibility
                score for the analyzed plot.
              </div>
            )}
          </div>

          <div className="card p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label">
                  Number of floors
                </label>

                <select
                  className="input-field"
                  value={floors}
                  onChange={(e) =>
                    setFloors(Number(e.target.value))
                  }
                >
                  {[1, 2, 3, 4].map((floor) => (
                    <option key={floor} value={floor}>
                      {floor} {floor === 1 ? "Floor" : "Floors"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">
                  Roof type
                </label>

                <select
                  className="input-field"
                  value={roofType}
                  onChange={(e) =>
                    setRoofType(
                      e.target.value as RoofType
                    )
                  }
                >
                  <option value="flat">Flat</option>
                  <option value="sloped">Sloped</option>
                  <option value="hip">Hip</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={handleContinue}
            className="primary-button w-full"
          >
            {loading
              ? "Generating recommendation..."
              : "Continue to Quotation"}
          </button>
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-border p-6">
            <p className="text-sm font-medium text-muted">
              Live 3D preview
            </p>

            <p className="mt-1 text-lg font-semibold">
              {currentBuildType} · {floors}{" "}
              {floors === 1 ? "floor" : "floors"}
            </p>
          </div>

          <div className="h-[480px] bg-canvas">
            <HousePreview
              lengthFt={
                plotInput.length_ft || 40
              }
              widthFt={
                plotInput.width_ft || 30
              }
              floors={floors}
              roofType={roofType}
            />
          </div>

          {reasoning.length > 0 && (
            <div className="border-t border-border p-6">
              <p className="text-sm font-semibold">
                Why PlotAI recommends this
              </p>

              <ul className="mt-4 space-y-3">
                {reasoning.map((reason) => (
                  <li
                    key={reason}
                    className="flex gap-3 text-sm leading-6 text-muted"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}