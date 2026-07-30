import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { IconDumbbell, IconFlame, IconLayoutGrid, IconSalad, IconUser } from "./icons";

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();

  function linkClass({ isActive }: { isActive: boolean }) {
    return `sidebar-link${isActive ? " active" : ""}`;
  }

  function accountRowClass({ isActive }: { isActive: boolean }) {
    return `sidebar-account-row${isActive ? " active" : ""}`;
  }

  const accountLabel = user?.displayName || user?.email || "Account";
  const accountInitial = accountLabel.trim().charAt(0).toUpperCase() || "?";

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

      <NavLink className={accountRowClass} to="/account" onClick={onClose}>
        <span className="sidebar-account-avatar">{accountInitial}</span>
        <span className="sidebar-account-name">{accountLabel}</span>
      </NavLink>
    </aside>
  );
}
