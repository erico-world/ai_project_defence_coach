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

    // Determine if this is a project defence or job interview feedback
    const isDefence = projectDetails !== undefined;

    let feedbackObject;

    if (isDefence) {
      const { object } = await generateObject({
        model: google("gemini-2.0-flash-001", {
          structuredOutputs: false,
        }),
        schema: defenseFeedbackSchema,
        prompt: `
          ANALYZE PROJECT DEFENSE PERFORMANCE
          ===================================
          As an academic defense evaluator, critically assess the student's performance using:
          
          ${
            projectDetails?.projectFile
              ? `1. Project Documentation: ${projectDetails.projectFile.name} (${projectDetails.projectFile.type})`
              : ""
          }
          ${projectDetails?.projectFile ? "2. " : ""}Defense Transcript: 
          ${formattedTranscript}
          
          Evaluation Criteria (0-100):
          - **Technical Depth**: Understanding of ${
            projectDetails?.technologiesUsed || "the technologies used"
          }, implementation challenges
          - **Methodology Rigor**: Validity of research approach from ${
            projectDetails?.projectTitle || "the project"
          }
          - **Presentation Skills**: Clarity in explaining complex concepts
          - **Critical Analysis**: Quality of responses to examiner challenges
          - **Documentation Alignment**: Consistency between defense answers and project files
          
          Special Instructions:
          ${
            projectDetails?.projectFile
              ? `- Cross-reference answers with diagrams/code from ${projectDetails.projectFile.name}`
              : "- Analyze the depth of technical explanations"
          }
          - Highlight any discrepancies between documentation and verbal explanations
          - Identify 3 key areas for improvement based on ${
            projectDetails?.academicLevel || "undergraduate"
          } standards
          - Be strict on validation methods and result interpretation
          - Penalize score for unaddressed gaps from project analysis
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

      feedbackObject = {
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
    } else {
      // Original job interview feedback logic
      const { object } = await generateObject({
        model: google("gemini-2.0-flash-001", {
          structuredOutputs: false,
        }),
        schema: feedbackSchema,
        prompt: `
          You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
          Transcript:
          ${formattedTranscript}

          Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
          - **Communication Skills**: Clarity, articulation, structured responses.
          - **Technical Knowledge**: Understanding of key concepts for the role.
          - **Problem-Solving**: Ability to analyze problems and propose solutions.
          - **Cultural & Role Fit**: Alignment with company values and job role.
          - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
        system:
          "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
      });

      feedbackObject = {
        interviewId: interviewId,
        userId: userId,
        totalScore: object.totalScore,
        categoryScores: object.categoryScores,
        strengths: object.strengths,
        areasForImprovement: object.areasForImprovement,
        finalAssessment: object.finalAssessment,
        isDefence: false,
        createdAt: new Date().toISOString(),
      };
    }

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedbackObject);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
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
