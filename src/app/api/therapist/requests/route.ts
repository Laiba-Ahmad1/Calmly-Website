// GET  /api/therapist/requests — incoming pending patient requests
// POST /api/therapist/requests — accept or reject a request
import { NextResponse } from "next/server";
import { requireTherapist } from "@/lib/therapist/guard";
import { getPendingRequests, respondToRequest } from "@/lib/therapist/requests";

export async function GET() {
  const therapist = await requireTherapist();
  if (!therapist) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requests = await getPendingRequests(therapist._id.toString());
  return NextResponse.json({ requests });
}

export async function POST(req: Request) {
  const therapist = await requireTherapist();
  if (!therapist) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { requestId?: string; decision?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { requestId, decision } = body;
  if (!requestId || (decision !== "accept" && decision !== "reject")) {
    return NextResponse.json(
      { error: "requestId and decision ('accept' | 'reject') are required" },
      { status: 400 }
    );
  }

  const result = await respondToRequest(
    therapist._id.toString(),
    requestId,
    decision
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true });
}
