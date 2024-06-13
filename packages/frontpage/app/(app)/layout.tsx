import { getSession, signOut } from "@/lib/auth";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/lib/components/ui/button";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex place-content-between items-center mb-8">
          <div className="flex">
            <Link href="/">
              <span className="font-serif text-2xl font-bold">Frontpage</span>
            </Link>
            {session && (
              <Button className="ml-4" asChild>
                <Link href="/post/new">New</Link>
              </Button>
            )}
          </div>
          <Suspense>
            <LoginOrLogout />
          </Suspense>
        </div>
        {children}
      </div>
    </div>
  );
}

async function LoginOrLogout() {
  const session = await getSession();
  if (session) {
    return (
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button>Logout ({session.user.name})</button>
      </form>
    );
  }

  return <Link href="/login">Login</Link>;
}
