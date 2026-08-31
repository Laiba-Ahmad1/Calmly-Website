// src/components/patient/FeedbackEnvelope.tsx
"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";

function LetterReveal({ children }: { children: React.ReactNode }) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        entered ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

export default function FeedbackEnvelope({
  weekLabel,
  children,
}: {
  weekLabel: string;
  children: React.ReactNode;
}) {
  const [stage, setStage] = useState<"closed" | "opening" | "open">("closed");

  function handleOpen() {
    if (stage !== "closed") return;
    setStage("opening");
    setTimeout(() => setStage("open"), 550); // matches flap transition duration
  }

  if (stage === "open") {
    return (
      <LetterReveal>
        <article className="relative overflow-hidden rounded-2xl border border-green/20 bg-background p-8 shadow-md">
          {/* subtle "page" feel — a soft margin line, like notebook paper */}
          <div className="pointer-events-none absolute bottom-0 left-10 top-0 w-px bg-green/10" />
          {/* folded-corner accent, bottom right */}
          <div
            className="pointer-events-none absolute bottom-0 right-0 h-8 w-8 bg-green/10"
            style={{ clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }}
          />
          <div className="relative pl-4">{children}</div>
        </article>
      </LetterReveal>
    );
  }

  return (
    <button
      type="button"
      onClick={handleOpen}
      aria-label={`Open feedback letter — ${weekLabel}`}
      className="group relative block w-full overflow-visible rounded-2xl text-left focus:outline-none"
      style={{ perspective: "1200px" }}
    >
      {/* envelope body */}
      <div className="relative flex min-h-[22rem] flex-col items-center justify-center gap-4 rounded-2xl border border-green/25 bg-background p-6 shadow-sm transition group-hover:shadow-md">
        {/* <span className="rounded-full bg-green/15 p-4">
          <Mail size={28} className="text-green" strokeWidth={1.6} />
        </span> */}
        
        <div className="absolute bottom-12 text-center">
          <p className="font-body font-bold text-2xl text-heading">A note for you</p>
          <p className="mt-1 font-body text-xs font-medium uppercase tracking-widest text-text/40">
            {weekLabel}
          </p>
        </div>
        <span className="mt-12 font-body text-xs text-text/50">Tap to open</span>
      </div>

      {/* envelope flap — hinged at the top, folds open on click */}
      <div
        className="absolute inset-x-0 top-0 h-1/2 rounded-t-2xl border border-b-0 border-green/25 bg-green/10 transition-transform duration-500 ease-in-out"
        style={{
          clipPath: "polygon(0 0, 100% 0, 50% 100%)",
          transformOrigin: "top",
          transform: stage === "opening" ? "rotateX(-150deg)" : "rotateX(0deg)",
        }}
      />
    </button>
  );
}