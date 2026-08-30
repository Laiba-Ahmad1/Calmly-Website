"use client";

import { useState } from "react";
import JournalForm from "@/components/patient/Journal";

export default function JournalPageClient({
  initialHasJournaledToday,
}: {
  initialHasJournaledToday: boolean;
}) {
  // useState only reads its argument on the very first render — so even if
  // the parent server component re-runs later and passes a new value in,
  // this won't budge until the page is actually re-mounted (a real
  // navigation away and back), not just re-rendered in place.
  const [hasJournaledToday] = useState(initialHasJournaledToday);

  if (hasJournaledToday) {
    return (
      <div className="relative mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center text-center">
        <div className="rounded-[2rem] bg-background/90 px-8 py-10 shadow-sm">
          <p className="text-4xl">🌱</p>
          <h1 className="mt-4 font-heading text-2xl font-bold text-heading">
            You already wrote today's journal
          </h1>
          <p className="mt-2 font-body text-sm text-text/60">
            Come back tomorrow to write again.
          </p>
        </div>
      </div>
    );
  }

  return <JournalForm />;
}