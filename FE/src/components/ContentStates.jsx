import { AlertCircle, Disc3, LoaderCircle } from "lucide-react";

export function LoadingState({ label = "Loading…" }) {
  return <div className="content-state"><LoaderCircle className="spin" size={22} /><span>{label}</span></div>;
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="content-state content-state-error">
      <AlertCircle size={21} />
      <span>{message}</span>
      {onRetry && <button className="text-button" type="button" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function EmptyState({ title, description, icon: Icon = Disc3, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon"><Icon size={22} /></div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="page-heading-action">{action}</div>}
    </div>
  );
}
