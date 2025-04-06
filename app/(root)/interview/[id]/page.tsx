import Image from "next/image";
import { redirect } from "next/navigation";
import Link from "next/link";

import Agent from "@/components/Agent";
import { getRandomInterviewCover, generateProjectCover } from "@/lib/utils";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import DisplayTechIcons from "@/components/DisplayTechIcons";

const InterviewDetails = async ({ params }: RouteParams) => {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = user.id
    ? await getFeedbackByInterviewId({
        interviewId: id,
        userId: user.id,
      })
    : null;

  const isDefenceSession = interview.type === "defence";
  const coverImage =
    isDefenceSession && interview.technologiesUsed?.length
      ? generateProjectCover(interview.technologiesUsed[0])
      : getRandomInterviewCover();

  const techStack = isDefenceSession
    ? interview.technologiesUsed || []
    : interview.techstack;

  return (
    <>
      <div className="flex flex-row gap-4 justify-between">
        <div className="flex flex-row gap-4 items-center max-sm:flex-col">
          <div className="flex flex-row gap-4 items-center">
            <Image
              src={coverImage}
              alt="cover-image"
              width={40}
              height={40}
              className="rounded-full object-cover size-[40px]"
            />
            <h3 className="capitalize">
              {isDefenceSession
                ? `${interview.projectTitle || "Project"} Defence`
                : `${interview.role} Interview`}
            </h3>
          </div>

          <DisplayTechIcons techStack={techStack} />
        </div>

        <p className="bg-dark-200 px-4 py-2 rounded-lg h-fit">
          {isDefenceSession ? "Academic Defence" : interview.type}
        </p>
      </div>

      {/* Display project file link if available */}
      {isDefenceSession &&
        interview.projectFile &&
        interview.projectFile.url && (
          <div className="my-4 p-4 bg-dark-100 rounded-lg">
            <p className="text-sm mb-2">Project documentation:</p>
            <Link
              href={interview.projectFile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-200 hover:underline flex items-center gap-2"
            >
              <Image src="/file.svg" alt="file" width={16} height={16} />
              {interview.projectFile.name}
            </Link>
          </div>
        )}

      {/* Display question count for defence sessions */}
      {isDefenceSession && interview.questionCount && (
        <div className="my-4 flex items-center gap-2">
          <Image src="/file.svg" alt="questions" width={16} height={16} />
          <p className="text-sm text-gray-400">
            {interview.questionCount} Questions
          </p>
        </div>
      )}

      <Agent
        userName={user.name}
        userId={user.id}
        interviewId={id}
        type={isDefenceSession ? "defence" : "interview"}
        questions={interview.questions}
        feedbackId={feedback?.id}
        projectDetails={
          isDefenceSession
            ? {
                projectTitle: interview.projectTitle,
                academicLevel: interview.academicLevel,
                technologiesUsed: interview.technologiesUsed?.join(", "),
                projectFile: interview.projectFile,
              }
            : undefined
        }
      />
    </>
  );
};

export default InterviewDetails;
