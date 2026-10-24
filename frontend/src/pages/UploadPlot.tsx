import { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  analyzeManualPlot,
  analyzePlotImage,
} from "../services/api";
import {
  PlotShape,
  RoadFacingSide,
  usePlotStore,
} from "../store/plotStore";

type InputMode = "image" | "manual";

export default function UploadPlot() {
  const navigate = useNavigate();

  const setPlotInput = usePlotStore((state) => state.setPlotInput);
  const setPlotAnalysis = usePlotStore(
    (state) => state.setPlotAnalysis
  );
  const setCurrentStep = usePlotStore(
    (state) => state.setCurrentStep
  );

  const [mode, setMode] = useState<InputMode>("manual");
  const [file, setFile] = useState<File | null>(null);

  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");

  const [shape, setShape] =
    useState<PlotShape>("rectangular");

  const [roadFacingSide, setRoadFacingSide] =
    useState<RoadFacingSide>("north");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0] ?? null;

    setFile(selectedFile);
    setError("");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    try {
      setLoading(true);

      if (mode === "image") {
        if (!file) {
          setError("Please select a plot image.");
          return;
        }

        const analysis = await analyzePlotImage(file);

        setPlotInput({
          length_ft: 0,
          width_ft: 0,
          shape: "rectangular",
          road_facing_side: "north",
          imageFile: file,
        });

        setPlotAnalysis(analysis);
        setCurrentStep(2);

        navigate("/build");
        return;
      }

      const lengthFt = Number(length);
      const widthFt = Number(width);

      if (!lengthFt || !widthFt || lengthFt <= 0 || widthFt <= 0) {
        setError(
          "Please enter valid positive plot dimensions."
        );
        return;
      }

      const analysis = await analyzeManualPlot({
        length_ft: lengthFt,
        width_ft: widthFt,
        shape,
        road_facing_side: roadFacingSide,
      });

      setPlotInput({
        length_ft: lengthFt,
        width_ft: widthFt,
        shape,
        road_facing_side: roadFacingSide,
      });

      setPlotAnalysis(analysis);
      setCurrentStep(2);

      navigate("/build");
    } catch (err) {
      console.error(err);

      setError(
        "Unable to analyze the plot. Make sure the FastAPI backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="app-container py-10 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            Step 01
          </p>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            Start with your plot.
          </h1>

          <p className="mt-4 text-base leading-7 text-muted sm:text-lg">
            Upload a plot image or enter the dimensions manually.
            PlotAI will analyze the land and calculate the usable
            buildable area.
          </p>
        </div>

        <div className="card overflow-hidden">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
            <div className="border-b border-border p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="mb-6">
                <p className="text-sm font-medium text-muted">
                  Choose input method
                </p>

                <div className="mt-3 grid grid-cols-2 rounded-xl bg-gray-100 p-1">
                  <button
                    type="button"
                    onClick={() => setMode("manual")}
                    className={[
                      "rounded-lg px-4 py-3 text-sm font-medium transition",
                      mode === "manual"
                        ? "bg-white text-ink shadow-sm"
                        : "text-muted",
                    ].join(" ")}
                  >
                    Manual
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("image")}
                    className={[
                      "rounded-lg px-4 py-3 text-sm font-medium transition",
                      mode === "image"
                        ? "bg-white text-ink shadow-sm"
                        : "text-muted",
                    ].join(" ")}
                  >
                    Plot Image
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-canvas p-5">
                <p className="text-sm font-medium text-ink">
                  What happens next?
                </p>

                <div className="mt-4 space-y-4">
                  {[
                    "Analyze plot dimensions and shape",
                    "Calculate setbacks and buildable area",
                    "Recommend a suitable building type",
                    "Estimate construction materials and cost",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-start gap-3"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                        {index + 1}
                      </span>

                      <p className="text-sm leading-6 text-muted">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 sm:p-8"
            >
              {mode === "manual" ? (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="label">
                        Length (ft)
                      </label>

                      <input
                        className="input-field"
                        type="number"
                        min="1"
                        step="0.1"
                        placeholder="e.g. 60"
                        value={length}
                        onChange={(e) =>
                          setLength(e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="label">
                        Width (ft)
                      </label>

                      <input
                        className="input-field"
                        type="number"
                        min="1"
                        step="0.1"
                        placeholder="e.g. 40"
                        value={width}
                        onChange={(e) =>
                          setWidth(e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="label">
                      Plot shape
                    </label>

                    <select
                      className="input-field"
                      value={shape}
                      onChange={(e) =>
                        setShape(e.target.value as PlotShape)
                      }
                    >
                      <option value="rectangular">
                        Rectangular
                      </option>
                      <option value="l_shape">
                        L-Shape
                      </option>
                      <option value="irregular">
                        Irregular
                      </option>
                    </select>
                  </div>

                  <div className="mt-5">
                    <label className="label">
                      Road-facing side
                    </label>

                    <select
                      className="input-field"
                      value={roadFacingSide}
                      onChange={(e) =>
                        setRoadFacingSide(
                          e.target.value as RoadFacingSide
                        )
                      }
                    >
                      <option value="north">North</option>
                      <option value="south">South</option>
                      <option value="east">East</option>
                      <option value="west">West</option>
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="label">
                    Upload plot image
                  </label>

                  <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-canvas px-6 text-center transition hover:border-accent">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                      ↑
                    </div>

                    <p className="font-medium text-ink">
                      {file
                        ? file.name
                        : "Choose a plot image"}
                    </p>

                    <p className="mt-2 text-sm text-muted">
                      JPG, PNG or WEBP
                    </p>

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              )}

              {error && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="primary-button mt-7 w-full"
              >
                {loading
                  ? "Analyzing plot..."
                  : "Analyze Plot"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}