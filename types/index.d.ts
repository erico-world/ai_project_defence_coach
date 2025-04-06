interface Feedback {
  id: string;
  interviewId: string;
  totalScore: number;
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
  isDefence?: boolean;
  documentationInsights?: string;
}

interface Interview {
  id: string;
  role?: string;
  level?: string;
  questions: string[];
  techstack: string[];
  createdAt: string;
  userId: string;
  type: string;
  finalized: boolean;
  projectTitle?: string;
  academicLevel?: string;
  technologiesUsed?: string[];
  focusRatio?: string;
  questionCount?: number;
  projectFile?: {
    name: string;
    type: string;
    url: string;
  };
  analysisSummary?: {
    keyComponents: string[];
    identifiedStrengths: string[];
    potentialGaps: string[];
  };
  defenseCover?: string;
  iterations?: unknown[];
}

interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
  projectDetails?: {
    projectTitle?: string;
    academicLevel?: string;
    technologiesUsed?: string;
    projectFile?: {
      name: string;
      type: string;
      url: string;
    };
  };
}

interface User {
  name: string;
  email: string;
  id: string;
}

interface InterviewCardProps {
  interviewId?: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt?: string;
  questionCount?: number;
}

interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview" | "defence";
  questions?: string[];
  projectDetails?: {
    projectTitle?: string;
    academicLevel?: string;
    technologiesUsed?: string;
    projectFile?: {
      name: string;
      type: string;
      url: string;
    };
  };
}

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

interface SignInParams {
  email: string;
  idToken: string;
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
}

type FormType = "sign-in" | "sign-up";

interface InterviewFormProps {
  interviewId: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  amount: number;
}

interface TechIconProps {
  techStack: string[];
}
