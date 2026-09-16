import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

import { AuthShell } from "@/components/site/auth-shell";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a Higgsfield account and start generating.",
};

export default function SignUpPage() {
  return (
    <AuthShell
      eyebrow="Get started"
      title="Create your account"
      subtitle="100 credits land in your account the moment you sign up."
    >
      <SignUp appearance={clerkAppearance} />
    </AuthShell>
  );
}
