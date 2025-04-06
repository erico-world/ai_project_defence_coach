import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) redirect("/sign-in");

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user.id,
  });

  if (!feedback) redirect(`/interview/${id}`);

  const isDefenceSession = interview.type === "defence" || feedback.isDefence;

  return (
    <section className="section-feedback">
      <div className="flex flex-row justify-center">
        <h1 className="text-4xl font-semibold">
          {isDefenceSession
            ? `Defence Feedback - ${
                interview.projectTitle || "Project"
              } Defence`
            : `Feedback on the Interview - ${interview.role || "Interview"}`}
        </h1>
      </div>

      <div className="flex flex-row justify-center ">
        <div className="flex flex-row gap-5">
          {/* Overall Impression */}
          <div className="flex flex-row gap-2 items-center">
            <Image src="/star.svg" width={22} height={22} alt="star" />
            <p>
              Overall Score:{" "}
              <span className="text-primary-200 font-bold">
                {feedback.totalScore}
              </span>
              /100
            </p>
          </div>

          {/* Date */}
          <div className="flex flex-row gap-2">
            <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
            <p>
              {feedback.createdAt
                ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <hr />

      <p>{feedback.finalAssessment}</p>

      {/* Project Documentation Insights (for defence only) */}
      {isDefenceSession && feedback.documentationInsights && (
        <div className="flex flex-col gap-4 mt-6 p-4 bg-dark-100 rounded-lg">
          <h2>Documentation Analysis:</h2>
          <p>{feedback.documentationInsights}</p>
        </div>
      )}

      {/* Project file link (for defence only) */}
      {isDefenceSession &&
        interview.projectFile &&
        interview.projectFile.url && (
          <div className="flex flex-col gap-4 mt-6 p-4 bg-dark-100 rounded-lg">
            <h2>Project Documentation:</h2>
            <Link
              href={interview.projectFile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-200 hover:underline flex items-center gap-2"
            >
              <Image src="/file.svg" width={16} height={16} alt="file" />
              {interview.projectFile.name}
            </Link>
          </div>
        )}

      {/* Question count (for defence only) */}
      {isDefenceSession && interview.questionCount && (
        <div className="flex flex-row gap-2 items-center mt-4 mb-6">
          <Image src="/file.svg" width={18} height={18} alt="questions" />
          <p className="text-gray-400">
            The defence consisted of {interview.questionCount} questions.
          </p>
        </div>
      )}

      {/* Breakdown */}
      <div className="flex flex-col gap-4">
        <h2>
          {isDefenceSession
            ? "Breakdown of the Defence:"
            : "Breakdown of the Interview:"}
        </h2>
        {feedback.categoryScores?.map((category, index) => (
          <div key={index}>
            <p className="font-bold">
              {index + 1}. {category.name} ({category.score}/100)
            </p>
            <p>{category.comment}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h3>Strengths</h3>
        <ul>
          {feedback.strengths?.map((strength, index) => (
            <li key={index}>{strength}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h3>Areas for Improvement</h3>
        <ul>
          {feedback.areasForImprovement?.map((area, index) => (
            <li key={index}>{area}</li>
          ))}
        </ul>
      </div>

      <div className="buttons">
        <Button className="btn-secondary flex-1">
          <Link href="/" className="flex w-full justify-center">
            <p className="text-sm font-semibold text-primary-200 text-center">
              Back to dashboard
            </p>
          </Link>
        </Button>

        <Button className="btn-primary flex-1">
          <Link
            href={`/interview/${id}`}
            className="flex w-full justify-center"
          >
            <p className="text-sm font-semibold text-black text-center">
              {isDefenceSession ? "Retake Defence" : "Retake Interview"}
            </p>
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default Feedback;
