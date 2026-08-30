// Exercises — breathing game + other activities, tailored per anxiety type
import Exercises from "@/components/patient/Exercises";

const VALID_STARTS = ["breathing", "sound", "colorMatch", "calmlyGarden"] as const;
type StartKey = (typeof VALID_STARTS)[number];

export default async function ExercisesPage({
  searchParams,
}: {
  searchParams: { start?: string } | undefined;
}) {
  // ?start=breathing|sound|colorMatch|calmlyGarden — deep link from advice CTAs
  const start =
    searchParams && VALID_STARTS.includes(searchParams.start as StartKey)
      ? (searchParams.start as StartKey)
      : null;

  return <Exercises initialExercise={start} />;
}
