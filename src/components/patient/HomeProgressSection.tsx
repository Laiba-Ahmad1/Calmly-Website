// src/components/patient/HomeProgressSection.tsx
"use client";

import { useEffect, useRef, useState } from "react";

interface HomeProgressSectionProps {
  weeklyJournalCount: string;
  weeklyExerciseCount: string;
  weeklyCheckinStatus: string;
  sectionTitle: string;
  journalLabel: string;
  exercisesLabel: string;
  checkinLabel: string;
}

export default function HomeProgressSection({
  weeklyJournalCount,
  weeklyExerciseCount,
  weeklyCheckinStatus,
  sectionTitle,
  journalLabel,
  exercisesLabel,
  checkinLabel,
}: HomeProgressSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      className={`px-8 pb-12 pt-2 sm:px-12 transition-all duration-300 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <h2 className="font-heading text-xl font-bold text-heading">
        {sectionTitle}
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <ProgressCard label={journalLabel} value={weeklyJournalCount} />
        <ProgressCard label={exercisesLabel} value={weeklyExerciseCount} />
        <ProgressCard label={checkinLabel} value={weeklyCheckinStatus} />
      </div>
    </div>
  );
}

function ProgressCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-green/30 bg-green/15 p-5 text-center">
      <p className="font-body text-2xl font-extrabold text-heading">{value}</p>
      <p className="mt-1 text-sm opacity-60">{label}</p>
    </div>
  );
}
