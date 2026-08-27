// GET /api/therapist/patients/[id] — full profile: journals, exercises, quizzes, tasks
// Must verify therapist is actually assigned to this patient before returning data.
export async function GET(req: Request, { params }: { params: { id: string } }) {
  return new Response(null); // TODO
}
