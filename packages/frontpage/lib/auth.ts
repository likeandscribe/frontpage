import "server-only";
import {
  exportJWK,
  importJWK,
  SignJWT,
  jwtVerify,
  calculateJwkThumbprint,
} from "jose";
import { cache } from "react";
import { type DID, getPdsUrl, parseDid } from "./data/atproto/did";
import {
  discoveryRequest,
  processDiscoveryResponse,
  authorizationCodeGrantRequest,
  validateAuthResponse,
  protectedResourceRequest,
  revocationRequest,
  parseWwwAuthenticateChallenges,
  type Client as OauthClient,
  isOAuth2Error,
  customFetch as oauth4webapiCustomFetchSymbol,
} from "oauth4webapi";
import { cookies } from "next/headers";
import {
  oauthProtectedResourceMetadataSchema,
  oauthTokenResponseSchema,
} from "@atproto/oauth-types";
import { redirect, RedirectType } from "next/navigation";
import { db } from "./db";
import * as schema from "./schema";
import { eq } from "drizzle-orm";
import {
  getDidFromHandleOrDid,
  getVerifiedHandle,
} from "./data/atproto/identity";
import { getClientMetadata as createClientMetadata } from "@repo/frontpage-oauth";
import { getRootHost } from "./navigation";
import { invariant } from "./utils";

const USER_AGENT = "appview/@frontpage.fyi (@tom-sherman.com)";

export const getPrivateJwk = cache(() =>
  importJWK(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    JSON.parse(process.env.PRIVATE_JWK!),
    USER_SESSION_JWT_ALG,
  ),
);

export const getPublicJwk = cache(async () => {
  const jwk = await importJWK(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    JSON.parse(process.env.PUBLIC_JWK!),
    USER_SESSION_JWT_ALG,
  );
  if ("d" in jwk) {
    throw new Error("Expected public JWK, got private JWK");
  }

  return jwk;
});

export const getClientMetadata = cache(async () => {
  const host = await getRootHost();
  const frontpageUrl = `https://${host}`;
  const previewOauthClientUrl = `https://frontpage-oauth-preview-client.vercel.app/${host}`;

  // In Vercel preview deployments we point to our preview oauth client so that we can bypass vercel auth for our login.
  const appUrl =
    process.env.VERCEL_ENV === "preview" ? previewOauthClientUrl : frontpageUrl;

  return createClientMetadata({
    redirectUri: `${appUrl}/oauth/callback`,
    appUrl,
    jwksUri: `${frontpageUrl}/oauth/jwks.json`,
  });
});

export const getOauthClientOptions = async () =>
  ({
    client_id: (await getClientMetadata()).client_id,
    token_endpoint_auth_method: (await getClientMetadata())
      .token_endpoint_auth_method,
  }) satisfies OauthClient;

export async function getClientPrivateKey() {
  const jwk = await exportJWK(await getPrivateJwk());
  const kid = await calculateJwkThumbprint(jwk);
  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign"],
  );

  return { key, kid };
}

export function oauthDiscoveryRequest(url: URL) {
  return discoveryRequest(url, {
    algorithm: "oauth2",
    headers: new Headers({
      "User-Agent": USER_AGENT,
    }),
  });
}

// TODO: Split this out to match the oauth4webapi pattern of processProtectedMetadataResponse(oauthProtectedMetadataRequest())
export async function oauthProtectedMetadataRequest(did: DID) {
  const pds = await getPdsUrl(did);
  if (!pds) {
    return {
      error: "PDS_NOT_FOUND" as const,
    };
  }

  const response = await fetch(`${pds}/.well-known/oauth-protected-resource`, {
    headers: {
      "User-Agent": USER_AGENT,
    },
  });
  if (response.status !== 200) {
    return {
      error: "FAILED_TO_FETCH_METADATA" as const,
    };
  }

  const data = await response.json();

  const result = oauthProtectedResourceMetadataSchema.safeParse(data);
  if (!result.success) {
    return {
      error: "INVALID_METADATA" as const,
      cause: result.error,
    };
  }

  return { data: result.data };
}

async function deleteOauthRequest(state: string) {
  await db
    .delete(schema.OauthAuthRequest)
    .where(eq(schema.OauthAuthRequest.state, state));
}

const AUTH_COOKIE_NAME = "__auth_sesion";
const USER_SESSION_JWT_ALG = "ES256";

// This is to mimic next-auth's API, hopefully we can upstream later
export const handlers = {
  GET: async (request: Request) => {
    const url = new URL(request.url);

    if (url.pathname.endsWith("/client-metadata.json")) {
      return Response.json(await getClientMetadata());
    }

    const key = await exportJWK(await getPublicJwk());

    if (url.pathname.endsWith("/jwks.json")) {
      return Response.json({
        keys: [
          {
            ...key,
            kid: await calculateJwkThumbprint(key),
          },
        ],
      });
    }

    if (url.pathname.endsWith("/callback")) {
      const iss = url.searchParams.get("iss");
      const state = url.searchParams.get("state");
      if (!iss || !state) {
        throw new Error("Missing iss or state", { cause: { iss, state } });
      }

      // TODO: Cache this
      const authServer = await processDiscoveryResponse(
        new URL(iss),
        await oauthDiscoveryRequest(new URL(iss)),
      );

      const callbackParams = validateAuthResponse(
        authServer,
        await getOauthClientOptions(),
        url.searchParams,
        state,
      );

      if (isOAuth2Error(callbackParams)) {
        let errorMessage;
        if (callbackParams.error === "access_denied") {
          errorMessage = "You have not authorized the app. Please try again.";
        } else {
          errorMessage = "An error occurred";
        }

        // Delete row to prevent replay attacks
        await deleteOauthRequest(state);

        redirect(`/login?error=${errorMessage}`, RedirectType.replace);
      }

      const code = url.searchParams.get("code");
      if (!code || !state) {
        throw new Error("Missing code");
      }

      const [row] = await db
        .select()
        .from(schema.OauthAuthRequest)
        .where(eq(schema.OauthAuthRequest.state, state));

      if (!row) {
        return new Response("OAuth request not found", { status: 400 });
      }

      // Delete row to prevent replay attacks
      await deleteOauthRequest(state);

      if (row.iss !== iss) {
        throw new Error("Invalid issuer");
      }

      // Redundant check because of the db query, but it's good to be safe
      if (row.state !== state) {
        throw new Error("Invalid state");
      }

      const client = await getClientMetadata();
      const params = validateAuthResponse(
        authServer,
        await getOauthClientOptions(),
        url.searchParams,
        row.state,
      );

      if (!(params instanceof URLSearchParams)) {
        console.error("Invalid params", params);
        return new Response("Invalid params", { status: 400 });
      }

      const { privateDpopKey, publicDpopKey } = await importDpopJwks({
        privateJwk: row.dpopPrivateJwk,
        publicJwk: row.dpopPublicJwk,
      });

      // TODO: Use processAuthorizationCodeOAuth2Response
      const authCodeResponse = await authorizationCodeGrantRequest(
        authServer,
        await getOauthClientOptions(),
        params,
        client.redirect_uris[0],
        row.pkceVerifier,
        {
          clientPrivateKey: await getClientPrivateKey(),
          DPoP: {
            privateKey: privateDpopKey,
            publicKey: publicDpopKey,
            nonce: row.nonce,
          },
        },
      );

      if (!authCodeResponse.ok) {
        const errorText = await authCodeResponse.text();
        console.error("Auth code error: ", errorText);
        throw new Error("Failed to exchange auth code", {
          cause: errorText,
        });
      }

      const tokensResult = oauthTokenResponseSchema.safeParse(
        await authCodeResponse.json(),
      );
      if (!tokensResult.success) {
        console.error("Invalid tokens", tokensResult.error);
        throw new Error("Invalid tokens");
      }

      if (
        row.did !== "" &&
        (tokensResult.data.sub !== row.did ||
          tokensResult.data.sub !==
            (await getDidFromHandleOrDid(row.username)) ||
          row.did !== (await getDidFromHandleOrDid(row.username)))
      ) {
        // Delete row to prevent replay attacks
        await deleteOauthRequest(state);
        redirect(
          `/login?error=Naughty naughty, your ID doesn't match what we were expecting!`,
          RedirectType.replace,
        );
      }

      const tokenSub = tokensResult.data.sub;
      if (typeof tokenSub !== "string") {
        throw new Error("Invalid token sub");
      }

      // At this point tokenResult.data.sub should be the same as row.did or undefined
      // Note it's also possible for it to be empty string, but that would cause parseDid to return null
      const subjectDid = tokensResult.data.sub ? parseDid(tokenSub) : null;

      invariant(subjectDid, "Failed to parse subject DID");

      const dpopNonce = authCodeResponse.headers.get("DPoP-Nonce");

      invariant(dpopNonce, "Missing DPoP nonce");
      invariant(tokensResult.data.refresh_token, "Missing refresh token");
      invariant(tokensResult.data.expires_in, "Missing expires_in");

      const handle = row.username || (await getVerifiedHandle(subjectDid));

      invariant(handle, "Failed to get handle");

      const expiresAt = new Date(
        Date.now() + tokensResult.data.expires_in * 1000,
      );

      const { lastInsertRowid } = await db.insert(schema.OauthSession).values({
        did: subjectDid,
        username: handle,
        iss: row.iss,
        accessToken: tokensResult.data.access_token,
        refreshToken: tokensResult.data.refresh_token,
        expiresAt,
        createdAt: new Date(),
        dpopNonce,
        dpopPrivateJwk: row.dpopPrivateJwk,
        dpopPublicJwk: row.dpopPublicJwk,
      });

      if (!lastInsertRowid) {
        throw new Error("Failed to insert session");
      }

      const userToken = await new SignJWT()
        .setSubject(row.did)
        .setProtectedHeader({ alg: USER_SESSION_JWT_ALG })
        .setIssuedAt()
        .setJti(lastInsertRowid.toString())
        .setExpirationTime(expiresAt)
        .sign(
          // TODO: This probably ought to be a different key
          await getPrivateJwk(),
        );

      (await cookies()).set(AUTH_COOKIE_NAME, userToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      });

      return redirect("/", RedirectType.replace);
    }

    return new Response("Not found", { status: 404 });
  },
};

export async function signOut() {
  const session = await getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }
  const authServer = await processDiscoveryResponse(
    new URL(session.user.iss),
    await oauthDiscoveryRequest(new URL(session.user.iss)),
  );

  await revocationRequest(
    authServer,
    await getOauthClientOptions(),
    session.user.accessToken,
    {
      clientPrivateKey: await getClientPrivateKey(),
    },
  );

  await db
    .delete(schema.OauthSession)
    .where(eq(schema.OauthSession.sessionId, session.user.sessionId));

  (await cookies()).delete(AUTH_COOKIE_NAME);
}

export const getCookieJwt = cache(async () => {
  const tokenCookie = (await cookies()).get(AUTH_COOKIE_NAME);
  if (!tokenCookie || !tokenCookie.value) {
    return null;
  }

  let token;
  try {
    token = await jwtVerify(tokenCookie.value, await getPublicJwk());
  } catch (e) {
    console.error("Failed to verify token", e);
    return null;
  }

  return token;
});

export const getSession = cache(async () => {
  const token = await getCookieJwt();
  if (!token) {
    return null;
  }

  if (!token.payload.jti) {
    return null;
  }

  const [session] = await db
    .select()
    .from(schema.OauthSession)
    .where(eq(schema.OauthSession.sessionId, Number(token.payload.jti)));

  if (!session) {
    return null;
  }

  return {
    user: session,
  };
});

export async function importDpopJwks({
  privateJwk,
  publicJwk,
}: {
  privateJwk: string;
  publicJwk: string;
}) {
  const [privateDpopKey, publicDpopKey] = await Promise.all([
    crypto.subtle.importKey(
      "jwk",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      JSON.parse(privateJwk),
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      true,
      ["sign"],
    ),
    crypto.subtle.importKey(
      "jwk",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      JSON.parse(publicJwk),
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      true,
      ["verify"],
    ),
  ]);

  return {
    publicDpopKey,
    privateDpopKey,
  };
}

export async function fetchAuthenticatedAtproto(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  const session = await getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const { privateDpopKey, publicDpopKey } = await importDpopJwks({
    privateJwk: session.user.dpopPrivateJwk,
    publicJwk: session.user.dpopPublicJwk,
  });

  const makeRequest = (dpopNonce: string) => {
    // It's important to reconstruct the request because we can't send the same body readable stream twice
    const request = new Request(input, init);
    return protectedResourceRequest(
      session.user.accessToken,
      request.method,
      new URL(request.url),
      request.headers,
      request.body,
      {
        // We need a customFetch so that we can set the duplex option
        // Duplex option is needed because we're passing request.body which is a ReadableStream, trying to fetch this without the duplex option will result in a "TypeError: RequestInit: duplex option is required when sending a body." in prod (not in dev!).
        [oauth4webapiCustomFetchSymbol]: (
          input: RequestInfo | URL,
          init?: RequestInit,
        ) => {
          return fetch(input, {
            ...init,
            // @ts-expect-error https://github.com/node-fetch/node-fetch/issues/1769
            duplex: "half",
          });
        },
        DPoP: {
          privateKey: privateDpopKey,
          publicKey: publicDpopKey,
          nonce: dpopNonce,
        },
      },
    );
  };

  let response = await makeRequest(session.user.dpopNonce);

  if (response.status === 401) {
    if (
      // Expect a use_dpop_nonce error
      !parseWwwAuthenticateChallenges(response)?.some(
        (challenge) => challenge.parameters.error === "use_dpop_nonce",
      )
    ) {
      throw new Error("Not expecting error: " + (await response.text()));
    }

    const dpopNonce2 = response.headers.get("DPoP-Nonce");
    if (!dpopNonce2) {
      throw new Error("Missing DPoP nonce");
    }

    response = await makeRequest(dpopNonce2);
  }

  const dpopNonce = response.headers.get("DPoP-Nonce");
  if (!dpopNonce) {
    throw new Error("Missing DPoP nonce");
  }

  await db
    .update(schema.OauthSession)
    .set({
      dpopNonce,
    })
    .where(eq(schema.OauthSession.sessionId, session.user.sessionId));

  return response;
}
