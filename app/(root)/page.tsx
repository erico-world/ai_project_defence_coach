import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";

async function Home() {
  const user = await getCurrentUser();

  // Default to an empty array if no user or interviews
  const [userInterviews, allInterviews] = await Promise.all([
    user?.id ? getInterviewsByUserId(user.id) : null,
    user?.id ? getLatestInterviews({ userId: user.id }) : null,
  ]);

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
            <Button asChild className="btn-secondary max-sm:w-full">
              <Link href="/interview">Job Interview</Link>
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
        <h2>Your Sessions</h2>

        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={
                  interview.type === "defence"
                    ? interview.projectTitle || "Project"
                    : interview.role || "Interview"
                }
                type={interview.type}
                techstack={
                  interview.type === "defence"
                    ? interview.technologiesUsed || []
                    : interview.techstack
                }
                createdAt={interview.createdAt}
                questionCount={
                  interview.type === "defence"
                    ? interview.questionCount
                    : undefined
                }
              />
            ))
          ) : (
            <p>You haven&apos;t taken any interviews or defences yet</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Available Sessions</h2>

        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            allInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={
                  interview.type === "defence"
                    ? interview.projectTitle || "Project"
                    : interview.role || "Interview"
                }
                type={interview.type}
                techstack={
                  interview.type === "defence"
                    ? interview.technologiesUsed || []
                    : interview.techstack
                }
                createdAt={interview.createdAt}
                questionCount={
                  interview.type === "defence"
                    ? interview.questionCount
                    : undefined
                }
              />
            ))
          ) : (
            <p>There are no sessions available</p>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;
