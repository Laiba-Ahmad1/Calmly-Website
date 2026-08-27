# Calmly (web)

Next.js port of Calmly. Structure mirrors the patient/therapist loop:

- (auth) — login/signup
- (patient) — onboarding, home, journal, exercises, plant, quiz, tasks
- (therapist) — dashboard, patients, patient profile, AI report
- api — route handlers, split by domain
- lib — db, auth, ai (Qwen wrapper + prompts), sentiment (local scoring)

Most files are intentionally empty stubs — fill in as we build.
