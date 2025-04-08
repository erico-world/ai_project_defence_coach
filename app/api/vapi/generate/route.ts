import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { generateProjectCover } from "@/lib/utils";

export async function POST(request: Request) {
  console.log("POST request received to /api/vapi/generate");

  try {
    const body = await request.json();
    console.log("Request body:", {
      projectTitle: body.projectTitle,
      academicLevel: body.academicLevel,
      technologiesUsed: body.technologiesUsed,
      focusRatio: body.focusRatio,
      questionCount: body.questionCount,
      userId: body.userId,
      hasProjectFile: !!body.projectFile,
    });

    // Project defense session specific parameters
    const {
      projectTitle,
      academicLevel,
      technologiesUsed,
      focusRatio,
      questionCount,
      userId,
      projectFile, // {name, type, url, path}
    } = body;

    console.log("Generating defense questions with Gemini...");
    // Generate defence questions
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `
        Generate tailored mock defense questions by analyzing the user's project information and contextual academic requirements.  

        Input Parameters:  
        - Project Title: ${projectTitle}  
        - Academic Level: ${academicLevel} (Bachelor's/Master's/PhD)  
        - Key Technologies Used: ${technologiesUsed} (comma-separated)  
        - Focus Balance: ${focusRatio} (Theory/Implementation mix, e.g., 70% Practical 30% Theoretical)  
        ${
          projectFile
            ? `- Project Documentation: ${projectFile.name} (${projectFile.type})`
            : ""
        }
        - Number of Questions: ${questionCount}  

        Generation Requirements:  
        1. Analyze the provided project information to identify:  
           - Core objectives and problem statements  
           - Methodology and implementation strategies  
           - Unique technical components/innovations  
           - Potential weaknesses/gaps in academic approach  

        2. Create these question types:  
           a) Project-Specific Questions (Directly related to the project's topic and goals)  
           b) Technical Deep-Dive Questions (Based on mentioned ${technologiesUsed})  
           c) Contextual Analysis Questions (Industry relevance, ethical considerations, scalability)  

        3. Prioritize question categories using ${focusRatio}  
        4. Ensure 40% of questions challenge the project's academic rigor/validation methods  
        5. Format as JSON array without special characters: ["Q1", "Q2", "Q3"]
      `,
    });
    console.log("Questions generated successfully");

    // Parse the technologies
    const keyTechnologies = technologiesUsed
      .split(",")
      .map((t: string) => t.trim());

    // Create defence session record
    const defenceSession = {
      projectTitle: projectTitle,
      academicLevel: academicLevel,
      technologiesUsed: keyTechnologies,
      focusRatio: focusRatio,
      projectFile: projectFile
        ? {
            name: projectFile.name,
            type: projectFile.type,
            url: projectFile.url,
            path: projectFile.path || null,
          }
        : null,
      analysisSummary: {
        keyComponents: keyTechnologies,
        identifiedStrengths: [],
        potentialGaps: [],
      },
      questions: JSON.parse(questions),
      questionCount: questionCount,
      userId: userId,
      finalized: true,
      type: "defence",
      defenseCover: generateProjectCover(keyTechnologies[0]),
      createdAt: new Date().toISOString(),
      iterations: [],
    };

    console.log("Saving defense session to Firestore...");
    // Store in Firestore
    const docRef = await db.collection("interviews").add(defenceSession);
    console.log("Defense session saved with ID:", docRef.id);

    return Response.json(
      { success: true, interviewId: docRef.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in API route:", error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
