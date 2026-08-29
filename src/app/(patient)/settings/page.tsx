// src/app/(patient)/settings/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import SettingsForm from "@/components/patient/SettingsForm";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="relative mx-auto max-w-2xl">
      <h1 className="mb-6 font-heading text-3xl font-bold text-heading">Settings</h1>
      <SettingsForm />
    </div>
  );
}