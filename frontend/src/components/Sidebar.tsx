import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { logout } from "../services/authService";
import { IconDumbbell, IconFlame, IconLayoutGrid, IconSalad, IconUser } from "./icons";

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    onClose();
    await logout();
    navigate("/login");
  }

  function linkClass({ isActive }: { isActive: boolean }) {
    return `sidebar-link${isActive ? " active" : ""}`;
  }

  return (
    <aside className={`sidebar-ff${open ? " open" : ""}`}>
      <NavLink className="sidebar-brand" to="/" onClick={onClose}>
        <span className="brand-mark">
          <IconFlame />
        </span>
        FitForge AI
      </NavLink>

      <nav className="sidebar-nav">
        <NavLink className={linkClass} to="/dashboard" onClick={onClose} end>
          <IconLayoutGrid />
          Dashboard
        </NavLink>
        <NavLink className={linkClass} to="/profile" onClick={onClose}>
          <IconUser />
          Profile
        </NavLink>
        <NavLink className={linkClass} to="/generate/workout" onClick={onClose}>
          <IconDumbbell />
          New Workout
        </NavLink>
        <NavLink className={linkClass} to="/generate/meal" onClick={onClose}>
          <IconSalad />
          New Meal Plan
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        {user?.email && <div className="sidebar-user-email">{user.email}</div>}
        <button type="button" className="btn btn-outline-light btn-sm w-100" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </aside>
  );
}
