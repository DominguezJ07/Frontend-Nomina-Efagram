import './button.css';

export default function Button({ text, type = 'button', disabled, onClick }) {
  return (
    <button
      type={type}
      className="ui-btn"
      disabled={disabled}
      onClick={onClick}
    >
      {text}
    </button>
  );
}
