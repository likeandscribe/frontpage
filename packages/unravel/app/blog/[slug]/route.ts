export function GET(
  request: Request,
  { params: { slug } }: { params: { slug: string } },
) {
  return new Response(null, {
    status: 308,
    headers: {
      Location: `https://frontpage.fyi/blog/${slug}`,
    },
  });
}
