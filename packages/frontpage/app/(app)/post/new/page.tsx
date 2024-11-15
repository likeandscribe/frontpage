import { Metadata } from "next";
import { NewPostForm } from "./_client";

export const metadata: Metadata = {
  title: "New post | Frontpage",
  robots: "noindex, nofollow",
};

export default async function NewPost(props: {
  searchParams: Promise<Record<string, string>>;
}) {
  const searchParams = await props.searchParams;
  return (
    <div className="flex flex-col gap-3 px-4">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        New post
      </h2>
      <NewPostForm
        defaultTitle={searchParams.title}
        defaultUrl={searchParams.url}
      />
    </div>
  );
}
