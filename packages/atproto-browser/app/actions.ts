"use server";

import { navigateAtUri } from "@/lib/navigation";

export async function navigateUriAction(_state: unknown, formData: FormData) {
  const uriInput = formData.get("uri") as string;

  const result = await navigateAtUri(uriInput);

  if ("error" in result) {
    return result;
  }
  throw new Error("Should have redirected");
}
