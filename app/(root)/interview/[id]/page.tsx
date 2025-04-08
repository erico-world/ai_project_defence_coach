import Image from "next/image";
import { redirect } from "next/navigation";
import Link from "next/link";

import Agent from "@/components/Agent";
import { generateProjectCover } from "@/lib/utils";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import DisplayTechIcons from "@/components/DisplayTechIcons";

const DefenceDetails = async ({ params }: RouteParams) => {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  // Only allow defense sessions
  if (interview.type !== "defence") {
    redirect("/");
  }

  const feedback = user.id
    ? await getFeedbackByInterviewId({
        interviewId: id,
        userId: user.id,
      })
    : null;

  const coverImage = interview.technologiesUsed?.length
    ? generateProjectCover(interview.technologiesUsed[0])
    : "/robot.png";

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
              {`${interview.projectTitle || "Project"} Defence`}
            </h3>
          </div>

          <DisplayTechIcons techStack={interview.technologiesUsed || []} />
        </div>

        <p className="bg-dark-200 px-4 py-2 rounded-lg h-fit">
          Academic Defence
        </p>
      </div>

      {/* Display project file link if available */}
      {interview.projectFile && interview.projectFile.url && (
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
      {interview.questionCount && (
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
        questions={interview.questions}
        feedbackId={feedback?.id}
        projectDetails={{
          projectTitle: interview.projectTitle,
          academicLevel: interview.academicLevel,
          technologiesUsed: interview.technologiesUsed?.join(", "),
          projectFile: interview.projectFile,
        }}
      />
    </>
  );
};

export default DefenceDetails;
