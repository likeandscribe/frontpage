"use server";
import { signIn } from "@/lib/auth-sign-in";
import { isValidHandle } from "@atproto/syntax";

export async function loginWithIdentifierAction(
  _prevStart: unknown,
  formData: FormData,
) {
  const identifier = formData.get("identifier") as string;
  let handleOrDid = identifier.trim();
  // Sanitize only handles
  if (
    isValidHandle(identifier) ||
    isValidHandle(identifier.replace(/^@/, ""))
  ) {
    handleOrDid = identifier.replace(/^@/, "").toLowerCase();
  }
  const result = await signIn({ identifier: handleOrDid });
  if (result && "error" in result) {
    return {
      error: `An error occured while signing in (${result.error})`,
    };
  }
}

export async function loginWithPdsAction(
  _prevStart: unknown,
  formData: FormData,
) {
  const pdsUrl = formData.get("pdsUrl");
  if (typeof pdsUrl !== "string") {
    return {
      error: "Please enter a PDS URL",
    };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(
      pdsUrl.startsWith("http") ? pdsUrl : `https://${pdsUrl}`,
    );
  } catch (_) {
    return {
      error: "Invalid URL",
    };
  }

  const result = await signIn({
    pdsUrl: parsedUrl,
  });

  if (result && "error" in result) {
    return {
      error: `An error occured while signing in (${result.error})`,
    };
  }
}
