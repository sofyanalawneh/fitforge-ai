export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="ff-loading">
      <span className="spinner-border ff-spinner" role="status" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
