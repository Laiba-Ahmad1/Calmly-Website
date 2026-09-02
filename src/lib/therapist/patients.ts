// // src/lib/therapist/patients.ts
// import db from "@/lib/db";
// import Users from "@/models/User";
// import Journal from "@/models/Journal";
// import QuizResult from "@/models/QuizResult";
// import ExerciseSession from "@/models/ExerciseSession";
// import PatientAIReport from "@/models/PatientAIReport";
// import PatientProfile from "@/models/PatientProfile";
// import PatientTask from "@/models/PatientTask";
// import TherapistPatient from "@/models/TherapistPatient";
// import { getAssignedPatient } from "@/lib/therapist/getAssignedPatient";
// import { getCurrentWeekNumber, getWeekWindow } from "@/lib/quiz/weeks";
// import type { AnxietyType } from "@/lib/anxiety";

// export interface LatestReportSummary {
//   id: string;
//   weekNumber: number;
//   weekStart: Date;
//   weekEnd: Date;
//   weeklyOverview: string;
//   moodTrend: "up" | "down" | "flat" | null;
//   sleepTrend: "up" | "down" | "flat" | null;
//   quizTrend: "up" | "down" | "flat" | null;
//   journalDays: number;
//   quizCompleted: boolean;
//   moodAvg: number | null;
//   sleepAvg: number | null;
// }

// export interface TherapistPatientSummary {
//   patientId: string;
//   name: string;
//   email: string;
//   connectedSince: Date | null;
//   anxietyType: AnxietyType | string | null;
//   plantLevel: number | null;
//   plantGrowth: number | null;
//   lastJournalDate: Date | null;
//   latestReport: LatestReportSummary | null;
// }

// function toReportSummary(report: any): LatestReportSummary {
//   return {
//     id: report._id.toString(),
//     weekNumber: report.weekNumber,
//     weekStart: report.weekStart,
//     weekEnd: report.weekEnd,
//     weeklyOverview: report.weeklyOverview,
//     moodTrend: report.stats?.moodTrend ?? null,
//     sleepTrend: report.stats?.sleepTrend ?? null,
//     quizTrend: report.stats?.quizTrend ?? null,
//     journalDays: report.stats?.journalDays ?? 0,
//     quizCompleted: report.stats?.quizCompleted ?? false,
//     moodAvg: report.stats?.moodAvg ?? null,
//     sleepAvg: report.stats?.sleepAvg ?? null,
//   };
// }

// // All patients connected to this therapist, enriched with the bits the
// // patients list and dashboard need. Uses aggregation to avoid N+1 queries.
// export async function getTherapistPatients(
//   therapistId: string
// ): Promise<TherapistPatientSummary[]> {
//   await db();

//   const assignments = await TherapistPatient.find({ therapistId, status: "active" })
//     .sort({ assignedAt: -1 })
//     .lean();

//   if (!assignments.length) return [];

//   const patientIds = assignments.map((a: any) => a.patientId);

//   const [users, profiles, lastJournals, latestReports] = await Promise.all([
//     Users.find({ _id: { $in: patientIds } }).select("name email").lean(),
//     PatientProfile.find({ userId: { $in: patientIds } })
//       .select("userId anxietyType plant")
//       .lean(),
//     Journal.aggregate<{ _id: any; lastDate: Date }>([
//       { $match: { patientId: { $in: patientIds } } },
//       { $sort: { date: -1 } },
//       { $group: { _id: "$patientId", lastDate: { $first: "$date" } } },
//     ]),
//     PatientAIReport.aggregate<{ _id: any; report: any }>([
//       { $match: { userId: { $in: patientIds } } },
//       { $sort: { weekStart: -1 } },
//       { $group: { _id: "$userId", report: { $first: "$$ROOT" } } },
//     ]),
//   ]);

//   const usersById = new Map(users.map((u: any) => [u._id.toString(), u]));
//   const profilesById = new Map(profiles.map((p: any) => [p.userId.toString(), p]));
//   const lastJournalByPatient = new Map(lastJournals.map((j) => [j._id.toString(), j.lastDate]));
//   const latestReportByPatient = new Map(latestReports.map((r) => [r._id.toString(), r.report]));

//   return assignments.flatMap((a: any) => {
//     const id = a.patientId.toString();
//     const user = usersById.get(id);
//     if (!user) return [];

//     const profile = profilesById.get(id);
//     const report = latestReportByPatient.get(id);

//     return [
//       {
//         patientId: id,
//         name: user.name,
//         email: user.email,
//         connectedSince: a.assignedAt ?? a.requestedAt ?? null,
//         anxietyType: profile?.anxietyType ?? null,
//         plantLevel: profile?.plant?.level ?? null,
//         plantGrowth: profile?.plant?.growth ?? null,
//         lastJournalDate: lastJournalByPatient.get(id) ?? null,
//         latestReport: report ? toReportSummary(report) : null,
//       },
//     ];
//   });
// }

// export interface PatientOverview {
//   assignment: any;
//   patientUser: { _id: any; name: string; email: string; createdAt: Date };
//   patientProfile: any;
//   weekNumber: number;
//   weekStart: Date;
//   weekEnd: Date;
//   weekly: {
//     journalDays: number;
//     moodAvg: number | null;
//     sleepAvg: number | null;
//     journals: any[];
//   };
//   lastJournalDate: Date | null;
//   quizThisWeek: any | null;
//   latestQuiz: any | null;
//   exerciseCountsThisWeek: Record<string, number>;
//   activeTasks: any[];
//   recentCompletedTasks: any[];
//   latestReport: any | null;
// }

// // Full detail view for ONE connected patient — verifies the relationship
// // server-side before returning anything.
// export async function getPatientOverview(
//   therapistId: string,
//   patientId: string
// ): Promise<PatientOverview | null> {
//   const assigned = await getAssignedPatient(therapistId, patientId);
//   if (!assigned) return null;

//   const { assignment, patientUser, patientProfile } = assigned;

//   const accountCreatedAt = new Date(patientUser.createdAt);
//   const weekNumber = getCurrentWeekNumber(accountCreatedAt);
//   const { weekStart, weekEnd } = getWeekWindow(accountCreatedAt, weekNumber);

//   const [
//     journalsThisWeek,
//     lastJournal,
//     quizThisWeek,
//     latestQuiz,
//     exerciseSessions,
//     activeTasks,
//     recentCompletedTasks,
//     latestReport,
//   ] = await Promise.all([
//     Journal.find({ patientId, date: { $gte: weekStart, $lt: weekEnd } })
//       .sort({ date: -1 })
//       .select("date mood sleepQuality feelings reflection todos")
//       .lean(),
//     Journal.findOne({ patientId }).sort({ date: -1 }).select("date").lean(),
//     QuizResult.findOne({ userId: patientId, weekStart }).lean(),
//     QuizResult.findOne({ userId: patientId }).sort({ weekStart: -1 }).lean(),
//     ExerciseSession.find({ userId: patientId, completedAt: { $gte: weekStart, $lt: weekEnd } })
//       .select("type")
//       .lean(),
//     PatientTask.find({ patientId, status: "active" }).sort({ assignedAt: -1 }).lean(),
//     PatientTask.find({ patientId, status: "completed" })
//       .sort({ completedAt: -1 })
//       .limit(5)
//       .lean(),
//     PatientAIReport.findOne({ userId: patientId }).sort({ weekStart: -1 }).lean(),
//   ]);

//   const journalDays = new Set(
//     journalsThisWeek.map((j: any) => new Date(j.date).toISOString().slice(0, 10))
//   ).size;

//   const moodAvg = journalsThisWeek.length
//     ? Math.round(
//         (journalsThisWeek.reduce((sum: number, j: any) => sum + j.mood, 0) /
//           journalsThisWeek.length) *
//           10
//       ) / 10
//     : null;

//   const sleepAvg = journalsThisWeek.length
//     ? Math.round(
//         (journalsThisWeek.reduce((sum: number, j: any) => sum + j.sleepQuality, 0) /
//           journalsThisWeek.length) *
//           10
//       ) / 10
//     : null;

//   const exerciseCountsThisWeek: Record<string, number> = {};
//   for (const session of exerciseSessions as any[]) {
//     exerciseCountsThisWeek[session.type] =
//       (exerciseCountsThisWeek[session.type] ?? 0) + 1;
//   }

//   return {
//     assignment,
//     patientUser: patientUser as PatientOverview["patientUser"],
//     patientProfile,
//     weekNumber,
//     weekStart,
//     weekEnd,
//     weekly: { journalDays, moodAvg, sleepAvg, journals: journalsThisWeek },
//     lastJournalDate: lastJournal?.date ?? null,
//     quizThisWeek,
//     latestQuiz,
//     exerciseCountsThisWeek,
//     activeTasks,
//     recentCompletedTasks,
//     latestReport,
//   };
// }
// src/lib/therapist/patients.ts
import db from "@/lib/db";
import Users from "@/models/User";
import Journal from "@/models/Journal";
import QuizResult from "@/models/QuizResult";
import ExerciseSession from "@/models/ExerciseSession";
import PatientAIReport from "@/models/PatientAIReport";
import PatientProfile from "@/models/PatientProfile";
import TherapistPatient from "@/models/TherapistPatient";
import { getAssignedPatient } from "@/lib/therapist/getAssignedPatient";
import { getCurrentWeekNumber, getWeekWindow } from "@/lib/quiz/weeks";
import type { AnxietyType } from "@/lib/anxiety";

export interface LatestReportSummary {
  id: string;
  weekNumber: number;
  weekStart: Date;
  weekEnd: Date;
  weeklyOverview: string;
  moodTrend: "up" | "down" | "flat" | null;
  sleepTrend: "up" | "down" | "flat" | null;
  quizTrend: "up" | "down" | "flat" | null;
  journalDays: number;
  quizCompleted: boolean;
  moodAvg: number | null;
  sleepAvg: number | null;
}

export interface TherapistPatientSummary {
  patientId: string;
  name: string;
  email: string;
  connectedSince: Date | null;
  anxietyType: AnxietyType | string | null;
  plantLevel: number | null;
  plantGrowth: number | null;
  lastJournalDate: Date | null;
  latestReport: LatestReportSummary | null;
}

function toReportSummary(report: any): LatestReportSummary {
  return {
    id: report._id.toString(),
    weekNumber: report.weekNumber,
    weekStart: report.weekStart,
    weekEnd: report.weekEnd,
    weeklyOverview: report.weeklyOverview,
    moodTrend: report.stats?.moodTrend ?? null,
    sleepTrend: report.stats?.sleepTrend ?? null,
    quizTrend: report.stats?.quizTrend ?? null,
    journalDays: report.stats?.journalDays ?? 0,
    quizCompleted: report.stats?.quizCompleted ?? false,
    moodAvg: report.stats?.moodAvg ?? null,
    sleepAvg: report.stats?.sleepAvg ?? null,
  };
}

// All patients connected to this therapist, enriched with the bits the
// patients list and dashboard need. Uses aggregation to avoid N+1 queries.
export async function getTherapistPatients(
  therapistId: string
): Promise<TherapistPatientSummary[]> {
  await db();

  const assignments = await TherapistPatient.find({ therapistId, status: "active" })
    .sort({ assignedAt: -1 })
    .lean();

  if (!assignments.length) return [];

  const patientIds = assignments.map((a: any) => a.patientId);

  const [users, profiles, lastJournals, latestReports] = await Promise.all([
    Users.find({ _id: { $in: patientIds } }).select("name email").lean(),
    PatientProfile.find({ userId: { $in: patientIds } })
      .select("userId anxietyType plant")
      .lean(),
    Journal.aggregate<{ _id: any; lastDate: Date }>([
      { $match: { patientId: { $in: patientIds } } },
      { $sort: { date: -1 } },
      { $group: { _id: "$patientId", lastDate: { $first: "$date" } } },
    ]),
    PatientAIReport.aggregate<{ _id: any; report: any }>([
      { $match: { userId: { $in: patientIds } } },
      { $sort: { weekStart: -1 } },
      { $group: { _id: "$userId", report: { $first: "$$ROOT" } } },
    ]),
  ]);

  const usersById = new Map(users.map((u: any) => [u._id.toString(), u]));
  const profilesById = new Map(profiles.map((p: any) => [p.userId.toString(), p]));
  const lastJournalByPatient = new Map(lastJournals.map((j) => [j._id.toString(), j.lastDate]));
  const latestReportByPatient = new Map(latestReports.map((r) => [r._id.toString(), r.report]));

  return assignments.flatMap((a: any) => {
    const id = a.patientId.toString();
    const user = usersById.get(id);
    if (!user) return [];

    const profile = profilesById.get(id);
    const report = latestReportByPatient.get(id);

    return [
      {
        patientId: id,
        name: user.name,
        email: user.email,
        connectedSince: a.assignedAt ?? a.requestedAt ?? null,
        anxietyType: profile?.anxietyType ?? null,
        plantLevel: profile?.plant?.level ?? null,
        plantGrowth: profile?.plant?.growth ?? null,
        lastJournalDate: lastJournalByPatient.get(id) ?? null,
        latestReport: report ? toReportSummary(report) : null,
      },
    ];
  });
}

export interface PatientOverview {
  assignment: any;
  patientUser: { _id: any; name: string; email: string; createdAt: Date };
  patientProfile: any;
  weekNumber: number;
  weekStart: Date;
  weekEnd: Date;
  weekly: {
    journalDays: number;
    moodAvg: number | null;
    sleepAvg: number | null;
    journals: any[];
  };
  lastJournalDate: Date | null;
  quizThisWeek: any | null;
  latestQuiz: any | null;
  exerciseCountsThisWeek: Record<string, number>;
  latestReport: any | null;
}

// Full detail view for ONE connected patient — verifies the relationship
// server-side before returning anything.
export async function getPatientOverview(
  therapistId: string,
  patientId: string
): Promise<PatientOverview | null> {
  const assigned = await getAssignedPatient(therapistId, patientId);
  if (!assigned) return null;

  const { assignment, patientUser, patientProfile } = assigned;

  const accountCreatedAt = new Date(patientUser.createdAt);
  const weekNumber = getCurrentWeekNumber(accountCreatedAt);
  const { weekStart, weekEnd } = getWeekWindow(accountCreatedAt, weekNumber);

  const [
    journalsThisWeek,
    lastJournal,
    quizThisWeek,
    latestQuiz,
    exerciseSessions,
    latestReport,
  ] = await Promise.all([
    Journal.find({ patientId, date: { $gte: weekStart, $lt: weekEnd } })
      .sort({ date: -1 })
      .select("date mood sleepQuality feelings reflection todos")
      .lean(),
    Journal.findOne({ patientId }).sort({ date: -1 }).select("date").lean(),
    QuizResult.findOne({ userId: patientId, weekStart }).lean(),
    QuizResult.findOne({ userId: patientId }).sort({ weekStart: -1 }).lean(),
    ExerciseSession.find({ userId: patientId, completedAt: { $gte: weekStart, $lt: weekEnd } })
      .select("type")
      .lean(),
    PatientAIReport.findOne({ userId: patientId }).sort({ weekStart: -1 }).lean(),
  ]);

  const journalDays = new Set(
    journalsThisWeek.map((j: any) => new Date(j.date).toISOString().slice(0, 10))
  ).size;

  const moodAvg = journalsThisWeek.length
    ? Math.round(
        (journalsThisWeek.reduce((sum: number, j: any) => sum + j.mood, 0) /
          journalsThisWeek.length) *
          10
      ) / 10
    : null;

  const sleepAvg = journalsThisWeek.length
    ? Math.round(
        (journalsThisWeek.reduce((sum: number, j: any) => sum + j.sleepQuality, 0) /
          journalsThisWeek.length) *
          10
      ) / 10
    : null;

  const exerciseCountsThisWeek: Record<string, number> = {};
  for (const session of exerciseSessions as any[]) {
    exerciseCountsThisWeek[session.type] =
      (exerciseCountsThisWeek[session.type] ?? 0) + 1;
  }

  return {
    assignment,
    patientUser: patientUser as PatientOverview["patientUser"],
    patientProfile,
    weekNumber,
    weekStart,
    weekEnd,
    weekly: { journalDays, moodAvg, sleepAvg, journals: journalsThisWeek },
    lastJournalDate: lastJournal?.date ?? null,
    quizThisWeek,
    latestQuiz,
    exerciseCountsThisWeek,
    latestReport,
  };
}