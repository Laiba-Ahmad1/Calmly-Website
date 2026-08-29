"use client";

import { useEffect, useState } from "react";
import TherapistCard from "./TherapistCard";

export interface TherapistListItem {
  id: string;
  therapistUserId: string;
  name: string;
  avatarUrl: string | null;
  bio: string;
  requestStatus: "none" | "pending" | "active" | "blocked";
}

export default function TherapistSearch({
  initialTherapists,
}: {
  initialTherapists: TherapistListItem[];
}) {
  const [query, setQuery] = useState("");
  const [therapists, setTherapists] = useState(initialTherapists);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/therapist/search?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        setTherapists(data.therapists ?? []);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="flex flex-col gap-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search therapists by name..."
        className="w-full rounded-2xl border border-green/30 bg-green/10 px-4 py-3 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/30"
      />

      <div className="flex flex-col gap-3">
        {loading && <p className="py-6 text-center text-sm text-text/50">Searching…</p>}

        {!loading && therapists.length === 0 && (
          <p className="py-6 text-center text-sm text-text/50">No therapists found.</p>
        )}

        {!loading &&
          therapists.map((t) => (
            <TherapistCard
              key={t.id}
              therapist={t}
              onRequestSent={() =>
                setTherapists((prev) =>
                  prev.map((p) => (p.id === t.id ? { ...p, requestStatus: "pending" } : p))
                )
              }
            />
          ))}
      </div>
    </div>
  );
}