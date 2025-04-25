import { Vercel } from "@vercel/sdk";
import { getClientMetadata } from "@repo/frontpage-oauth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ host: string[] }> },
) {
  console.log(await params);
  const host = (await params).host[0];
  if (!host) {
    return new Response("Not found", { status: 404 });
  }

  const vercel = new Vercel();
  const currentDeployment = await vercel.deployments.getDeployment({
    idOrUrl: process.env.VERCEL_DEPLOYMENT_ID!,
  });

  const team = currentDeployment.team; // Get likeandscribe team data from current deployment. Avoids having to hardcode team ID.

  if (!team) {
    return new Response("Not found", { status: 404 });
  }

  const deployment = await vercel.deployments.getDeployment({
    teamId: team.id,
    idOrUrl: host,
  });

  if (!deployment) {
    return new Response("Not found", { status: 404 });
  }

  const VERCEL_URL = process.env.VERCEL_URL;
  if (!VERCEL_URL) {
    throw new Error("VERCEL_URL is not set");
  }

  return Response.json(
    getClientMetadata({
      redirectUris: [`https://${host}/oauth/callback`],
      baseUrl: `https://${VERCEL_URL}/${host}`,
    }),
  );
}
