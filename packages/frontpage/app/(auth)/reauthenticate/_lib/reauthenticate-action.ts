"use server";

import { getSession } from "@/lib/auth";
import { signIn } from "@/lib/auth-sign-in";
import { redirect } from "next/navigation";

export async function reauthenticateAction() {
  const session = await getSession();
  if (!session) {
    redirect("/login?error=You've been logged out. Please log in again.");
  }
  const result = await signIn({
    identifier: session.user.did,
  });

  if (result && "error" in result) {
    return {
      error: `An error occurred while re-authenticating (${result.error}), please try again.`,
    };
  }
}
