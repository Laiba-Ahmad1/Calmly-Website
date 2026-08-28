// // src/components/shared/Button.tsx
// import { ButtonHTMLAttributes, ReactNode } from "react";

// interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
//   children: ReactNode;
//   width?: string;
// }

// export default function Button({
//   children,
//   width = "w-48",
//   className = "",
//   ...props
// }: ButtonProps) {
//   return (
//     <button
//       className={`bg-button-shape bg-contain bg-no-repeat bg-center font-body font-semibold text-background px-6 py-3 h-12 transition-transform  duration-300 hover:-translate-y-1 hover:drop-shadow-md ${width} ${className}`}
//       {...props}
//     >
//       {children}
//     </button>
//   );
// }

// src/components/shared/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  width?: string;
  // When provided, renders the button shape as a CSS mask filled with this
  // color instead of the default SVG background-image — lets a single
  // instance use a different shape color without touching /public/button.svg.
  fillColor?: string;
}

export default function Button({
  children,
  width = "w-48",
  className = "",
  fillColor,
  style,
  ...props
}: ButtonProps) {
  const shapeClasses = fillColor
    ? `[mask-image:url('/button.svg')] [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center]
       [-webkit-mask-image:url('/button.svg')] [-webkit-mask-size:contain] [-webkit-mask-repeat:no-repeat] [-webkit-mask-position:center]`
    : "bg-button-shape bg-contain bg-no-repeat bg-center";

  return (
    <button
      style={fillColor ? { backgroundColor: fillColor, ...style } : style}
      className={`${shapeClasses} font-body font-semibold text-background px-6 py-3 h-12 transition-transform duration-300 hover:-translate-y-1 hover:drop-shadow-md ${width} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}