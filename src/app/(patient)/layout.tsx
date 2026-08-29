// src/app/(patient)/layout.tsx
import Sidebar from "@/components/patient/Sidebar";
import { getCurrentUser } from "@/lib/auth";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  // adjust field names below if your User schema calls them something else
  const userName = (user as any)?.name ?? "there";
  const userEmail = (user as any)?.email ?? "";

  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-white/10" />

      <Sidebar userName={userName} userEmail={userEmail} />

      {/* pt-20 clears the fixed menu button in the top-left corner */}
      <main className="relative p-4 pt-20 sm:p-8">{children}</main>
    </div>
  );
}
