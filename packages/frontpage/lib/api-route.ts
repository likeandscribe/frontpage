import "server-only";

export type Context = {
  headers: Headers;
};

export type ApiRouteHandler<JsonBody> = (
  request: Request,
  ctx: Context,
) => JsonBody | Promise<JsonBody>;

type TypedResponse<JsonBody> = Response & { _t: JsonBody };

export type ApiRouteResponse<
  ApiRoute extends (req: Request) => Promise<TypedResponse<unknown>>,
> =
  Awaited<ReturnType<ApiRoute>> extends TypedResponse<infer JsonBody>
    ? JsonBody
    : never;

class ResponseError {
  constructor(public response: Response) {}
}

export function badRequest(message: string, init?: RequestInit): never {
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  throw new ResponseError(new Response(message, { ...init, status: 400 }));
}

export function unauthorized(message: string, init?: RequestInit): never {
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  throw new ResponseError(new Response(message, { ...init, status: 401 }));
}

export function createApiRoute<JsonBody>(
  handler: (request: Request, ctx: Context) => JsonBody | Promise<JsonBody>,
) {
  return async function (request: Request) {
    const headers = new Headers();
    let body;
    try {
      body = await handler(request, { headers });
    } catch (error) {
      if (error instanceof ResponseError) {
        return error.response as TypedResponse<JsonBody>;
      }
      throw error;
    }

    headers.set("Content-Type", "application/json");
    return new Response(JSON.stringify(body), {
      headers,
    }) as TypedResponse<JsonBody>;
  };
}
