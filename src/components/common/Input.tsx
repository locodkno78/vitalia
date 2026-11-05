import type { InputHTMLAttributes } from "react";
import { useId } from "react";
import "./Input.css";

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  hint?: string;
  error?: string;
}

function Input({
  label,
  hint,
  error,
  id,
  required = false,
  className = "",
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  const describedBy = [
    hint ? hintId : "",
    error ? errorId : "",
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className="input-field">
      <label className="input-label" htmlFor={inputId}>
        {label}
        {required && (
          <span className="input-required" aria-hidden="true">
            {" "}*
          </span>
        )}
      </label>

      <input
        id={inputId}
        className={`input-control ${error ? "input-control--error" : ""} ${className}`}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        {...props}
      />

      {hint && !error && (
        <span id={hintId} className="input-hint">
          {hint}
        </span>
      )}

      {error && (
        <span id={errorId} className="input-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export default Input;