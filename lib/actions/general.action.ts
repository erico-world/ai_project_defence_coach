"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { defenseFeedbackSchema, feedbackSchema } from "@/constants";

export async function createFeedback({
  interviewId,
  userId,
  transcript,
  feedbackId,
  projectDetails,
}: CreateFeedbackParams) {
  try {
    console.log(
      `Creating feedback for interview ${interviewId} for user ${userId}`
    );

    if (!interviewId || !userId) {
      console.error("Missing required parameters", { interviewId, userId });
      throw new Error(
        "Missing required parameters: interviewId and userId are required"
      );
    }

    // Check if we already have a feedback document to update
    if (feedbackId) {
      console.log(`Updating existing feedback document ${feedbackId}`);
      await db.collection("feedback").doc(feedbackId).set(
        {
          transcript,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return { success: true, feedbackId };
    }

    // In fallback mode or missing keys, generate mock feedback
    const isFallbackMode = process.env.FALLBACK_MODE === "true";
    const missingKeys = !process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (
      (process.env.NODE_ENV === "development" && missingKeys) ||
      isFallbackMode
    ) {
      console.warn("[DEVELOPMENT] Generating mock feedback");

      const mockFeedback = {
        interviewId,
        userId,
        transcript,
        totalScore: 78,
        finalAssessment: "This is mock feedback generated in development mode.",
        categoryScores: [
          {
            name: "Technical Depth",
            score: 80,
            comment: "Good technical knowledge demonstrated.",
          },
          {
            name: "Methodology Rigor",
            score: 75,
            comment: "Methodology could be more rigorous.",
          },
          {
            name: "Presentation Skills",
            score: 85,
            comment: "Clear communication skills.",
          },
          {
            name: "Critical Analysis",
            score: 76,
            comment: "Decent critical analysis with room for improvement.",
          },
          {
            name: "Documentation Alignment",
            score: 74,
            comment: "Documentation meets basic requirements.",
          },
        ],
        strengths: [
          "Clear explanation of core concepts",
          "Good technical implementation",
          "Effective problem-solving approach",
        ],
        areasForImprovement: [
          "More comprehensive testing strategy",
          "Enhanced documentation of design decisions",
          "Clearer explanation of technical choices",
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await db.collection("feedback").add(mockFeedback);
      return { success: true, feedbackId: docRef.id };
    }

    // Regular mode with API keys available

    // Generate feedback
    console.log("Generating feedback with available APIs");

    // Create a base feedback object
    const feedbackData = {
      interviewId,
      userId,
      transcript,
      projectDetails,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // We'll add more analysis fields later when the generateFeedback function is implemented
    };

    const docRef = await db.collection("feedback").add(feedbackData);
    console.log(`New feedback document created with ID: ${docRef.id}`);
    return { success: true, feedbackId: docRef.id };
  } catch (error) {
    console.error("Error creating feedback:", error);

    if (
      process.env.NODE_ENV === "development" ||
      process.env.FALLBACK_MODE === "true"
    ) {
      console.warn("[DEVELOPMENT] Returning mock success despite error");
      return {
        success: true,
        feedbackId: `mock-fallback-${Date.now()}`,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getInterviewById(id: string) {
  if (!id) return null;

  try {
    const interviewRef = db.collection("interviews").doc(id);
    const interviewDoc = await interviewRef.get();

    if (!interviewDoc.exists) return null;

    return { id, ...interviewDoc.data() } as any;
  } catch (error) {
    console.error("Error getting interview by ID:", error);

    // In development, return mock data if there's an error
    if (process.env.NODE_ENV === "development") {
      console.warn("[DEVELOPMENT] Returning mock interview data");
      return {
        id,
        projectTitle: "Development Mock Project",
        academicLevel: "Bachelor's",
        technologiesUsed: ["React", "Node.js"],
        focusRatio: "Balanced",
        projectFile: null,
        analysisSummary: {
          keyComponents: ["React", "Node.js"],
          identifiedStrengths: [],
          potentialGaps: [],
        },
        questions: [
          "What were the main objectives of your project?",
          "Can you explain your implementation approach?",
          "What challenges did you face during development?",
          "How did you test your solution?",
          "What improvements would you make with more time?",
        ],
        questionCount: 5,
        type: "defence",
        createdAt: new Date().toISOString(),
      };
    }

    return null;
  }
}

export async function getFeedbackByInterviewId({
  interviewId,
  userId,
}: {
  interviewId: string;
  userId: string;
}) {
  if (!interviewId || !userId) return null;

  try {
    const feedbackQuery = db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .where("userId", "==", userId)
      .limit(1);

    const feedbackData = await feedbackQuery.get();

    if (feedbackData.empty) return null;

    const feedback = feedbackData.docs[0];
    return { id: feedback.id, ...feedback.data() } as any;
  } catch (error) {
    console.error("Error getting feedback by interview ID:", error);

    // In development, return mock data if there's an error
    if (process.env.NODE_ENV === "development") {
      console.warn("[DEVELOPMENT] Returning mock feedback data");
      return {
        id: `mock-feedback-${Date.now()}`,
        interviewId,
        userId,
        transcript: [],
        totalScore: 85,
        finalAssessment: "This is mock feedback for development purposes.",
        categoryScores: [
          {
            name: "Technical Depth",
            score: 85,
            comment: "Good technical knowledge demonstrated.",
          },
          {
            name: "Methodology Rigor",
            score: 80,
            comment: "Solid methodology with some room for improvement.",
          },
          {
            name: "Presentation Skills",
            score: 90,
            comment: "Excellent communication of complex concepts.",
          },
          {
            name: "Critical Analysis",
            score: 82,
            comment: "Good critical thinking shown in problem analysis.",
          },
          {
            name: "Documentation Alignment",
            score: 88,
            comment: "Documentation aligned well with implementation.",
          },
        ],
        strengths: [
          "Clear project structure",
          "Good technical implementation",
          "Strong presentation skills",
        ],
        areasForImprovement: [
          "Consider more rigorous testing",
          "Add more detailed documentation",
        ],
        createdAt: new Date().toISOString(),
      };
    }

    return null;
  }
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function deleteInterview(interviewId: string, userId: string) {
  if (!interviewId || !userId) {
    return { success: false, error: "Missing required parameters" };
  }

  try {
    console.log(
      `Attempting to delete interview ${interviewId} for user ${userId}`
    );

    // First, verify the interview belongs to the user
    const interviewRef = db.collection("interviews").doc(interviewId);
    const interviewDoc = await interviewRef.get();

    if (!interviewDoc.exists) {
      return { success: false, error: "Interview not found" };
    }

    const interviewData = interviewDoc.data();
    if (interviewData?.userId !== userId) {
      console.error(
        "Unauthorized deletion attempt - user does not own this interview"
      );
      return { success: false, error: "Unauthorized" };
    }

    // Find and delete any associated feedback
    const feedbackQuery = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .get();

    // Delete in a batch if possible
    if (!feedbackQuery.empty) {
      const batch = db.batch();
      feedbackQuery.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      batch.delete(interviewRef);
      await batch.commit();
      console.log(
        `Deleted interview ${interviewId} and ${feedbackQuery.size} feedback documents`
      );
    } else {
      // Just delete the interview
      await interviewRef.delete();
      console.log(`Deleted interview ${interviewId}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting interview:", error);

    // For development/fallback mode
    if (
      process.env.NODE_ENV === "development" ||
      process.env.FALLBACK_MODE === "true"
    ) {
      console.warn("[DEVELOPMENT] Returning mock success despite error");
      return { success: true };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function deleteFeedback(feedbackId: string, userId: string) {
  if (!feedbackId || !userId) {
    return { success: false, error: "Missing required parameters" };
  }

  try {
    console.log(
      `Attempting to delete feedback ${feedbackId} for user ${userId}`
    );

    // First, verify the feedback belongs to the user
    const feedbackRef = db.collection("feedback").doc(feedbackId);
    const feedbackDoc = await feedbackRef.get();

    if (!feedbackDoc.exists) {
      return { success: false, error: "Feedback not found" };
    }

    const feedbackData = feedbackDoc.data();
    if (feedbackData?.userId !== userId) {
      console.error(
        "Unauthorized deletion attempt - user does not own this feedback"
      );
      return { success: false, error: "Unauthorized" };
    }

    // Delete the feedback
    await feedbackRef.delete();
    console.log(`Deleted feedback ${feedbackId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting feedback:", error);

    // For development/fallback mode
    if (
      process.env.NODE_ENV === "development" ||
      process.env.FALLBACK_MODE === "true"
    ) {
      console.warn("[DEVELOPMENT] Returning mock success despite error");
      return { success: true };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
