import React from "react";
import { Norican } from "next/font/google";
import { Nunito } from "next/font/google";
import { Manrope } from "next/font/google";
import "../styles/globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

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
    <html
      lang="en"
      className={`${norican.variable} ${nunito.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('calmly-theme');
                if (theme === 'dark') document.documentElement.classList.add('dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="font-body text-text bg-background">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}