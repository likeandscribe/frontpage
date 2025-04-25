import { isHostPartOfCurrentVercelTeam } from "@/lib/check-host";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ host: string }> },
) {
  const host = (await params).host;
  if (!host) {
    return new Response("Not found", { status: 404 });
  }

  if (!(await isHostPartOfCurrentVercelTeam(host))) {
    return new Response("Not found", { status: 404 });
  }

  const url = new URL(request.url);
  url.host = host;
  url.pathname = "/oauth/callback";
  if (process.env.NODE_ENV === "development") {
    url.port = "";
  }

  return new Response(
    `<html>
      <head>
        <meta http-equiv="refresh" content="0; url=${url.toString()}" />
      </head>
    </html>`,
    {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    },
  );
}
