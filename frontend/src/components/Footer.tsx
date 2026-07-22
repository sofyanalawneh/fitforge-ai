import { IconFlame } from "./icons";

export function Footer() {
  return (
    <footer className="ff-footer">
      <div className="ff-footer-inner">
        <span className="ff-footer-brand">
          <IconFlame />
          FitForge AI
        </span>
        <span>© {new Date().getFullYear()} FitForge AI. Train smarter, eat better.</span>
      </div>
    </footer>
  );
}
