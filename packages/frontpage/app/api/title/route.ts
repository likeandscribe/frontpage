import { badRequest, createApiRoute } from "@/lib/api-route";
import articleTitle from "@/lib/title"
export const GET = createApiRoute(async (request) => {
    const url = new URL(request.url);
    const remote_url = url.searchParams.get("url")!;
    const response = await fetch(remote_url)
    const body = await response.text()
    const title: string = articleTitle(body)
    return title
});
