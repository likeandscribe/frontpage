import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: process.env.VERCEL_TOKEN,
});

export async function isHostPartOfCurrentVercelTeam(host: string) {
  const deployment = await vercel.deployments
    .getDeployment({
      teamId: "team_orMLxjETQjrCUQ8nZYhL4X5Q",
      idOrUrl: host,
    })
    .catch(() => null);

  if (!deployment) {
    console.log("No deployment found for", {
      teamId: "team_orMLxjETQjrCUQ8nZYhL4X5Q",
      idOrUrl: host,
    });
    return false;
  }

  return true;
}
