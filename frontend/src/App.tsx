import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  Link,
} from "react-router-dom";
import { usePlotStore } from "./store/plotStore";

import UploadPlot from "./pages/UploadPlot";
import ChooseBuildType from "./pages/ChooseBuildType";
import Quotation from "./pages/Quotation";
import Model3DResult from "./pages/Model3DResult";
import Login from "./pages/Login";
import Register from "./pages/Register";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthenticated = Boolean(localStorage.getItem("plotai_token"));

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return children;
}

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentStep = usePlotStore((state) => state.currentStep);
  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  const isAuthenticated = Boolean(localStorage.getItem("plotai_token"));

  const steps = [
    { number: 1, label: "Plot" },
    { number: 2, label: "Build" },
    { number: 3, label: "Quotation" },
    { number: 4, label: "3D Model" },
  ];

  function handleLogout() {
    localStorage.removeItem("plotai_token");
    navigate("/");
  }

  return (
    <header className="border-b border-border bg-white">
      <div className="app-container flex min-h-20 flex-wrap items-center justify-between gap-4 py-3">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-lg font-bold text-white">
            P
          </div>
          <div className="text-left">
            <div className="text-lg font-semibold tracking-tight">PlotAI</div>
            <div className="text-xs text-muted">
              Intelligent real estate planning
            </div>
          </div>
        </button>

        {!isAuthPage && (
          <div className="hidden items-center gap-2 sm:flex">
            {steps.map((step) => {
              const active = currentStep === step.number;
              const completed = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center gap-2">
                  <div
                    className={[
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                      active || completed
                        ? "bg-accent text-white"
                        : "bg-gray-100 text-muted",
                    ].join(" ")}
                  >
                    {step.number}
                  </div>
                  <span
                    className={
                      active
                        ? "text-sm font-medium text-ink"
                        : "text-sm text-muted"
                    }
                  >
                    {step.label}
                  </span>
                  {step.number !== steps.length && (
                    <div className="mx-2 h-px w-6 bg-border" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl px-3 py-2 text-sm font-medium text-ink transition hover:bg-gray-100"
            >
              Logout
            </button>
          ) : (
            <>
              {location.pathname !== "/login" && (
                <Link
                  to="/login"
                  className="rounded-xl px-3 py-2 text-sm font-medium text-ink transition hover:bg-gray-100"
                >
                  Login
                </Link>
              )}
              {location.pathname !== "/register" && (
                <Link
                  to="/register"
                  className="primary-button px-4 py-2 text-sm"
                >
                  Get Started
                </Link>
              )}
            </>
          )}
        </nav>
      </div>

      {!isAuthPage && (
        <div className="px-4 pb-3 sm:hidden">
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{
                width: `${(currentStep / steps.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </header>
  );
}

export default function App() {
  return (
    <div className="page-shell">
      <Header />
      <main>
        <Routes>
          {/* First two steps remain available without login. */}
          <Route path="/" element={<UploadPlot />} />
          <Route path="/build" element={<ChooseBuildType />} />

          {/* Login required for the remaining steps. */}
          <Route
            path="/quotation"
            element={
              <RequireAuth>
                <Quotation />
              </RequireAuth>
            }
          />
          <Route
            path="/model"
            element={
              <RequireAuth>
                <Model3DResult />
              </RequireAuth>
            }
          />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
