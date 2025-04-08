"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { defenseFeedbackSchema, feedbackSchema } from "@/constants";

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId, projectDetails } =
    params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    // Generate feedback for project defense
    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: defenseFeedbackSchema,
      prompt: `
        Analyze this project defence transcript and provide structured feedback:
        
        PROJECT DETAILS:
        - Title: ${projectDetails?.projectTitle}
        - Academic Level: ${projectDetails?.academicLevel}
        - Technologies: ${projectDetails?.technologiesUsed}
        
        DEFENCE TRANSCRIPT:
        ${formattedTranscript}
        
        Provide a comprehensive evaluation of the student's defence performance. 
        Consider technical depth, methodology rigor, presentation skills, critical analysis, and alignment with provided documentation.
      `,
      system: `
        ROLE: Senior Academic Examiner
        MANDATE: Maintain PhD-level defense standards
        BEHAVIOR:
        - Ruthlessly identify weaknesses in technical explanations
        - Compare responses against project documentation line-by-line
        - Apply ${
          projectDetails?.academicLevel || "undergraduate"
        } grading rubrics strictly
        - Never assume unstated knowledge
        - Flag undocumented claims as negative marks
        OUTPUT: JSON scores with justification paragraphs
      `,
    });

    const feedbackObject = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      documentationInsights: object.documentationInsights,
      isDefence: true,
      createdAt: new Date().toISOString(),
    };

    let docRef;

    if (feedbackId) {
      docRef = await db
        .collection("feedback")
        .doc(feedbackId)
        .set(feedbackObject);
    } else {
      docRef = await db.collection("feedback").add(feedbackObject);
    }

    return {
      success: true,
      feedbackId: feedbackId || docRef.id,
    };
  } catch (error) {
    console.error("Error creating feedback:", error);
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
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
