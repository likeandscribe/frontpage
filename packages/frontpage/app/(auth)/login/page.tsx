import { redirect } from "next/navigation";
import { LoginForm } from "./_lib/form";
import { getUser } from "@/lib/data/user";
import { Alert, AlertDescription, AlertTitle } from "@/lib/components/ui/alert";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import { Card } from "@/lib/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getUser();

  if (user !== null) {
    redirect("/");
  }

  const error = (await searchParams).error;

  return (
    <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md space-y-6 p-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Sign in to Frontpage
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in or create an account in the Atmosphere to get started.
          </p>
        </div>
        <LoginForm />
        {error ? (
          <Alert variant="destructive">
            <CrossCircledIcon className="h-4 w-4" />
            <AlertTitle>Login error, please try again</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
      </Card>
    </div>
  );
}
