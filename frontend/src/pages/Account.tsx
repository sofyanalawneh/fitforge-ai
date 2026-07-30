import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { logout } from "../services/authService";
import { StatusAlert } from "../components/StatusAlert";

/** Dedicated account page reached from the sidebar's account row — holds
 * sign-in identity (avatar/name/email) and the Sign Out action, which used
 * to live directly in the sidebar footer. Fitness-profile fields stay on the
 * separate /profile page. */
export function Account() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayLabel = user?.displayName || user?.email || "Account";
  const initial = displayLabel.trim().charAt(0).toUpperCase() || "?";

  async function handleSignOut() {
    setError(null);
    setSigningOut(true);
    try {
      await logout();
      navigate("/login");
    } catch {
      setError("Could not sign out. Please try again.");
      setSigningOut(false);
    }
  }

  return (
    <div className="container ff-page ff-page-medium">
      <div className="ff-page-header">
        <span className="ff-eyebrow">Your account</span>
        <h1>Account</h1>
        <p>Manage your sign-in identity and session.</p>
      </div>

      {error && <StatusAlert variant="danger">{error}</StatusAlert>}

      <div className="card-ff">
        <div className="card-ff-body">
          <div className="account-summary">
            <span className="account-summary-avatar">{initial}</span>
            <div className="account-summary-info">
              <div className="account-summary-name">{user?.displayName || "No name set"}</div>
              <div className="account-summary-email">{user?.email}</div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline-ff-danger"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      </div>
    </div>
  );
}
