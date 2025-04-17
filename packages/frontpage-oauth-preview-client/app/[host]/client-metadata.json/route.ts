import { Vercel } from "@vercel/sdk";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ host: string[] }> },
) {
  console.log(await params);

  return new Response(null);
}
