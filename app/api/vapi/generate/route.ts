import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover, generateProjectCover } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Determine if this is a job interview or project defence scenario
    const isDefence = body.isDefence === true;

    if (isDefence) {
      // Handle project defence generation
      const {
        projectTitle,
        academicLevel,
        technologiesUsed,
        focusRatio,
        questionCount,
        userId,
        projectFile, // {name, type, url, path}
      } = body;

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

      // Store in Firestore
      const docRef = await db.collection("interviews").add(defenceSession);

      return Response.json(
        { success: true, interviewId: docRef.id },
        { status: 200 }
      );
    } else {
      // Original job interview logic
      const { type, role, level, techstack, amount, userid } = body;

      const { text: questions } = await generateText({
        model: google("gemini-2.0-flash-001"),
        prompt: `Prepare questions for a job interview.
          The job role is ${role}.
          The job experience level is ${level}.
          The tech stack used in the job is: ${techstack}.
          The focus between behavioural and technical questions should lean towards: ${type}.
          The amount of questions required is: ${amount}.
          Please return only the questions, without any additional text.
          The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
          Return the questions formatted like this:
          ["Question 1", "Question 2", "Question 3"]
          
          Thank you! <3
        `,
      });

      const interview = {
        role: role,
        type: type,
        level: level,
        techstack: techstack.split(","),
        questions: JSON.parse(questions),
        userId: userid,
        finalized: true,
        coverImage: getRandomInterviewCover(),
        createdAt: new Date().toISOString(),
      };

      const docRef = await db.collection("interviews").add(interview);

      return Response.json(
        { success: true, interviewId: docRef.id },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
