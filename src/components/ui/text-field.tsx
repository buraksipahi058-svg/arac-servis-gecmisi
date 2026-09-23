import type { ComponentProps } from "react";

type TextFieldProps = Omit<ComponentProps<"input">, "name"> & {
  label: string;
  name: string;
  hint?: string;
  error?: string;
};

export function TextField({ label, name, hint, error, id, ...inputProps }: TextFieldProps) {
  const inputId = id ?? name;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-gray-800">
        {label}
      </label>
      {/* text-base (16px): iOS'ta odaklanınca otomatik yakınlaştırmayı önler. */}
      <input
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`h-12 rounded-lg border bg-white px-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
            : "border-gray-300 focus:border-gray-900 focus:ring-gray-900/10"
        }`}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-700">
          {error}
        </p>
      )}
      {hint && (
        <p id={hintId} className="text-xs text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
}
