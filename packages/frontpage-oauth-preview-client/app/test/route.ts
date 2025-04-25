import { Vercel } from "@vercel/sdk";

export async function GET() {
  const vercel = new Vercel();
  const currentDeployment = await vercel.deployments.getDeployment({
    idOrUrl: process.env.VERCEL_DEPLOYMENT_ID!,
  });
  console.log(currentDeployment);
  return new Response(null);
}
