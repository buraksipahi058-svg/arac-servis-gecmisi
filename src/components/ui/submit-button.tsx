"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { buttonClass, type ButtonSize, type ButtonVariant } from "./button-styles";

type SubmitButtonProps = {
  children: ReactNode;
  pendingText: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
};

export function SubmitButton({
  children,
  pendingText,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={`${buttonClass(variant, size)} ${className}`}
    >
      {pending ? pendingText : children}
    </button>
  );
}
