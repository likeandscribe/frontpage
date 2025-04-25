import { isHostPartOfCurrentVercelTeam } from "@/lib/check-host";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ host: string }> },
) {
  const host = (await params).host;
  if (!host) {
    return new Response("Not found", { status: 404 });
  }

  if (!(await isHostPartOfCurrentVercelTeam(host))) {
    return new Response("Not found", { status: 404 });
  }

  const url = new URL(request.url);
  url.host = host;

  return Response.redirect(url, 307);
}
