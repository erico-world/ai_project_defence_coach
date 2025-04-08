import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";

import { cn, generateProjectCover } from "@/lib/utils";
import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";

const InterviewCard = async ({
  interviewId,
  userId,
  role,
  techstack,
  createdAt,
  questionCount,
}: Omit<InterviewCardProps, "type">) => {
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

  // For academic defense sessions only
  const normalizedType = "Academic Defence";

  const badgeColor = "bg-accent-400"; // Special color for defence sessions

  // Format date from server value, not client-side calculation
  let formattedDate = "Recent";
  if (createdAt) {
    formattedDate = dayjs(createdAt).format("MMM D, YYYY");
  } else if (feedback?.createdAt) {
    formattedDate = dayjs(feedback.createdAt).format("MMM D, YYYY");
  }

  // Generate project cover image
  const coverImage =
    techstack?.length > 0 ? generateProjectCover(techstack[0]) : "/robot.png";

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
          <h3 className="mt-5 capitalize">{`${role || "Project"} Defence`}</h3>

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
          {displayQuestionCount && (
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
              "You haven't taken this defence session yet. Start now to get feedback."}
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
              {feedback ? "Check Feedback" : "Start Defence"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
