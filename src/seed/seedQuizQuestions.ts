import "dotenv/config";
import mongoose from "mongoose";
import QuizQuestion from "@/models/QuizQuestion";
import { quizQuestions } from "@/data/QuizQuestions";
import db from "@/lib/db";

async function seedQuestions() {
  try {
    await db();

    console.log("MongoDB connected");

    await QuizQuestion.deleteMany({});

    await QuizQuestion.insertMany(quizQuestions);

    console.log(`${quizQuestions.length} questions inserted successfully`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding questions:", error);

    await mongoose.disconnect();

    process.exit(1);
  }
}

seedQuestions();
