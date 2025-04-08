import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { generateProjectCover } from "@/lib/utils";

// Helper function to clean and parse JSON from GPT/Gemini responses
function cleanAndParseJSON(text: string): string[] {
  try {
    // First, try direct parsing
    return JSON.parse(text);
  } catch (e) {
    // If direct parsing fails, try to extract JSON from markdown code blocks
    try {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1].trim());
      }
    } catch (e) {
      // If that fails too, do manual cleanup and try again
      console.log("Trying manual JSON cleanup...");
    }

    // Last resort: manual cleanup
    try {
      // Remove markdown code blocks if present
      let cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/\s*```/g, "");

      // Remove any non-JSON text before the first '[' and after the last ']'
      cleaned = cleaned.substring(
        cleaned.indexOf("["),
        cleaned.lastIndexOf("]") + 1
      );

      // Validate that it looks like a JSON array
      if (!cleaned.startsWith("[") || !cleaned.endsWith("]")) {
        throw new Error("Could not extract valid JSON array");
      }

      console.log("Manually cleaned JSON:", cleaned);
      return JSON.parse(cleaned);
    } catch (e) {
      // If all else fails, return a default array with a message
      console.error("Could not parse JSON after cleaning:", e);
      return [
        "Tell me about your project's main objectives and goals.",
        "What technologies did you use in your project?",
        "What challenges did you face during development?",
        "How did you test your implementation?",
        "What would you improve in future iterations?",
      ];
    }
  }
}

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
    const { text: questionsText } = await generateText({
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
        5. Format as a simple JSON array of strings: ["Q1", "Q2", "Q3"]

        Respond ONLY with the JSON array, no other explanation text.
      `,
    });

    console.log(
      "Raw questions response:",
      questionsText.substring(0, 100) + "..."
    );

    // Parse the questions using our helper function to handle different formats
    const questions = cleanAndParseJSON(questionsText);
    console.log("Parsed questions:", questions);

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
      questions: questions,
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    return Response.json(
      {
        success: false,
        error: errorMessage,
        message: "Failed to create defence session.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
