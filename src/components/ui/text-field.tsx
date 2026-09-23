import type { ComponentProps } from "react";

type TextFieldProps = Omit<ComponentProps<"input">, "name"> & {
  label: string;
  name: string;
  hint?: string;
};

export function TextField({ label, name, hint, id, ...inputProps }: TextFieldProps) {
  const inputId = id ?? name;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-gray-800">
        {label}
      </label>
      {/* text-base (16px): iOS'ta odaklanınca otomatik yakınlaştırmayı önler. */}
      <input
        id={inputId}
        name={name}
        aria-describedby={hintId}
        className="h-12 rounded-lg border border-gray-300 bg-white px-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        {...inputProps}
      />
      {hint && (
        <p id={hintId} className="text-xs text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
}
