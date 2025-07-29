"use client";

import { useActionState } from "react";
import { reauthenticateAction } from "./reauthenticate-action";
import { Button } from "@/lib/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/lib/components/ui/alert";
import { CrossCircledIcon } from "@radix-ui/react-icons";

export function ReauthenticateForm({
  // TODO: Use this prop to redirect after re-authentication, requires changes in signIn method
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  redirectPath,
}: {
  redirectPath?: string;
}) {
  const [state, action, isPending] = useActionState(reauthenticateAction, null);

  return (
    <div className="space-y-3">
      <form action={action}>
        <Button className="w-full" type="submit" disabled={isPending} size="lg">
          Re-authenticate now
        </Button>
      </form>
      {state?.error ? (
        <Alert variant="destructive">
          <CrossCircledIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state?.error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
