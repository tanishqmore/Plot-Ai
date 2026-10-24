import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generate3DModel } from "../services/api";
import FinalModelViewer from "../viewer3d/FinalModelViewer";
import { usePlotStore } from "../store/plotStore";

export default function Model3DResult() {
  const navigate = useNavigate();

  const plotInput = usePlotStore((state) => state.plotInput);
  const selectedBuildType = usePlotStore(
    (state) => state.selectedBuildType
  );
  const floors = usePlotStore((state) => state.floors);
  const roofType = usePlotStore((state) => state.roofType);
  const model3D = usePlotStore((state) => state.model3D);

  const setModel3D = usePlotStore(
    (state) => state.setModel3D
  );
  const reset = usePlotStore((state) => state.reset);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!plotInput || !selectedBuildType) {
      navigate("/");
      return;
    }

    const createModel = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await generate3DModel({
          build_type: selectedBuildType,
          length_ft: plotInput.length_ft,
          width_ft: plotInput.width_ft,
          floors,
          roof_type: roofType,
        });

        setModel3D(result);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to generate the 3D model. Make sure the FastAPI backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    if (!model3D) {
      createModel();
    } else {
      setLoading(false);
    }
  }, [
    plotInput,
    selectedBuildType,
    floors,
    roofType,
    model3D,
    setModel3D,
    navigate,
  ]);

  const handleStartOver = () => {
    reset();
    navigate("/");
  };

  if (!plotInput || !selectedBuildType) {
    return null;
  }

  return (
    <section className="app-container py-10 sm:py-14">
      <div className="mb-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          Step 04
        </p>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
          Explore your 3D model.
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Your building configuration has been converted
          into a 3D model. Rotate and inspect the result
          below.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-border p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted">
              Selected configuration
            </p>

            <p className="mt-1 text-lg font-semibold capitalize">
              {selectedBuildType} · {floors}{" "}
              {floors === 1 ? "floor" : "floors"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-canvas px-3 py-1.5 text-xs font-medium capitalize">
              {roofType} roof
            </span>

            <span className="rounded-full bg-canvas px-3 py-1.5 text-xs font-medium">
              {plotInput.length_ft} × {plotInput.width_ft} ft
            </span>
          </div>
        </div>

        <div className="relative h-[520px] bg-canvas">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-border border-t-accent" />

                <p className="font-medium">
                  Generating your 3D model...
                </p>

                <p className="mt-2 text-sm text-muted">
                  This may take a moment.
                </p>
              </div>
            </div>
          ) : model3D?.model_url ? (
            <FinalModelViewer
            url={`http://localhost:8000${model3D.model_url}`}
            lengthFt={plotInput.length_ft}
            widthFt={plotInput.width_ft}
/>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted">
                No 3D model was returned by the server.
              </p>
            </div>
          )}
        </div>

        {model3D && (
          <div className="border-t border-border p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-canvas p-4">
                <p className="text-xs text-muted">
                  Template used
                </p>

                <p className="mt-1 font-medium">
                  {model3D.template_used || "Default"}
                </p>
              </div>

              <div className="rounded-xl bg-canvas p-4">
                <p className="text-xs text-muted">
                  Model format
                </p>

                <p className="mt-1 font-medium">
                  GLB / glTF
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => navigate("/quotation")}
          className="secondary-button"
        >
          Back to Quotation
        </button>

        <button
          type="button"
          onClick={handleStartOver}
          className="primary-button"
        >
          Start New Project
        </button>
      </div>
    </section>
  );
}