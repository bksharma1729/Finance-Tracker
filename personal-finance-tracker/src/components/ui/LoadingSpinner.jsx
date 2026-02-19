import './LoadingSpinner.css';

function LoadingSpinner({ size = 'medium' }) {
  return (
    <div className={`loading-spinner loading-spinner--${size}`} role="status" aria-label="Loading">
      <div className="loading-spinner__ring" />
    </div>
  );
}

export default LoadingSpinner;
