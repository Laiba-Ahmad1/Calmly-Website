export function calculateQuizScore(
  questions: any[],
  responses: {
    questionId: string;
    selectedOption: string;
  }[],
) {
  let totalScore = 0;

  const dimensionScores: Record<string, number> = {};

  const processedResponses = responses.map((response) => {
    const question = questions.find(
      (q) => q._id.toString() === response.questionId,
    );

    if (!question) {
      throw new Error("Question not found");
    }

    const option = question.options.find(
      (option: any) => option.text === response.selectedOption,
    );

    if (!option) {
      throw new Error("Invalid option");
    }

    const score = option.score;

    totalScore += score;

    dimensionScores[question.dimension] =
      (dimensionScores[question.dimension] || 0) + score;

    return {
      questionId: question._id,
      questionText: question.question,
      selectedOption: option.text,
      score,
      anxietyType: question.anxietyType,
      dimension: question.dimension,
    };
  });

  return {
    processedResponses,
    dimensionScores,
    totalScore,
  };
}
