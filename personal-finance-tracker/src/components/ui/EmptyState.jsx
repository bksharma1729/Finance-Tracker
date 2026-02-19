import "./EmptyState.css";

function EmptyState({ icon = "chart", title, description, action }) {
  const Icon = () => {
    if (icon === "chart") {
      return (
        <svg className="empty-state__icon" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.4" />
          <path d="M35 75 L45 55 L55 65 L75 35 L85 45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
          <circle cx="60" cy="60" r="8" fill="currentColor" opacity="0.3" />
        </svg>
      );
    }
    if (icon === "list") {
      return (
        <svg className="empty-state__icon" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="30" width="70" height="12" rx="4" stroke="currentColor" strokeWidth="2" opacity="0.4" />
          <rect x="25" y="52" width="55" height="12" rx="4" stroke="currentColor" strokeWidth="2" opacity="0.4" />
          <rect x="25" y="74" width="60" height="12" rx="4" stroke="currentColor" strokeWidth="2" opacity="0.4" />
          <circle cx="90" cy="68" r="18" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" opacity="0.5" />
          <path d="M85 68 L88 71 L95 64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="empty-state">
      <Icon />
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}

export default EmptyState;
