import { Suspense } from "react";
import { redirect } from "next/navigation";

import ProjectDefenceForm from "@/components/ProjectDefenceForm";
import { isAuthenticated } from "@/lib/actions/auth.action";
import ClientErrorBoundary from "@/components/ClientErrorHandler";

export default async function ProjectDefencePage() {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientErrorBoundary>
        <ProjectDefenceForm />
      </ClientErrorBoundary>
    </Suspense>
  );
}
