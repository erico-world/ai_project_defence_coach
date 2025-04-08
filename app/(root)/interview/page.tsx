import { redirect } from "next/navigation";

// Redirect to project defence page as we're focusing only on project defence functionality
export default function InterviewPage() {
  redirect("/project-defence");
}
