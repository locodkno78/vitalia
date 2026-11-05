import { useId, type SelectHTMLAttributes } from "react";
import "./Select.css";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  hint?: string;
  error?: string;
}

function Select({
  label,
  options,
  placeholder = "Seleccioná una opción",
  hint,
  error,
  id,
  required = false,
  className = "",
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  const hintId = `${selectId}-hint`;
  const errorId = `${selectId}-error`;

  const describedBy = [
    hint ? hintId : "",
    error ? errorId : "",
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className="select-field">
      <label className="select-label" htmlFor={selectId}>
        {label}
        {required && (
          <span className="select-required" aria-hidden="true">
            {" "}*
          </span>
        )}
      </label>

      <select
        id={selectId}
        className={`select-control ${error ? "select-control--error" : ""} ${className}`}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {hint && !error && (
        <span id={hintId} className="select-hint">
          {hint}
        </span>
      )}

      {error && (
        <span id={errorId} className="select-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export default Select;