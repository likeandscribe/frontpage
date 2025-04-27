"use client";

import { startTransition, useActionState, useState } from "react";
import { loginWithIdentifierAction, loginWithPdsAction } from "./action";
import { Label } from "@/lib/components/ui/label";
import { Input } from "@/lib/components/ui/input";
import { Button } from "@/lib/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/lib/components/ui/alert";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/lib/components/ui/dialog";

export function LoginForm() {
  const [pdsDialogOpen, setPdsDialogOpen] = useState(false);
  const [pdsState, pdsAction, isPdsPending] = useActionState(
    loginWithPdsAction,
    null,
  );

  return (
    <>
      <div className="space-y-6">
        <form className="contents" action={pdsAction}>
          <Button
            className="w-full"
            type="submit"
            name="pdsUrl"
            value="bsky.social"
            disabled={isPdsPending}
          >
            Login with bsky.social
          </Button>
        </form>

        <div className="flex gap-2">
          <Dialog open={pdsDialogOpen} onOpenChange={setPdsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" variant="outline">
                Login with another PDS
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Login with another PDS</DialogTitle>
              </DialogHeader>

              <PdsForm />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full" variant="outline">
                Login with @handle
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Login with handle</DialogTitle>
              </DialogHeader>

              <IdentifierForm />
            </DialogContent>
          </Dialog>
        </div>

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
  const [identifierState, identifierAction, isIdentiferPending] =
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
      <div>
        <Label htmlFor="handle">Handle</Label>
        <Input
          id="identifier"
          name="identifier"
          required
          placeholder="example.com"
        />
      </div>
      <div>
        <Button type="submit" className="w-full" disabled={isIdentiferPending}>
          Sign in
        </Button>
      </div>

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
    <form className="space-y-6" action={pdsAction}>
      <Input name="pdsUrl" />
      <Button type="submit" className="w-full" disabled={isPdsPending}>
        Login
      </Button>

      <LoginError errorState={pdsState?.error} />
    </form>
  );
}
