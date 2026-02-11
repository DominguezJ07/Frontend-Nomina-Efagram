import './input.css';

export default function Input({ label, error, ...props }) {
  return (
    <div className="ui-field">
      {label ? <label className="ui-label">{label}</label> : null}
      <input className={`ui-input ${error ? 'ui-input--error' : ''}`} {...props} />
      {error ? <div className="ui-error">{error}</div> : null}
    </div>
  );
}
