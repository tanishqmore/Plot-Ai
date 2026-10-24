
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo =
    (location.state as { from?: string } | null)?.from || "/";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser({
        full_name: fullName.trim(),
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
            data?: { detail?: string | { msg?: string }[] };
          };
        };

        const status = apiError.response?.status;
        const detail = apiError.response?.data?.detail;

        if (status === 409) {
          setError(
            "An account with this email already exists. Please sign in."
          );
        } else if (status === 422) {
          setError(
            Array.isArray(detail)
              ? detail.map((item) => item.msg ?? "Invalid input").join(" ")
              : typeof detail === "string"
                ? detail
                : "Please check your name, email, and password."
          );
        } else {
          setError(
            typeof detail === "string"
              ? detail
              : "Registration failed. Please try again."
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
              Start building your vision
            </p>
            <h1 className="text-4xl font-semibold leading-tight">
              Turn your plot into possibilities.
            </h1>
            <p className="mt-5 leading-7 text-white/70">
              Create your account to explore plot analysis, building
              recommendations, material estimates, and 3D models.
            </p>
          </div>

          <p className="text-sm text-white/50">
            Intelligent real estate planning
          </p>
        </div>

        <div className="p-6 sm:p-10 lg:p-12">
          <div className="mb-7 md:hidden">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent font-bold text-white">
                P
              </span>
              <span className="text-xl font-semibold">PlotAI</span>
            </div>
          </div>

          <p className="text-sm font-medium text-accent">GET STARTED</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Create your account
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Join PlotAI and start planning your property.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label htmlFor="register-name" className="label">
                Full name
              </label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                className="input-field"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="register-email" className="label">
                Email address
              </label>
              <input
                id="register-email"
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
              <label htmlFor="register-password" className="label">
                Password
              </label>
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                className="input-field"
                placeholder="At least 8 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="register-confirm-password" className="label">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="register-confirm-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="input-field pr-20"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
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
              className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-accent hover:underline"
            >
              Sign in
            </Link>
          </p>

          <div className="mt-5 text-center">
            <Link to="/" className="text-sm text-muted hover:text-accent">
              ← Back to PlotAI
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
