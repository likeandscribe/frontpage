import Link from "next/link";
import { FRONTPAGE_DID, listBlogs, WHTWND_BLOG_COLLECTION } from "./blog-data";
import { BackLink } from "./_components";
import { Card, CardFooter, CardHeader } from "@/lib/components/ui/card";
import { Badge } from "@/lib/components/ui/badge";
import { UserAvatar } from "@/lib/components/user-avatar";
import { TimeAgo } from "@/lib/components/time-ago";

export const revalidate = 60;

export default async function Blog() {
  const blogList = await listBlogs();
  return (
    <>
      <link
        rel="alternate"
        href={`at://${FRONTPAGE_DID}/${WHTWND_BLOG_COLLECTION}`}
      />
      <title>Frontpage Blog</title>

      <BackLink href="/">Home</BackLink>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 my-8">
        Frontpage Blog
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {blogList.map((post) => (
          <Link key={post.uri.rkey} href={`/blog/${post.slug}`}>
            <Card className="h-full flex flex-col">
              <CardHeader className="grow">
                <TimeAgo
                  createdAt={post.value.createdAt}
                  className="text-sm text-muted-foreground"
                />
                <h2 className="text-xl font-semibold line-clamp-2">
                  {post.value.title}
                </h2>
              </CardHeader>
              <CardFooter className="flex gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    {post.additionalAuthors.length === 0 ? (
                      <UserAvatar did={FRONTPAGE_DID} size="small" />
                    ) : (
                      post.additionalAuthors.map((author) => (
                        <UserAvatar did={author} size="small" key={author} />
                      ))
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
