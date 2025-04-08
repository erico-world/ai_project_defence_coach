import { db } from "@/firebase/admin";

interface ProjectFile {
  name: string;
  type: string;
  url: string;
  path?: string;
}

interface DefenseSessionData {
  projectTitle: string;
  academicLevel: string;
  technologiesUsed: string[];
  focusRatio: string;
  questions: string[];
  questionCount: number;
  userId: string;
  projectFile: ProjectFile | null;
  createdAt: string;
  status: string;
}

interface GenerateQuestionsData {
  questionCount: number;
  academicLevel: string;
  projectTitle: string;
  technologiesUsed: string;
  focusRatio: string;
}

// Helper function to safely parse JSON with fallback
function safeJsonParse(text: string): string[] {
  try {
    // First, try direct parsing
    return JSON.parse(text);
  } catch (parseError) {
    console.log(
      "Direct JSON parsing failed, trying to extract from markdown..."
    );

    // Try to extract JSON from markdown code blocks
    try {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1].trim());
      }
    } catch (blockError) {
      console.log("Markdown extraction failed, trying manual extraction...");
    }

    // Try manual extraction - look for array pattern
    try {
      const arrayStart = text.indexOf("[");
      const arrayEnd = text.lastIndexOf("]");

      if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
        const jsonArray = text.substring(arrayStart, arrayEnd + 1);
        return JSON.parse(jsonArray);
      }
    } catch (manualError) {
      console.log("Manual extraction failed too:", manualError);
    }

    // If all parsing attempts fail, return default questions
    console.error("All JSON parsing methods failed, using default questions");
    return [
      "What was the main objective of your project?",
      "What technologies did you use and why?",
      "What were the biggest challenges you faced?",
      "How did you test your implementation?",
      "What would you do differently next time?",
    ];
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Request body:", body);

    // Validate required fields
    if (!body.projectTitle || !body.technologiesUsed) {
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate questions using Gemini
    const questions = await generateQuestions(body);
    console.log("Questions generated:", questions);

    // Create defense session in Firestore
    const defenseSession: DefenseSessionData = {
      projectTitle: body.projectTitle,
      academicLevel: body.academicLevel,
      technologiesUsed: body.technologiesUsed
        .split(",")
        .map((tech: string) => tech.trim()),
      focusRatio: body.focusRatio,
      questions: questions,
      questionCount: body.questionCount,
      userId: body.userId,
      projectFile: body.projectFile || null,
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    const docRef = await db.collection("defense_sessions").add(defenseSession);
    console.log("Defense session created with ID:", docRef.id);

    return Response.json({
      success: true,
      interviewId: docRef.id,
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function generateQuestions(
  data: GenerateQuestionsData
): Promise<string[]> {
  try {
    const prompt = `Generate ${data.questionCount} project defense questions for a ${data.academicLevel} level project titled "${data.projectTitle}" using ${data.technologiesUsed}. Focus ratio: ${data.focusRatio}. Return only a JSON array of questions.`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate questions");
    }

    const result = await response.json();
    const text = result.candidates[0].content.parts[0].text;

    // Use our safe parsing function instead of direct JSON.parse
    return safeJsonParse(text);
  } catch (error) {
    console.error("Error generating questions:", error);
    // Return default questions if generation fails
    return [
      "What was the main objective of your project?",
      "What technologies did you use and why?",
      "What were the biggest challenges you faced?",
      "How did you test your implementation?",
      "What would you do differently next time?",
    ];
  }
}

export async function GET() {
  return Response.json({ success: true });
}
