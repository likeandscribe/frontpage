/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/heading-has-content */
import Markdown, { type ComponentConfig } from "./markdown";
import { getBlog } from "../blog-data";
import { notFound } from "next/navigation";
import { AuthorAvatar, BackLink } from "../_components";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export default async function BlogPost(props: Props) {
  const { slug } = await props.params;
  const rkey = slug.split("-")[0];
  if (!rkey) notFound();
  const blog = await getBlog(rkey);
  if (!blog) notFound();

  return (
    <>
      <link
        rel="alternate"
        href={`at://${blog.uri.authority}/${blog.uri.collection}/${blog.uri.rkey}`}
      />
      <title>{blog.value.title}</title>
      <link rel="canonical" href={`/blog/${blog.slug}`} />

      <BackLink href="/blog">Blog</BackLink>
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-4xl mt-32">{blog.value.title}</h1>
        <div className="flex gap-4">
          {blog.additionalAuthors.length > 0 ? (
            <div className="flex gap-2">
              {blog.additionalAuthors.map((author) => (
                <AuthorAvatar key={author} did={author} />
              ))}
            </div>
          ) : null}
          {new Intl.DateTimeFormat("en-US", {
            dateStyle: "long",
            timeStyle: "short",
          }).format(blog.value.createdAt)}
        </div>
      </div>
      <div>
        <Markdown content={blog.value.content} components={componentConfig} />
      </div>
    </>
  );
}

const componentConfig: ComponentConfig = {
  h2: (props) => <h2 className="text-2xl mt-8 mb-4" {...props} />,
  p: (props) => <p className="mb-4" {...props} />,
  a: (props) => (
    <a
      className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
      {...props}
    />
  ),
  li: (props) => <li className="mb-2 ml-4 list-disc" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="border-l-4 border-gray-200 dark:border-gray-800 pl-4 py-2 my-8 [&_p]:mb-0"
      {...props}
    />
  ),
};
