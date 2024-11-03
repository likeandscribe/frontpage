import { markNotificationRead } from "@/lib/data/db/notification";
import { ensureUser } from "@/lib/data/user";

export async function POST(request: Request) {
  await ensureUser();
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id === null) {
    return Response.json({ error: "Missing id parameter" }, { status: 400 });
  }

  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    return Response.json({ error: "Invalid id parameter" }, { status: 400 });
  }

  await markNotificationRead(parsedId);
  return new Response(null, { status: 204 });
}
