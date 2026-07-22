import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Footer } from "./Footer";
import { Sidebar } from "./Sidebar";
import { IconFlame, IconMenu } from "./icons";

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="app-shell-authed">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      {open && <div className="sidebar-backdrop" onClick={() => setOpen(false)} />}

      <div className="app-main-authed">
        <div className="mobile-topbar">
          <Link className="navbar-brand" to="/">
            <span className="brand-mark">
              <IconFlame />
            </span>
            FitForge AI
          </Link>
          <button
            type="button"
            className="btn btn-nav-toggle"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <IconMenu />
          </button>
        </div>

        <div className="ff-app-main">{children}</div>
        <Footer />
      </div>
    </div>
  );
}
