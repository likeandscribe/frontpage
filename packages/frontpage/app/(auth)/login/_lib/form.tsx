"use client";

import { startTransition, useActionState, useState } from "react";
import { loginWithIdentifierAction, loginWithPdsAction } from "./action";
import { Input } from "@/lib/components/ui/input";
import { Button } from "@/lib/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/lib/components/ui/alert";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/lib/components/ui/dialog";

const DEFAULT_PDS_URL =
  process.env.NEXT_PUBLIC_DEFAULT_PDS_HOST || "bsky.social";

export function LoginForm() {
  const [pdsDialogOpen, setPdsDialogOpen] = useState(false);
  const [pdsState, pdsAction, isPdsPending] = useActionState(
    loginWithPdsAction,
    null,
  );

  return (
    <>
      <div className="space-y-3">
        <form className="contents" action={pdsAction}>
          <Button
            className="w-full"
            type="submit"
            name="pdsUrl"
            value={DEFAULT_PDS_URL}
            disabled={isPdsPending}
            size="lg"
          >
            Login or signup with {DEFAULT_PDS_URL}
          </Button>
        </form>

        <Dialog open={pdsDialogOpen} onOpenChange={setPdsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" variant="outline">
              Continue with another PDS
            </Button>
          </DialogTrigger>
          <DialogContent className="top-1/3">
            <DialogHeader>
              <DialogTitle>Login with another PDS</DialogTitle>
              <DialogDescription>
                Enter the URL of your PDS to login.
              </DialogDescription>
            </DialogHeader>

            <PdsForm />
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full" variant="outline">
              Continue with @handle
            </Button>
          </DialogTrigger>

          <DialogContent className="top-1/3">
            <DialogHeader>
              <DialogTitle>Login with handle</DialogTitle>
              <DialogDescription>
                Enter your Bluesky/AT Protocol handle to login.
              </DialogDescription>
            </DialogHeader>

            <IdentifierForm />
          </DialogContent>
        </Dialog>

        <LoginError errorState={pdsState?.error} />
      </div>
    </>
  );
}

function LoginError({ errorState }: { errorState?: string }) {
  if (!errorState) return null;
  return (
    <Alert variant="destructive">
      <CrossCircledIcon className="h-4 w-4" />
      <AlertTitle>Login error</AlertTitle>
      <AlertDescription>{errorState}</AlertDescription>
    </Alert>
  );
}

function IdentifierForm() {
  const [identifierState, identifierAction, isIdentifierPending] =
    useActionState(loginWithIdentifierAction, null);

  return (
    <form
      className="space-y-6"
      action={identifierAction}
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(() => {
          identifierAction(new FormData(event.currentTarget));
        });
      }}
    >
      <Input
        id="identifier"
        name="identifier"
        required
        placeholder="eg. dril.bsky.social"
      />

      <Button type="submit" className="w-full" disabled={isIdentifierPending}>
        Login
      </Button>

      <LoginError errorState={identifierState?.error} />
    </form>
  );
}

function PdsForm() {
  const [pdsState, pdsAction, isPdsPending] = useActionState(
    loginWithPdsAction,
    null,
  );
  return (
    <form
      className="space-y-6"
      action={pdsAction}
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(() => {
          pdsAction(new FormData(event.currentTarget));
        });
      }}
    >
      <Input name="pdsUrl" placeholder="eg. bsky.social" />
      <Button type="submit" className="w-full" disabled={isPdsPending}>
        Login
      </Button>

      <LoginError errorState={pdsState?.error} />
    </form>
  );
}
