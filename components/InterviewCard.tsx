"use client";

import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";

import { cn, generateProjectCover } from "@/lib/utils";
import { deleteInterview } from "@/lib/actions/general.action";

interface FeedbackData {
  id?: string;
  totalScore?: number;
  finalAssessment?: string;
  createdAt?: string;
}

const InterviewCard = ({
  interviewId,
  userId,
  role,
  techstack,
  createdAt,
  displayQuestionCount,
  feedback,
}: Omit<InterviewCardProps, "type" | "questionCount"> & {
  feedback?: FeedbackData;
  displayQuestionCount?: number;
}) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // For academic defense sessions only
  const normalizedType = "Academic Defence";
  const badgeColor = "bg-accent-400"; // Special color for defence sessions

  // If we don't have question count but have an interview ID, fetch it on mount
  // This code is commented out because we should fetch this server-side
  // useEffect(() => {
  //   if (!displayQuestionCount && interviewId) {
  //     getInterviewById(interviewId).then(interview => {
  //       if (interview && interview.questionCount) {
  //         setLocalQuestionCount(interview.questionCount);
  //       }
  //     });
  //   }
  // }, []);

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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    if (!interviewId || !userId) {
      toast.error("Cannot delete: Missing interview or user information");
      setShowConfirmation(false);
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteInterview(interviewId, userId);
      if (result.success) {
        toast.success("Defence session deleted successfully");
        // Refresh the page to update the UI
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete defence session");
      }
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast.error("An error occurred while deleting");
    } finally {
      setIsDeleting(false);
      setShowConfirmation(false);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirmation(false);
  };

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96 relative">
      {showConfirmation && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-10 flex items-center justify-center rounded-xl">
          <div className="bg-gray-800 p-4 rounded-lg max-w-[280px]">
            <h4 className="text-lg font-semibold mb-2">Confirm Deletion</h4>
            <p className="mb-4">
              Are you sure you want to delete this defence session? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="card-interview">
        <div>
          {/* Delete Button */}
          <div className="absolute top-0 left-0 m-2">
            <Button
              variant="ghost"
              className="p-2 hover:bg-red-900/20 rounded-full"
              onClick={handleDeleteClick}
            >
              <Image
                src="/trash.svg"
                width={18}
                height={18}
                alt="delete"
                className="opacity-70 hover:opacity-100"
              />
            </Button>
          </div>

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
