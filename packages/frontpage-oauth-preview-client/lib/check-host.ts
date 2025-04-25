import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: process.env.VERCEL_TOKEN,
});

export async function isHostPartOfCurrentVercelTeam(host: string) {
  const currentDeployment = await vercel.deployments
    .getDeployment({
      idOrUrl: process.env.VERCEL_DEPLOYMENT_ID!,
    })
    .catch(() => null);

  if (!currentDeployment) {
    console.log("No current deployment found for", {
      idOrUrl: process.env.VERCEL_DEPLOYMENT_ID!,
    });
    return false;
  }

  const team = currentDeployment.team; // Get likeandscribe team data from current deployment. Avoids having to hardcode team ID.

  if (!team) {
    console.log("No team found");
    return false;
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
    return false;
  }

  return true;
}
