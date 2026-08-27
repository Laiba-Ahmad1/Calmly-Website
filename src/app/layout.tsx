import react from "react";
import { Norican } from "next/font/google";
import { Nunito } from "next/font/google";
import "../styles/globals.css";
// layout.tsx
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const norican = Norican({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-norican",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${norican.variable} ${nunito.variable}`}>
      <body className="font-body text-text bg-background">{children}</body>
    </html>
  );
}
