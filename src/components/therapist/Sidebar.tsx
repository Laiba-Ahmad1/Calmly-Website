// src/components/therapist/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export interface TherapistSidebarLabels {
  dashboard: string;
  patients: string;
  requests: string;
  reports: string;
  profile: string;
  workspace: string;
}

const NAV_ITEMS = [
  { href: "/therapist", icon: "⌂", key: "dashboard" as const },
  { href: "/therapist/patients", icon: "☺", key: "patients" as const },
  { href: "/therapist/requests", icon: "✉", key: "requests" as const },
  { href: "/therapist/reports", icon: "▦", key: "reports" as const },
  { href: "/therapist/profile", icon: "⚙", key: "profile" as const },
];

function NavLinks({
  labels,
  pendingCount,
  onNavigate,
  isActive,
}: {
  labels: TherapistSidebarLabels;
  pendingCount: number;
  onNavigate?: () => void;
  isActive: (href: string) => boolean;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-1.5">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 font-body text-sm font-medium transition ${
              active
                ? "bg-blue/20 text-heading"
                : "text-text/70 hover:bg-blue/10"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-blue ${
                active ? "bg-blue/25" : "bg-blue/15"
              }`}
            >
              {item.icon}
            </span>
            {labels[item.key]}
            {item.href === "/therapist/requests" && pendingCount > 0 && (
              <span className="ml-auto rounded-full bg-blue px-2 py-0.5 font-body text-[11px] font-bold text-background">
                {pendingCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function BellLink({ count, onClick }: { count: number; onClick?: () => void }) {
  return (
    <Link
      href="/therapist/notifications"
      onClick={onClick}
      aria-label="Notifications"
      className="relative flex h-8 w-8 items-center justify-center rounded-full text-text/60 transition hover:bg-blue/10 hover:text-blue"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="18"
        height="18"
      >
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue px-1 font-body text-[10px] font-bold text-background">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}

function ProfileLink({
  userName,
  userEmail,
  avatarUrl,
  onNavigate,
}: {
  userName: string;
  userEmail: string;
  avatarUrl?: string | null;
  onNavigate?: () => void;
}) {
  const initial = userName.trim().charAt(0).toUpperCase() || "?";

  return (
    <Link
      href="/therapist/profile"
      onClick={onNavigate}
      className="mt-4 flex items-center gap-3 rounded-xl border border-blue/20 bg-bluesoft px-3 py-3 transition hover:bg-blue/15"
    >
      {avatarUrl ? (
        // Cloudinary-hosted avatar
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt=""
          className="h-9 w-9 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue/25 font-body text-sm font-bold text-heading">
          {initial}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate font-body text-sm font-semibold text-text">
          {userName}
        </p>
        {userEmail && (
          <p className="truncate font-body text-xs text-text/50">{userEmail}</p>
        )}
      </div>
    </Link>
  );
}

export default function TherapistSidebar({
  userName = "",
  userEmail = "",
  pendingCount = 0,
  notificationCount = 0,
  avatarUrl,
  labels,
}: {
  userName?: string;
  userEmail?: string;
  pendingCount?: number;
  notificationCount?: number;
  avatarUrl?: string | null;
  labels: TherapistSidebarLabels;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // controls the slide transition

  function isActive(href: string) {
    if (href === "/therapist") return pathname === "/therapist";
    return pathname === href || pathname?.startsWith(`${href}/`);
  }

  function openMenu() {
    setOpen(true);
    requestAnimationFrame(() => setMounted(true));
  }

  function closeMenu() {
    setMounted(false);
    setTimeout(() => setOpen(false), 300); // matches transition duration below
  }

  useEffect(() => {
    return () => setMounted(false);
  }, []);

  return (
    <>
      {/* Mobile: menu + notifications buttons */}
      <div className="fixed left-4 top-4 z-30 flex items-center gap-2 lg:hidden">
        <button
          aria-label="Open menu"
          onClick={openMenu}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-background text-lg shadow-sm transition hover:scale-105"
        >
          ☰
        </button>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-background shadow-sm">
          <BellLink count={notificationCount} />
        </div>
      </div>

      {/* Desktop: persistent sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-blue/20 bg-background p-6 lg:flex">
        <div className="mb-8 flex items-start justify-between px-1">
          <Link href="/therapist">
            <span className="font-logo text-2xl text-heading">Calmly</span>
            <span className="mt-0.5 block font-body text-[11px] font-semibold uppercase tracking-widest text-blue">
              {labels.workspace}
            </span>
          </Link>
          <BellLink count={notificationCount} />
        </div>

        <NavLinks labels={labels} pendingCount={pendingCount} isActive={isActive} />
        <ProfileLink
          userName={userName}
          userEmail={userEmail}
          avatarUrl={avatarUrl}
        />
      </aside>

      {/* Mobile: drawer */}
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
            <div className="flex h-full flex-col rounded-[2rem] border border-blue/25 bg-background/95 p-6 shadow-xl backdrop-blur-xl">
              <div className="mb-8 flex items-center justify-between px-1">
                <span className="font-logo text-2xl text-heading">Calmly</span>
                <div className="flex items-center gap-1">
                  <BellLink count={notificationCount} onClick={closeMenu} />
                  <button
                    aria-label="Close menu"
                    onClick={closeMenu}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-text/50 transition hover:bg-blue/10"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <NavLinks
                labels={labels}
                pendingCount={pendingCount}
                onNavigate={closeMenu}
                isActive={isActive}
              />
              <ProfileLink
                userName={userName}
                userEmail={userEmail}
                avatarUrl={avatarUrl}
                onNavigate={closeMenu}
              />
            </div>
          </aside>
        </>
      )}
    </>
  );
}
