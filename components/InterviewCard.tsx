import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";

import { cn, getRandomInterviewCover, generateProjectCover } from "@/lib/utils";
import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";

const InterviewCard = async ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
  questionCount,
}: InterviewCardProps) => {
  const feedback =
    userId && interviewId
      ? await getFeedbackByInterviewId({
          interviewId,
          userId,
        })
      : null;

  // If we don't have question count but have an interview ID, try to fetch it
  let displayQuestionCount = questionCount;
  if (!displayQuestionCount && interviewId) {
    const interview = await getInterviewById(interviewId);
    if (interview && interview.questionCount) {
      displayQuestionCount = interview.questionCount;
    }
  }

  const isDefenceSession = type === "defence";

  // For job interviews, normalize the type
  const normalizedType = isDefenceSession
    ? "Academic Defence"
    : /mix/gi.test(type)
    ? "Mixed"
    : type;

  const badgeColor = isDefenceSession
    ? "bg-accent-400" // Special color for defence sessions
    : {
        Behavioral: "bg-light-400",
        Mixed: "bg-light-600",
        Technical: "bg-light-800",
      }[normalizedType] || "bg-light-600";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  // Choose appropriate cover image
  const coverImage =
    isDefenceSession && techstack.length > 0
      ? generateProjectCover(techstack[0])
      : getRandomInterviewCover();

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96">
      <div className="card-interview">
        <div>
          {/* Type Badge */}
          <div
            className={cn(
              "absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg",
              badgeColor
            )}
          >
            <p className="badge-text ">{normalizedType}</p>
          </div>

          {/* Cover Image */}
          <Image
            src={coverImage}
            alt="cover-image"
            width={90}
            height={90}
            className="rounded-full object-fit size-[90px]"
          />

          {/* Title */}
          <h3 className="mt-5 capitalize">
            {isDefenceSession
              ? `${role || "Project"} Defence`
              : `${role} Interview`}
          </h3>

          {/* Date & Score */}
          <div className="flex flex-row gap-5 mt-3">
            <div className="flex flex-row gap-2">
              <Image
                src="/calendar.svg"
                width={22}
                height={22}
                alt="calendar"
              />
              <p>{formattedDate}</p>
            </div>

            <div className="flex flex-row gap-2 items-center">
              <Image src="/star.svg" width={22} height={22} alt="star" />
              <p>{feedback?.totalScore || "---"}/100</p>
            </div>
          </div>

          {/* Question Count for Defence Sessions */}
          {isDefenceSession && displayQuestionCount && (
            <div className="flex flex-row gap-2 items-center mt-2">
              <Image src="/file.svg" width={18} height={18} alt="questions" />
              <p className="text-sm text-gray-400">
                {displayQuestionCount} Questions
              </p>
            </div>
          )}

          {/* Feedback or Placeholder Text */}
          <p className="line-clamp-2 mt-5">
            {feedback?.finalAssessment ||
              (isDefenceSession
                ? "You haven't taken this defence session yet. Start now to get feedback."
                : "You haven't taken this interview yet. Take it now to improve your skills.")}
          </p>
        </div>

        <div className="flex flex-row justify-between">
          <DisplayTechIcons techStack={techstack} />

          <Button className="btn-primary">
            <Link
              href={
                feedback
                  ? `/interview/${interviewId}/feedback`
                  : `/interview/${interviewId}`
              }
            >
              {feedback
                ? "Check Feedback"
                : isDefenceSession
                ? "Start Defence"
                : "View Interview"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
