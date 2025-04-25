import { Vercel } from "@vercel/sdk";
import { getClientMetadata } from "@repo/frontpage-oauth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ host: string }> },
) {
  console.log(await params);
  const host = (await params).host;
  if (!host) {
    return new Response("Not found", { status: 404 });
  }

  const vercel = new Vercel({
    bearerToken: process.env.VERCEL_TOKEN,
  });
  const currentDeployment = await vercel.deployments
    .getDeployment({
      idOrUrl: process.env.VERCEL_DEPLOYMENT_ID!,
    })
    .catch(() => null);

  if (!currentDeployment) {
    console.log("No current deployment found for", {
      idOrUrl: process.env.VERCEL_DEPLOYMENT_ID!,
    });
    return new Response("Not found", { status: 404 });
  }

  const team = currentDeployment.team; // Get likeandscribe team data from current deployment. Avoids having to hardcode team ID.

  if (!team) {
    console.log("No team found");
    return new Response("Not found", { status: 404 });
  }

  const deployment = await vercel.deployments
    .getDeployment({
      teamId: team.id,
      idOrUrl: host,
    })
    .catch(() => null);

  if (!deployment) {
    console.log("No deployment found for", {
      teamId: team.id,
      idOrUrl: host,
    });
    return new Response("Not found", { status: 404 });
  }

  const VERCEL_PROJECT_PRODUCTION_URL =
    process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (!VERCEL_PROJECT_PRODUCTION_URL) {
    throw new Error("VERCEL_PROJECT_PRODUCTION_URL is not set");
  }

  return Response.json(
    getClientMetadata({
      redirectUri: `https://${host}/oauth/callback`,
      clientMetadataUrl: request.url,
      appUrl: `https://${host}`,
      jwksUri: "https://frontpage.fyi/oauth/jwks.json",
    }),
  );
}
