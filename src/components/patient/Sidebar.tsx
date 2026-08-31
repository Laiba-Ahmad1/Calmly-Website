// src/components/patient/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export interface SidebarLabels {
  home: string;
  feedback: string;
  tasks: string;
  therapists: string;
 
  settings: string;
  notifications: string;
}

const NAV_KEYS = [
  { href: "/home", icon: "⌂", key: "home" },
  { href: "/feedback", icon: "▦", key: "feedback" },
  { href: "/tasks", icon: "☑", key: "tasks" },
  { href: "/therapistFind", icon: "⚕", key: "therapists" },
  { href: "/settings", icon: "⚙", key: "settings" },
] as const;

export default function Sidebar({
  userName = "there",
  userEmail = "",
  labels,
  notificationCount = 0,
}: {
  userName?: string;
  userEmail?: string;
  labels: SidebarLabels;
  notificationCount?: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // controls the slide transition
  const initial = userName.trim().charAt(0).toUpperCase() || "?";

  function openMenu() {
    setOpen(true);
    // mount closed first, then flip to open on next tick so the transition runs
    requestAnimationFrame(() => setMounted(true));
  }

  function closeMenu() {
    setMounted(false);
    setTimeout(() => setOpen(false), 300); // matches transition duration below
  }

  useEffect(() => {
    return () => setMounted(false);
  }, []);

  function BellLink({ onClick }: { onClick?: () => void }) {
    return (
      <Link
        href="/notifications"
        onClick={onClick}
        aria-label={labels.notifications}
        className="relative flex h-8 w-8 items-center justify-center rounded-full text-text/60 transition hover:bg-green/10 hover:text-green"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4.5 w-4.5"
          width="18"
          height="18"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {notificationCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-green px-1 font-body text-[10px] font-bold text-background">
            {notificationCount > 9 ? "9+" : notificationCount}
          </span>
        )}
      </Link>
    );
  }

  return (
    <>
      <div className="fixed left-4 top-4 z-30 flex items-center gap-2">
        <button
          aria-label="Open menu"
          onClick={openMenu}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-background text-lg shadow-sm transition hover:scale-105"
        >
          ☰
        </button>
        <BellLink />
      </div>

      {open && (
        <>
          <div
            aria-hidden
            onClick={closeMenu}
            className={`fixed inset-0 z-40 bg-black/20 transition-all duration-300 ease-out ${
              mounted ? "backdrop-blur-md opacity-100" : "backdrop-blur-none opacity-0"
            }`}
          />

          <aside
            className={`fixed inset-y-0 left-0 z-50 w-72 p-4 transition-transform duration-300 ease-out ${
              mounted ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex h-full flex-col rounded-[2rem] border border-white/40 bg-background/90 p-6 shadow-xl backdrop-blur-xl">
              <div className="mb-8 flex items-center justify-between px-1">
                <span className="font-logo text-2xl text-heading">Calmly</span>
                <div className="flex items-center gap-1">
                  <BellLink onClick={closeMenu} />
                  <button
                    aria-label="Close menu"
                    onClick={closeMenu}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-text/50 transition hover:bg-green/10"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <nav className="flex flex-1 flex-col gap-1.5">
                {NAV_KEYS.map((item) => {
                  const active =
                    pathname === item.href || pathname?.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 font-body text-sm font-medium transition ${
                        active
                          ? "bg-green/20 text-heading"
                          : "text-text/70 hover:bg-green/10"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-green ${
                          active ? "bg-green/25" : "bg-green/15"
                        }`}
                      >
                        {item.icon}
                      </span>
                      {labels[item.key]}
                    </Link>
                  );
                })}
              </nav>

              <Link
                href="/profile"
                onClick={closeMenu}
                className="mt-4 flex items-center gap-3 rounded-xl border border-green/20 bg-green/10 px-3 py-3 transition hover:bg-green/15"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green/25 font-body text-sm font-bold text-heading">
                  {initial}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-body text-sm font-semibold text-text">
                    {userName}
                  </p>
                  {userEmail && (
                    <p className="truncate font-body text-xs text-text/50">
                      {userEmail}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
