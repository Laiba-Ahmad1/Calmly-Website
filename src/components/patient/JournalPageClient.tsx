"use client";

import { useState } from "react";
import Link from "next/link";
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
            You already wrote today&apos;s journal
          </h1>
          <p className="mt-2 font-body text-sm text-text/60">
            Come back tomorrow to write again.
          </p>
          <Link
            href="/journals"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-green/40 bg-green/10 px-5 py-2.5 font-body text-sm font-semibold text-heading transition hover:bg-green/20"
          >
            📖 View Previous Journals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-4xl">
      <div className="mb-4 flex justify-end px-2">
        <Link
          href="/journals"
          className="rounded-full border border-white/40 bg-white/10 px-4 py-1.5 font-body text-xs font-semibold text-white/90 backdrop-blur-sm transition hover:bg-white/20"
        >
          📖 View Previous Journals
        </Link>
      </div>
      <JournalForm />
    </div>
  );
}
