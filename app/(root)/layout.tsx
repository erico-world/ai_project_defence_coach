import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/lib/actions/auth.action";

const Layout = async ({ children }: { children: ReactNode }) => {
  try {
    const isUserAuthenticated = await isAuthenticated();
    // Only redirect if we're sure the user is not authenticated
    if (isUserAuthenticated === false) {
      redirect("/sign-in");
    }
  } catch (error) {
    console.error("Authentication check failed:", error);
    // We don't redirect here, as it might be a temporary network issue
  }

  return (
    <div className="root-layout">
      <nav>
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="MockMate Logo" width={38} height={32} />
          <h2 className="text-primary-100">Project Defence AI Coach</h2>
        </Link>
      </nav>

      {children}
    </div>
  );
};

export default Layout;
