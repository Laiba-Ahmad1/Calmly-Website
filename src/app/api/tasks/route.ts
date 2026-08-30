// GET /api/tasks — the logged-in patient's active therapist-assigned todos
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPatientTasks } from "@/lib/tasks";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "patient") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { active } = await getPatientTasks(user._id.toString());

  return NextResponse.json({
    tasks: active.map((t: any) => ({
      id: t._id.toString(),
      text: t.text,
      assignedAt: t.assignedAt,
    })),
  });
}
