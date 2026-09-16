import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

import { AuthShell } from "@/components/site/auth-shell";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Higgsfield account.",
};

export default function SignInPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to Higgsfield"
      subtitle="Pick up where you left off — your generations and credits are waiting."
    >
      <SignIn appearance={clerkAppearance} />
    </AuthShell>
  );
}
