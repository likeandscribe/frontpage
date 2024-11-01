import { navigateAtUri } from "@/lib/navigation";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const u = searchParams.get("u");
  if (!u) {
    return new Response("Missing u parameter", { status: 400 });
  }
  const result = await navigateAtUri(u);
  if ("error" in result) {
    return new Response(result.error, { status: 400 });
  }
  throw new Error("Should have redirected");
}
