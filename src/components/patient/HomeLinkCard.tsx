// src/components/patient/HomeLinkCard.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomeLinkCard({
  href,
  icon,
  title,
  description,
  disabled = false,
  disabledMessage = "",
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  disabled?: boolean;
  disabledMessage?: string;
}) {
  const [showNote, setShowNote] = useState(false);

  useEffect(() => {
    if (!showNote) return;
    const timer = setTimeout(() => setShowNote(false), 2500);
    return () => clearTimeout(timer);
  }, [showNote]);

  const cardClasses = `flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition ${
    disabled
      ? "border-green/15 bg-green/5 opacity-60"
      : "border-green/30 bg-green/15 hover:-translate-y-0.5 hover:bg-green/20"
  }`;

  const inner = (
    <>
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-green ${
          disabled ? "bg-green/10" : "bg-green/20"
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="font-semibold text-text">{title}</p>
        <p className="text-sm opacity-60">{description}</p>
      </div>
    </>
  );

  if (disabled) {
    return (
      <div className="relative">
        <button type="button" onClick={() => setShowNote(true)} className={cardClasses}>
          {inner}
        </button>

        {showNote && (
          <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-xl bg-heading px-4 py-2 text-center font-body text-xs text-background shadow-lg">
            {disabledMessage}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link href={href} className={cardClasses}>
      {inner}
    </Link>
  );
}