import { useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Footer } from "./Footer";
import { Sidebar } from "./Sidebar";
import { IconFlame, IconMenu } from "./icons";

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  // The public landing page ("/") renders its own navbar/footer and must
  // never be nested inside the authenticated sidebar shell, even for a
  // logged-in visitor who navigates back to it.
  if (!user || pathname === "/") {
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
