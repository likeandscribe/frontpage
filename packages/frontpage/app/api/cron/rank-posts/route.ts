import { db } from "@/lib/db";
import { sendDiscordMessage } from "@/lib/discord";
import type { NextRequest } from "next/server";
import * as schema from "@/lib/schema";
import { sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    await sendDiscordMessage({
      embeds: [
        {
          title: "Unauthorized request to cron endpoint",
          description: `Request: ${request.url}`,
          color: 16711680,
        },
      ],
    });
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  try {
    await db.update(schema.Post).set({
      hotScore: sql`
          CAST(COALESCE(${schema.Post.voteCount}, 1) AS REAL) / (
            pow(
              (JULIANDAY('now') - JULIANDAY(${schema.Post.createdAt})) * 24 + 2,
              1.8
            )
          )
        `,
    });
  } catch (e) {
    await sendDiscordMessage({
      embeds: [
        {
          title: "Error ranking posts",
          description: e instanceof Error ? e.message : "Unknown error",
          color: 16711680,
        },
      ],
    });
    return new Response("Error", {
      status: 500,
    });
  }

  return Response.json({ success: true });
}
