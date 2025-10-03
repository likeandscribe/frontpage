import { getSession, signOut } from "@/lib/auth";
import { AUTH_SCOPES } from "@repo/frontpage-oauth";
import { redirect } from "next/navigation";
import { ReauthenticateForm } from "./_lib/reauthenticate-form";
import { Button } from "@/lib/components/ui/button";
import { revalidatePath } from "next/cache";
import { UserAvatar } from "@/lib/components/user-avatar";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login?error=You've been logged out. Please log in again.");
  }

  const redirectParam = (await searchParams).redirect;

  if (session.user.scope === AUTH_SCOPES) {
    // Checking for // and forcing to / to avoid open redirect vulnerabilities
    // This should ensure we only redirect to internal paths and not external sites
    const redirectPath =
      redirectParam?.startsWith("//") || !redirectParam?.startsWith("/")
        ? "/"
        : (redirectParam ?? "/");
    console.warn(
      "User has AUTH_SCOPES, redirecting to the specified path or defaulting to /",
    );
    redirect(redirectPath);
  }

  return (
    <>
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Re-authenticate to Frontpage
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          You need to re-authenticate to continue using Frontpage so that we
          have the latest permissions to access your data.
        </p>
      </div>
      <div>
        <ReauthenticateForm
          avatar={<UserAvatar did={session.user.did} size="smedium" />}
        />
        <form
          action={async () => {
            "use server";
            await signOut();
            revalidatePath("/", "layout");
          }}
        >
          <Button size="lg" variant="secondary" className="w-full mt-4">
            Logout
          </Button>
        </form>
      </div>
    </>
  );
}
