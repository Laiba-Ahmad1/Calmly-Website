// src/components/patient/HomeLinkCard.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function HomeLinkCard({
  href,
  icon,
  title,
  description,
  disabled = false,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    // Already-completed card (quiz submitted / journaled today) — block navigation entirely.
    if (disabled) {
      e.preventDefault();
      return;
    }

    // Already navigating — ignore extra clicks.
    if (isPending) {
      e.preventDefault();
      return;
    }

    // Drive navigation ourselves so we can flip isPending on immediately.
    e.preventDefault();
    startTransition(() => {
      router.push(href);
    });
  }

  const isLoadingLook = isPending && !disabled;

  return (
    <Link
      href={href}
      onClick={handleClick}
      aria-disabled={disabled || isPending}
      className={`flex items-center gap-4 rounded-2xl border p-5 transition ${
        disabled
          ? "border-gray-200 bg-green/10  "
          : isLoadingLook
          ? "border-green/30 bg-green/15 opacity-50 cursor-wait pointer-events-none"
          : "border-green/30 bg-green/15 hover:-translate-y-0.5 hover:bg-green/20"
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-green ${
          disabled || isLoadingLook ? "bg-green/10" : "bg-green/20"
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="font-semibold text-text">{title}</p>
        <p className="text-sm opacity-60">{description}</p>
      </div>
    </Link>
  );
}