export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return new Response(null, {
    status: 308,
    headers: {
      Location: `https://frontpage.fyi/blog/${(await params).slug}`,
    },
  });
}
