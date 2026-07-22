import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginWithEmail } from "../services/authService";
import { AuthLayout } from "../components/AuthLayout";
import { StatusAlert } from "../components/StatusAlert";
import { IconFlame } from "../components/icons";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await loginWithEmail(email, password);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div className="auth-card ff-animate-in">
        <div className="auth-mark">
          <IconFlame />
        </div>
        <h1>Welcome back</h1>
        {error && <StatusAlert variant="danger">{error}</StatusAlert>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-control"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-brand w-100" disabled={submitting}>
            {submitting ? "Logging in..." : "Log in"}
          </button>
        </form>
        <p className="mt-4 mb-0 text-center">
          Need an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
