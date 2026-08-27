// src/components/shared/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  width?: string;
}

export default function Button({
  children,
  width = "w-48",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`bg-button-shape bg-contain bg-no-repeat bg-center font-body font-semibold text-background px-6 py-3 h-12 transition-transform  duration-300 hover:-translate-y-1 hover:drop-shadow-md ${width} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}