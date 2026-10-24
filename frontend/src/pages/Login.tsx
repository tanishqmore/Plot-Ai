
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo =
    (location.state as { from?: string } | null)?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser({
        email: email.trim(),
        password,
      });

      localStorage.setItem("plotai_token", response.access_token);
      navigate(returnTo, { replace: true });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const apiError = err as {
          response?: {
            status?: number;
            data?: { detail?: string };
          };
        };

        if (apiError.response?.status === 401) {
          setError("Invalid email or password. Please try again.");
        } else {
          setError(
            apiError.response?.data?.detail ??
              "Login failed. Please try again."
          );
        }
      } else {
        setError(
          "Cannot connect to the server. Make sure the PlotAI backend is running."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="app-container flex min-h-[calc(100vh-5rem)] items-center justify-center py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-white shadow-card md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-[#30271f] p-10 text-white md:flex">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-3 self-start"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#a66a3f] text-xl font-bold">
              P
            </span>
            <span className="text-xl font-semibold">PlotAI</span>
          </button>

          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#d9b99d]">
              Plan smarter. Build better.
            </p>
            <h1 className="text-4xl font-semibold leading-tight">
              Your dream property starts with a plan.
            </h1>
            <p className="mt-5 leading-7 text-white/70">
              Analyze your plot, explore building options, estimate materials,
              and visualize your project in 3D.
            </p>
          </div>

          <p className="text-sm text-white/50">
            Intelligent real estate planning
          </p>
        </div>

        <div className="p-6 sm:p-10 lg:p-12">
          <div className="mb-8 md:hidden">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent font-bold text-white">
                P
              </span>
              <span className="text-xl font-semibold">PlotAI</span>
            </div>
          </div>

          <p className="text-sm font-medium text-accent">WELCOME BACK</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Sign in to PlotAI
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Continue planning your next property project.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="login-email" className="label">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="login-password" className="label">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="input-field pr-20"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="absolute inset-y-0 right-3 text-sm font-medium text-accent"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-muted">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-accent hover:underline"
            >
              Create account
            </Link>
          </p>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-muted hover:text-accent">
              ← Back to PlotAI
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
