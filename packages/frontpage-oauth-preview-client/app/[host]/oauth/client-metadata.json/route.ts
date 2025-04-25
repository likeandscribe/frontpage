import { getClientMetadata } from "@repo/frontpage-oauth";
import { isHostPartOfCurrentVercelTeam } from "@/lib/check-host";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ host: string }> },
) {
  const host = (await params).host;
  if (!host) {
    return new Response("Not found", { status: 404 });
  }

  if (!(await isHostPartOfCurrentVercelTeam(host))) {
    return new Response("Not found", { status: 404 });
  }

  const VERCEL_PROJECT_PRODUCTION_URL =
    process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (!VERCEL_PROJECT_PRODUCTION_URL) {
    throw new Error("VERCEL_PROJECT_PRODUCTION_URL is not set");
  }

  const previewClientUrl = `https://${VERCEL_PROJECT_PRODUCTION_URL}/${host}`;

  return Response.json(
    getClientMetadata({
      redirectUri: `${previewClientUrl}/oauth/callback`,
      appUrl: previewClientUrl,
      jwksUri: "https://frontpage.fyi/oauth/jwks.json",
    }),
  );
}
