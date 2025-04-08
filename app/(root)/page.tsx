import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
  getFeedbackByInterviewId,
} from "@/lib/actions/general.action";

interface User {
  id: string;
  name: string;
}

interface Interview {
  id: string;
  projectTitle?: string;
  technologiesUsed?: string[];
  createdAt: string;
  questionCount?: number;
  type: string;
}

interface Feedback {
  id: string;
  totalScore?: number;
  finalAssessment?: string;
  createdAt?: string;
}

async function Home() {
  let user: User | null = null;
  let userInterviews: Interview[] | null = null;
  let allInterviews: Interview[] | null = null;
  const feedbackMap = new Map<string, Feedback>();

  try {
    // Try to get the current user, handling potential network errors
    user = await getCurrentUser();

    // Only fetch interviews if we have a valid user
    if (user?.id) {
      // Use Promise.allSettled to handle potential failures individually
      const results = await Promise.allSettled([
        getInterviewsByUserId(user.id),
        getLatestInterviews({ userId: user.id }),
      ]);

      // Extract successful results
      if (results[0].status === "fulfilled") {
        userInterviews = results[0].value;

        // Prefetch feedback for user interviews
        if (userInterviews && userInterviews.length > 0) {
          const feedbackPromises = userInterviews.map((interview) =>
            getFeedbackByInterviewId({
              interviewId: interview.id,
              userId: user!.id,
            })
          );

          const feedbackResults = await Promise.allSettled(feedbackPromises);

          // Create a map of interviewId -> feedback
          feedbackResults.forEach((result, index) => {
            if (result.status === "fulfilled" && result.value) {
              feedbackMap.set(userInterviews![index].id, result.value);
            }
          });
        }
      }

      if (results[1].status === "fulfilled") {
        allInterviews = results[1].value;
      }
    }
  } catch (error) {
    console.error("Error fetching data for home page:", error);
    // Continue rendering the page with whatever data we have
  }

  const hasPastInterviews = userInterviews && userInterviews.length > 0;
  const hasUpcomingInterviews = allInterviews && allInterviews.length > 0;

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Defend your Project with AI-Powered Coach & get Feedback</h2>
          <p className="text-lg">
            Prepare for your final year project defence with realistic questions
            and instant feedback
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="btn-primary max-sm:w-full">
              <Link href="/project-defence">Project Defence</Link>
            </Button>
          </div>
        </div>

        <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Defence Sessions</h2>

        <div className="interviews-section">
          {hasPastInterviews && userInterviews ? (
            userInterviews
              .filter((interview) => interview.type === "defence")
              .map((interview) => (
                <InterviewCard
                  key={interview.id}
                  userId={user?.id}
                  interviewId={interview.id}
                  role={interview.projectTitle || "Project"}
                  techstack={interview.technologiesUsed || []}
                  createdAt={interview.createdAt}
                  displayQuestionCount={interview.questionCount}
                  feedback={feedbackMap.get(interview.id)}
                />
              ))
          ) : (
            <p>You haven&apos;t taken any project defences yet</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Available Defence Sessions</h2>

        <div className="interviews-section">
          {hasUpcomingInterviews && allInterviews ? (
            allInterviews
              .filter((interview) => interview.type === "defence")
              .map((interview) => (
                <InterviewCard
                  key={interview.id}
                  userId={user?.id}
                  interviewId={interview.id}
                  role={interview.projectTitle || "Project"}
                  techstack={interview.technologiesUsed || []}
                  createdAt={interview.createdAt}
                  displayQuestionCount={interview.questionCount}
                  feedback={feedbackMap.get(interview.id)}
                />
              ))
          ) : (
            <p>There are no defence sessions available</p>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;
