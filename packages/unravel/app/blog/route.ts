export const dynamic = "force-static";

export function GET() {
  return new Response(null, {
    status: 308,
    headers: {
      Location: "https://frontpage.fyi/blog",
    },
  });
}
