// scripts/seedDemo.ts
// Idempotent demo data seeder. Creates 2 therapists, 3 patients, ~1 month
// of journals (with variation + gaps for chart testing), quiz results,
// exercise sessions, tasks, advice, feedback, and triggers the real
// generatePatientReport pipeline for all completed weeks.
//
// Run:   npm run seed:demo
// Safe to re-run: deletes only demo-owned records, never touches other data.
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import Users from "@/models/User";
import PatientProfile from "@/models/PatientProfile";
import TherapistProfile from "@/models/TherapistProfile";
import Journal from "@/models/Journal";
import PatientTask from "@/models/PatientTask";
import QuizResult from "@/models/QuizResult";
import ExerciseSession from "@/models/ExerciseSession";
import TherapistPatient from "@/models/TherapistPatient";
import TherapistAdvice from "@/models/TherapistAdvice";
import TherapistFeedback from "@/models/TherapistFeedback";
import PatientAIReport from "@/models/PatientAIReport";
import Notification from "@/models/Notification";
import QuizQuestion from "@/models/QuizQuestion";
import { getWeekWindow, getCurrentWeekNumber } from "@/lib/quiz/weeks";
import { generatePatientReport } from "@/lib/ai/generatePatientReport";

const DEMO_PASSWORD = "demo123";
const DAYS_BACK = 35;
const TARGET_WEEK = 5;
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DemoTherapist {
  name: string;
  email: string;
  gender: "Male" | "Female";
  bio: string;
  language: "en" | "ur";
}

interface DemoPatient {
  name: string;
  email: string;
  gender: "Male" | "Female";
  anxietyType: "social" | "health" | "panic attacks" | "general";
  language: "en" | "ur";
  age: number;
}

const THERAPISTS: DemoTherapist[] = [
  {
    name: "Dr. Sarah Mitchell",
    email: "demo-therapist-sarah@calmly.dev",
    gender: "Female",
    bio: "Experienced therapist specialising in social and general anxiety.",
    language: "en",
  },
  {
    name: "Dr. Ahmed Raza",
    email: "demo-therapist-ahmed@calmly.dev",
    gender: "Male",
    bio: "Urdu-speaking therapist with a focus on health anxiety and panic management.",
    language: "ur",
  },
];

const PATIENTS: DemoPatient[] = [
  {
    name: "Ayesha Khan",
    email: "demo-patient-ayesha@calmly.dev",
    gender: "Female",
    anxietyType: "social",
    language: "en",
    age: 24,
  },
  {
    name: "Bilal Hussain",
    email: "demo-patient-bilal@calmly.dev",
    gender: "Male",
    anxietyType: "general",
    language: "en",
    age: 30,
  },
  {
    name: "Clara Doe",
    email: "demo-patient-clara@calmly.dev",
    gender: "Female",
    anxietyType: "health",
    language: "en",
    age: 27,
  },
];

// Assignments: which therapist is linked to which patient
// Sarah → Ayesha + Bilal; Ahmed → Clara
// (A different therapist viewing Ayesha's report should be denied.)
const ASSIGNMENTS: Record<string, string> = {
  "demo-patient-ayesha@calmly.dev": "demo-therapist-sarah@calmly.dev",
  "demo-patient-bilal@calmly.dev": "demo-therapist-sarah@calmly.dev",
  "demo-patient-clara@calmly.dev": "demo-therapist-ahmed@calmly.dev",
};

// ---- Helpers ----

function localMidnight(ref: Date, dayOffset: number): Date {
  const d = new Date(
    ref.getFullYear(),
    ref.getMonth(),
    ref.getDate() + dayOffset
  );
  d.setHours(0, 0, 0, 0);
  return d;
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

// ---- Journal text templates ----

const FEELINGS_BY_MOOD: Record<number, string[]> = {
  1: [
    "Really down today. Couldn't bring myself to do much.",
    "Felt hopeless and heavy all day.",
    "Struggled to get out of bed. Everything felt overwhelming.",
  ],
  2: [
    "Low energy. Kept to myself most of the day.",
    "Not great. Felt anxious about the smallest things.",
    "A difficult day. My mind wouldn't stop racing.",
  ],
  3: [
    "An okay day, nothing special.",
    "Average. Got through my tasks but didn't enjoy them much.",
    "Some ups and downs but mostly flat.",
  ],
  4: [
    "Pretty good day. Felt productive and calm.",
    "Had a nice rhythm today. Enjoyed the afternoon.",
    "Accomplished a few things and felt satisfied.",
  ],
  5: [
    "Great day! Felt energised and optimistic.",
    "Really happy today. Connected with friends and felt present.",
    "One of my best days in a while. Everything felt light.",
  ],
};

const REFLECTIONS = [
  "I think I need to work on my sleep schedule.",
  "The breathing exercise helped this afternoon.",
  "I should talk to my therapist about this pattern.",
  "Spending time outside made a real difference.",
  "I noticed my mood dipped after skipping lunch.",
  "Journaling is starting to feel like a useful habit.",
  "I want to try the garden exercise this week.",
  "Avoiding caffeine after noon seemed to help.",
  "A friend checked in on me and that lifted my spirits.",
  "I kept putting things off — something to work on.",
  "The sound exercise before bed really helped me wind down.",
  "I felt more focused after a morning walk.",
];

const TODO_POOL = [
  "Go for a 15-minute walk",
  "Call a friend",
  "Try a breathing exercise",
  "Read for 20 minutes",
  "Tidy my workspace",
  "Cook a healthy meal",
  "Do the memory match exercise",
  "Write down three things I'm grateful for",
  "Limit screen time before bed",
  "Stretch for 10 minutes",
];

function generateJournalText(mood: number, sleep: number, seed: number) {
  const feelings = pick(FEELINGS_BY_MOOD[mood] ?? FEELINGS_BY_MOOD[3], seed);
  const reflection = pick(REFLECTIONS, seed * 7 + 3);
  const todos = [
    { text: pick(TODO_POOL, seed * 3 + 1), done: seed % 2 === 0 },
    { text: pick(TODO_POOL, seed * 5 + 2), done: seed % 3 === 0 },
  ];
  return { feelings, reflection, todos };
}

// ---- Target week 5 journal data (variation + gaps) ----
// dayIndex 0..6 within the target week.

interface DayData {
  mood: number | null; // null = no journal entry
  sleep: number | null;
  feelings?: string;
  reflection?: string;
}

const TARGET_WEEK_DATA: Record<string, DayData[]> = {
  // Ayesha: clear within-week variation (bad start → great end)
  "demo-patient-ayesha@calmly.dev": [
    {
      mood: 2,
      sleep: 2,
      feelings:
        "Woke up feeling really anxious about the day ahead. Spent most of the morning overthinking a conversation from yesterday.",
      reflection:
        "I notice my anxiety tends to spike at the start of the week. Maybe I should plan something calming for Monday mornings.",
    },
    {
      mood: 3,
      sleep: 2,
      feelings:
        "A bit better than yesterday but still tired. Sleep was rough again.",
      reflection:
        "My sleep is dragging my mood down. I need to try going to bed earlier.",
    },
    {
      mood: 2,
      sleep: 3,
      feelings:
        "Felt low today but at least I slept a bit better last night.",
      reflection:
        "The breathing exercise helped take the edge off for a little while.",
    },
    {
      mood: 4,
      sleep: 3,
      feelings:
        "Turned a corner today. Had a productive afternoon and actually enjoyed my lunch break.",
      reflection:
        "Getting outside for a walk made a noticeable difference in how I felt.",
    },
    {
      mood: 4,
      sleep: 4,
      feelings:
        "Good day overall. Managed a social situation without spiralling.",
      reflection:
        "I'm seeing that exercise and sleep together make a big impact on my mood.",
    },
    {
      mood: 5,
      sleep: 4,
      feelings:
        "One of my best days this month. Felt confident, connected, and present.",
      reflection:
        "I want to remember what today felt like. The journal is helping me see patterns.",
    },
    {
      mood: 4,
      sleep: 5,
      feelings:
        "Rested and calm. Took it easy and that was exactly what I needed.",
      reflection:
        "Ending the week on a good note. Looking forward to keeping this momentum.",
    },
  ],
  // Bilal: gaps on dayIndex 2 and 5 (tests chart gap handling)
  "demo-patient-bilal@calmly.dev": [
    {
      mood: 3,
      sleep: 3,
      feelings: "An average day. Nothing stood out.",
      reflection: "I went through the motions but didn't feel much either way.",
    },
    {
      mood: 4,
      sleep: 3,
      feelings: "Productive morning. Got through my to-do list.",
      reflection: "Starting the day with a plan seems to help.",
    },
    { mood: null, sleep: null }, // gap — no journal entry
    {
      mood: 2,
      sleep: 2,
      feelings: "Tough day. Couldn't focus and felt restless.",
      reflection:
        "I think the gap in journaling made it harder to stay self-aware.",
    },
    {
      mood: 3,
      sleep: 4,
      feelings: "Bouncing back a bit. Sleep was much better last night.",
      reflection: "Sleep really does set the tone for everything else.",
    },
    { mood: null, sleep: null }, // gap — no journal entry
    {
      mood: 4,
      sleep: 4,
      feelings: "Ended the week on a decent note.",
      reflection:
        "I want to be more consistent with journaling next week. The gaps make it hard to see the full picture.",
    },
  ],
  // Clara: steady upward improvement across the week
  "demo-patient-clara@calmly.dev": [
    {
      mood: 2,
      sleep: 2,
      feelings: "Started the week feeling anxious and tense.",
      reflection:
        "I noticed I was clenching my jaw all day. Need to work on physical relaxation.",
    },
    {
      mood: 2,
      sleep: 3,
      feelings: "Still low but slept a bit better.",
      reflection: "Trying the sound exercise tonight — hoping it helps.",
    },
    {
      mood: 3,
      sleep: 3,
      feelings: "A slight improvement. Managed to focus on work for a few hours.",
      reflection: "Small wins count too. I did the breathing exercise twice today.",
    },
    {
      mood: 3,
      sleep: 4,
      feelings: "Steady. Nothing dramatic but I felt more in control.",
      reflection:
        "The routine is starting to pay off even if it doesn't feel exciting.",
    },
    {
      mood: 4,
      sleep: 4,
      feelings: "Genuinely good day. Had energy and felt positive.",
      reflection:
        "I can see the journal entries trending upward. That's encouraging.",
    },
    {
      mood: 4,
      sleep: 4,
      feelings: "Another solid day. Met a friend for coffee and enjoyed it.",
      reflection: "Socialising felt easy today — a big change from last week.",
    },
    {
      mood: 5,
      sleep: 5,
      feelings: "Finished the week feeling great. Slept well, felt calm and happy.",
      reflection:
        "This is the best I've felt in weeks. The combination of exercises and journaling is working.",
    },
  ],
};

// ---- Procedural journal generation for non-target weeks ----

function generateWeekJournals(
  weekNum: number,
  patientEmail: string,
  refDate: Date,
  weekStartOffset: number
): {
  dayIndex: number;
  mood: number;
  sleep: number;
  feelings: string;
  reflection: string;
  todos: { text: string; done: boolean }[];
}[] {
  const entries: ReturnType<typeof generateWeekJournals> = [];
  const baseSeed = weekNum * 100 + patientEmail.length;

  // Different patterns per patient to make data interesting
  for (let d = 0; d < 7; d++) {
    let mood: number;
    let sleep: number;

    if (patientEmail.includes("ayesha")) {
      // Ayesha: volatile — oscillates between 2 and 5
      mood = 2 + ((baseSeed + d * 3) % 4); // 2,3,4,5 rotating
      sleep = 2 + ((baseSeed + d * 2 + 1) % 4);
    } else if (patientEmail.includes("bilal")) {
      // Bilal: sparse — skip some days (2 out of 7)
      if (d === 2 || d === 5) continue;
      mood = 3 + ((baseSeed + d) % 2); // 3 or 4
      sleep = 2 + ((baseSeed + d + 2) % 3); // 2,3,4
    } else {
      // Clara: gradual improvement week over week
      const weekBonus = Math.min(weekNum - 1, 2);
      mood = Math.min(5, 2 + weekBonus + ((baseSeed + d) % 2));
      sleep = Math.min(5, 2 + weekBonus + ((baseSeed + d + 1) % 2));
    }

    const seed = baseSeed + d;
    const text = generateJournalText(mood, sleep, seed);
    entries.push({
      dayIndex: d,
      mood,
      sleep,
      ...text,
    });
  }

  return entries;
}

// ---- Main seed logic ----

async function main() {
  await db();
  console.log("MongoDB connected");

  const now = new Date();
  const creationDate = localMidnight(now, -DAYS_BACK);

  // --- Step 1: find or create users ---
  console.log("\n--- Creating demo accounts ---");
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const userMap = new Map<string, mongoose.Types.ObjectId>();

  // Therapists
  for (const t of THERAPISTS) {
    let user = await Users.findOne({ email: t.email });
    if (!user) {
      user = await Users.create({
        name: t.name,
        email: t.email,
        passwordHash,
        role: "therapist",
        gender: t.gender,
        emailVerified: true,
        createdAt: creationDate,
      });
      console.log(`  Created therapist: ${t.email}`);
    } else {
      console.log(`  Therapist exists: ${t.email}`);
    }
    // Backdate createdAt via native driver to bypass Mongoose timestamps
    await Users.collection.updateOne(
      { _id: user._id },
      { $set: { createdAt: creationDate } }
    );
    userMap.set(t.email, user._id as mongoose.Types.ObjectId);
  }

  // Patients
  for (const p of PATIENTS) {
    let user = await Users.findOne({ email: p.email });
    if (!user) {
      user = await Users.create({
        name: p.name,
        email: p.email,
        passwordHash,
        role: "patient",
        gender: p.gender,
        emailVerified: true,
        createdAt: creationDate,
      });
      console.log(`  Created patient: ${p.email}`);
    } else {
      console.log(`  Patient exists: ${p.email}`);
    }
    await Users.collection.updateOne(
      { _id: user._id },
      { $set: { createdAt: creationDate } }
    );
    userMap.set(p.email, user._id as mongoose.Types.ObjectId);
  }

  // --- Step 2: clean up previous demo data ---
  console.log("\n--- Cleaning up previous demo data ---");
  const allDemoUserIds = Array.from(userMap.values());
  const demoPatientIds = PATIENTS.map(
    (p) => userMap.get(p.email)!
  );
  const demoTherapistIds = THERAPISTS.map(
    (t) => userMap.get(t.email)!
  );

  await Promise.all([
    PatientProfile.deleteMany({ userId: { $in: allDemoUserIds } }),
    TherapistProfile.deleteMany({ userId: { $in: allDemoUserIds } }),
    Journal.deleteMany({ patientId: { $in: demoPatientIds } }),
    PatientTask.deleteMany({
      $or: [
        { patientId: { $in: demoPatientIds } },
        { therapistId: { $in: demoTherapistIds } },
      ],
    }),
    QuizResult.deleteMany({ userId: { $in: demoPatientIds } }),
    ExerciseSession.deleteMany({ userId: { $in: demoPatientIds } }),
    TherapistPatient.deleteMany({
      $or: [
        { patientId: { $in: demoPatientIds } },
        { therapistId: { $in: demoTherapistIds } },
      ],
    }),
    TherapistAdvice.deleteMany({
      $or: [
        { patientId: { $in: demoPatientIds } },
        { therapistId: { $in: demoTherapistIds } },
      ],
    }),
    TherapistFeedback.deleteMany({
      $or: [
        { patientId: { $in: demoPatientIds } },
        { therapistId: { $in: demoTherapistIds } },
      ],
    }),
    PatientAIReport.deleteMany({ userId: { $in: demoPatientIds } }),
    Notification.deleteMany({ recipientId: { $in: allDemoUserIds } }),
  ]);
  console.log("  Previous demo data cleared.");

  // --- Step 3: profiles ---
  console.log("\n--- Creating profiles ---");

  for (const t of THERAPISTS) {
    const userId = userMap.get(t.email)!;
    await TherapistProfile.create({
      userId,
      documentUrl: "/demo/cert-placeholder.pdf",
      documentName: `${t.name} Certification`,
      verificationStatus: "approved",
      bio: t.bio,
      language: t.language,
      submittedAt: creationDate,
      reviewedAt: new Date(creationDate.getTime() + 86_400_000),
    });
    console.log(`  TherapistProfile: ${t.name}`);
  }

  for (const p of PATIENTS) {
    const userId = userMap.get(p.email)!;
    await PatientProfile.create({
      userId,
      anxietyType: p.anxietyType,
      age: p.age,
      language: p.language,
      plant: { growth: 15, level: 2 },
    });
    console.log(`  PatientProfile: ${p.name} (${p.anxietyType})`);
  }

  // --- Step 4: therapist-patient links ---
  console.log("\n--- Creating therapist-patient links ---");
  for (const p of PATIENTS) {
    const therapistEmail = ASSIGNMENTS[p.email];
    const patientId = userMap.get(p.email)!;
    const therapistId = userMap.get(therapistEmail)!;
    await TherapistPatient.create({
      therapistId,
      patientId,
      status: "active",
      requestedAt: creationDate,
      respondedAt: new Date(creationDate.getTime() + 86_400_000),
      assignedAt: new Date(creationDate.getTime() + 86_400_000),
    });
    console.log(
      `  ${p.name} → ${THERAPISTS.find((t) => t.email === therapistEmail)!.name}`
    );
  }

  // --- Step 5: journals (all 5 weeks) ---
  console.log("\n--- Seeding journals ---");
  const currentWeek = getCurrentWeekNumber(creationDate, now);
  const targetWeek = currentWeek - 1;
  console.log(
    `  Account created ${DAYS_BACK} days ago, currentWeek=${currentWeek}, targeting week ${targetWeek}`
  );

  for (const p of PATIENTS) {
    const patientId = userMap.get(p.email)!;
    const journals: Record<string, unknown>[] = [];

    for (let w = 1; w <= targetWeek; w++) {
      const { weekStart } = getWeekWindow(creationDate, w);

      if (w === targetWeek) {
        // Use hand-crafted target-week data
        const weekData = TARGET_WEEK_DATA[p.email];
        for (let d = 0; d < 7; d++) {
          const day = weekData[d];
          if (day.mood === null) continue; // gap day
          const date = localMidnight(weekStart, d);
          journals.push({
            patientId,
            date,
            mood: day.mood,
            sleepQuality: day.sleep,
            feelings: day.feelings ?? "",
            reflection: day.reflection ?? "",
            todos: [],
          });
        }
      } else {
        // Procedural data for earlier weeks
        const weekEntries = generateWeekJournals(
          w,
          p.email,
          creationDate,
          (w - 1) * 7
        );
        for (const entry of weekEntries) {
          const date = localMidnight(weekStart, entry.dayIndex);
          journals.push({
            patientId,
            date,
            mood: entry.mood,
            sleepQuality: entry.sleep,
            feelings: entry.feelings,
            reflection: entry.reflection,
            todos: entry.todos,
          });
        }
      }
    }

    if (journals.length > 0) {
      await Journal.insertMany(journals);
      console.log(`  ${p.name}: ${journals.length} journal entries across ${targetWeek} weeks`);
    }
  }

  // --- Step 6: quiz results ---
  console.log("\n--- Seeding quiz results ---");
  const allQuestions = await QuizQuestion.find({ active: true }).lean();
  console.log(`  Found ${allQuestions.length} quiz questions in database`);

  if (allQuestions.length > 0) {
    for (const p of PATIENTS) {
      const userId = userMap.get(p.email)!;
      const matchingQuestions = allQuestions.filter(
        (q) => q.anxietyType === p.anxietyType
      );
      const fallbackQuestions =
        matchingQuestions.length >= 5
          ? matchingQuestions
          : allQuestions.slice(0, 10);

      for (let w = 1; w <= targetWeek; w++) {
        // Bilal skips some quiz weeks
        if (p.email.includes("bilal") && (w === 2 || w === 4)) continue;

        const { weekStart, weekEnd } = getWeekWindow(creationDate, w);
        const numQ = Math.min(fallbackQuestions.length, 10);
        const selected = fallbackQuestions.slice(0, numQ);

        const responses = selected.map((q) => {
          const optionIndex = Math.floor(
            Math.random() * (q.options?.length ?? 1)
          );
          const option = q.options?.[optionIndex] ?? q.options?.[0];
          return {
            questionId: q._id,
            questionText: q.question,
            selectedOption: option?.text ?? "N/A",
            score: option?.score ?? 0,
            anxietyType: q.anxietyType,
            dimension: q.dimension,
          };
        });

        const totalScore = responses.reduce((sum, r) => sum + r.score, 0);
        const maxScore = numQ * 4;

        const dimMap: Record<string, number> = {};
        for (const r of responses) {
          dimMap[r.dimension] = (dimMap[r.dimension] ?? 0) + r.score;
        }

        await QuizResult.create({
          userId,
          anxietyType: p.anxietyType,
          weekStart,
          weekEnd,
          responses,
          dimensionScores: dimMap,
          totalScore,
          maxScore,
          completedAt: new Date(weekStart.getTime() + 3 * 86_400_000),
        });
      }
      console.log(
        `  ${p.name}: quiz results for ${targetWeek - (p.email.includes("bilal") ? 2 : 0)} weeks`
      );
    }
  } else {
    console.log("  ⚠ No quiz questions found. Run `npm run seed:questions` first.");
  }

  // --- Step 7: exercise sessions ---
  console.log("\n--- Seeding exercise sessions ---");
  const exerciseTypes = [
    "breathing",
    "sound",
    "memory_match",
    "garden",
  ] as const;

  for (const p of PATIENTS) {
    const userId = userMap.get(p.email)!;
    const sessions: Record<string, unknown>[] = [];

    for (let w = 1; w <= targetWeek; w++) {
      const { weekStart } = getWeekWindow(creationDate, w);
      // 2–4 sessions per week
      const numSessions = 2 + ((w + p.email.length) % 3);
      for (let s = 0; s < numSessions; s++) {
        const type = exerciseTypes[(w + s) % exerciseTypes.length];
        const completedAt = new Date(
          weekStart.getTime() + (s + 1) * 86_400_000 + 3600_000
        );
        sessions.push({
          userId,
          type,
          durationSeconds: 120 + ((w * 30 + s * 45) % 300),
          completed: true,
          growthAwarded: 5,
          stats: {},
          completedAt,
        });
      }
    }

    if (sessions.length > 0) {
      await ExerciseSession.insertMany(sessions);
      console.log(`  ${p.name}: ${sessions.length} exercise sessions`);
    }
  }

  // --- Step 8: therapist-assigned tasks ---
  console.log("\n--- Seeding therapist tasks ---");
  const taskTexts = [
    "Practice the 4-7-8 breathing technique each morning",
    "Write down three positive things before bed",
    "Take a 20-minute walk at least 4 times this week",
    "Try the garden exercise when feeling overwhelmed",
    "Limit caffeine after 2pm",
  ];

  for (const p of PATIENTS) {
    const therapistEmail = ASSIGNMENTS[p.email];
    const patientId = userMap.get(p.email)!;
    const therapistId = userMap.get(therapistEmail)!;
    const { weekStart: twStart, weekEnd: twEnd } = getWeekWindow(
      creationDate,
      targetWeek
    );

    // Two tasks: one completed, one not
    await PatientTask.create({
      patientId,
      therapistId,
      text: taskTexts[targetWeek % taskTexts.length],
      status: "completed",
      assignedAt: new Date(twStart.getTime() - 86_400_000),
      completedAt: new Date(twStart.getTime() + 3 * 86_400_000),
    });
    await PatientTask.create({
      patientId,
      therapistId,
      text: taskTexts[(targetWeek + 1) % taskTexts.length],
      status: "active",
      assignedAt: twStart,
    });
    console.log(`  ${p.name}: 2 tasks (1 completed, 1 active)`);
  }

  // --- Step 9: therapist advice ---
  console.log("\n--- Seeding therapist advice ---");
  const adviceTexts = [
    {
      text: "Try to establish a consistent bedtime routine — even small changes in sleep hygiene can have a big impact on daily mood.",
      module: "journal" as const,
    },
    {
      text: "The breathing exercises are clearly helping. Let's increase to twice daily this week and see how it feels.",
      module: "breathing" as const,
    },
    {
      text: "I noticed you haven't tried the sound therapy exercise yet. It might be a good complement to your current routine.",
      module: "sound" as const,
    },
  ];

  for (const p of PATIENTS) {
    const therapistEmail = ASSIGNMENTS[p.email];
    const patientId = userMap.get(p.email)!;
    const therapistId = userMap.get(therapistEmail)!;

    for (const advice of adviceTexts) {
      await TherapistAdvice.create({
        patientId,
        therapistId,
        text: advice.text,
        relatedModule: advice.module,
        active: true,
      });
    }
    console.log(`  ${p.name}: ${adviceTexts.length} advice entries`);
  }

  // --- Step 10: therapist feedback (for earlier weeks) ---
  console.log("\n--- Seeding therapist feedback ---");
  for (const p of PATIENTS) {
    const therapistEmail = ASSIGNMENTS[p.email];
    const patientId = userMap.get(p.email)!;
    const therapistId = userMap.get(therapistEmail)!;

    for (let w = 1; w < targetWeek; w++) {
      const { weekStart, weekEnd } = getWeekWindow(creationDate, w);
      await TherapistFeedback.create({
        patientId,
        therapistId,
        weekNumber: w,
        weekStart,
        weekEnd,
        overallObservation: `${p.name} showed ${w <= 2 ? "some initial challenges" : "gradual improvement"} during week ${w}. Journal entries were ${w === 1 ? "sparse" : "more consistent"}.`,
        progressAndStrength: `Key strength: ${w % 2 === 0 ? "willingness to try new exercises" : "honest self-reflection in journal entries"}.`,
        areasToFocusOn: `Focus on ${w % 2 === 0 ? "sleep consistency" : "managing mid-week anxiety dips"} in the coming week.`,
        feedbackAndGuidance: `Continue with the current exercise routine. Consider adding a short breathing session before bed.`,
      });
    }
    console.log(
      `  ${p.name}: ${targetWeek - 1} feedback entries`
    );
  }

  // --- Step 11: trigger real report generation ---
  console.log("\n--- Generating AI reports (real pipeline) ---");
  console.log(
    "  This calls the real AI API. If your AI keys aren't configured, reports will be skipped."
  );

  for (const p of PATIENTS) {
    const userId = userMap.get(p.email)!;
    let successCount = 0;
    let failCount = 0;

    for (let w = 2; w <= targetWeek; w++) {
      try {
        // Temporarily override "now" for the report generator by adjusting
        // createdAt so getCurrentWeekNumber returns w+1. We can't easily mock
        // the generator's internal call, so we generate only the target week
        // (the one with interesting data) and the week before it (for trend).
        // For earlier weeks the AI call cost/latency isn't justified.
        if (w < targetWeek - 1) continue;

        const result = await generatePatientReport(userId.toString());
        if (result) {
          successCount++;
          console.log(
            `  ${p.name} week ${w}: report generated (${result._id})`
          );
        } else {
          failCount++;
          console.log(`  ${p.name} week ${w}: no report (generator returned null)`);
        }
      } catch (err) {
        failCount++;
        const msg = err instanceof Error ? err.message : String(err);
        console.log(`  ${p.name} week ${w}: error — ${msg.slice(0, 120)}`);
      }
    }

    if (failCount > 0 && successCount === 0) {
      console.log(
        `  ⚠ ${p.name}: all report generations failed. Check your AI API keys in .env`
      );
    }
  }

  // --- Summary ---
  console.log("\n═══════════════════════════════════════════");
  console.log("  Demo seed complete!");
  console.log("═══════════════════════════════════════════");
  console.log("\nTherapist logins (password: demo123):");
  for (const t of THERAPISTS) {
    console.log(`  ${t.email}`);
  }
  console.log("\nPatient logins (password: demo123):");
  for (const p of PATIENTS) {
    console.log(`  ${p.email}`);
  }
  console.log(
    "\nBest patient for chart demo: Ayesha Khan (clear mood/sleep variation in target week)"
  );
  console.log(
    "Best patient for gap testing: Bilal Hussain (2 journal gaps in target week)"
  );
  console.log(
    "Auth test: log in as Dr. Ahmed → should NOT see Ayesha/Bilal reports (they belong to Dr. Sarah)"
  );
  console.log("");
}

main()
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => {
    mongoose.disconnect().catch(() => {});
  });
