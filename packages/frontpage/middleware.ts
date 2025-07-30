import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import {
  processDiscoveryResponse,
  refreshTokenGrantRequest,
  processRefreshTokenResponse,
} from "oauth4webapi";
import { db } from "./lib/db";
import * as schema from "./lib/schema";
import {
  getClientPrivateKey,
  getOauthClientOptions,
  getSession,
  importDpopJwks,
  signOut,
  oauthDiscoveryRequest,
  getAuthCookie,
  setAuthCookie,
} from "./lib/auth";

export async function middleware(request: NextRequest) {
  const cookieJwt = await getAuthCookie();
  if (!cookieJwt) {
    return NextResponse.next();
  }

  // This check is for old cookies that don't have the exp field set
  // Can be removed after a while (when all old cookies are expired)
  if (!cookieJwt.payload.token_exp) {
    console.warn("No token_exp in cookie jwt, signing out");
    await signOut();
    return NextResponse.next();
  }

  if (cookieJwt.payload.token_exp < new Date().getTime() - 500) {
    const session = await getSession();
    if (!session) {
      return NextResponse.next();
    }

    const authServer = await processDiscoveryResponse(
      new URL(session.user.iss),
      await oauthDiscoveryRequest(new URL(session.user.iss)),
    );

    const client = await getOauthClientOptions();

    const { privateDpopKey, publicDpopKey } = await importDpopJwks({
      privateJwk: session.user.dpopPrivateJwk,
      publicJwk: session.user.dpopPublicJwk,
    });

    let response = await refreshTokenGrantRequest(
      authServer,
      client,
      session.user.refreshToken,
      {
        clientPrivateKey: await getClientPrivateKey(),
        DPoP: {
          privateKey: privateDpopKey,
          publicKey: publicDpopKey,
          nonce: session.user.dpopNonce,
        },
      },
    );

    let result = await processRefreshTokenResponse(
      authServer,
      client,
      response,
    );

    if ("error" in result && result.error == "use_dpop_nonce") {
      const nonce = response.headers.get("DPoP-Nonce");
      if (!nonce) {
        throw new Error("Missing DPoP nonce");
      }
      response = await refreshTokenGrantRequest(
        authServer,
        client,
        session.user.refreshToken,
        {
          clientPrivateKey: await getClientPrivateKey(),
          DPoP: {
            privateKey: privateDpopKey,
            publicKey: publicDpopKey,
            nonce: nonce,
          },
        },
      );

      result = await processRefreshTokenResponse(authServer, client, response);
    }

    if (
      "error" in result &&
      result.error === "invalid_grant" &&
      result.error_description === "refresh token replayed"
    ) {
      // Concurrent refresh token replayed, just ignore for now
      console.warn("Concurrent refresh token replayed");
      return NextResponse.next();
    }

    if ("error" in result) {
      // Logout and show error
      console.error("session corrupt, logging out", result);
      await signOut();
      const response = NextResponse.redirect(new URL("/login", request.url), {
        status: 307,
        headers: NextResponse.next().headers,
      });
      return response;
    }

    const dpopNonce = response.headers.get("DPoP-Nonce");
    if (!dpopNonce) {
      throw new Error("Missing DPoP nonce");
    }

    if (result.expires_in == null) {
      throw new Error("Missing expires_in");
    }

    const expiresAt = new Date(Date.now() + result.expires_in * 1000);

    await db
      .update(schema.OauthSession)
      .set({
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
        expiresAt,
        dpopNonce,
      })
      .where(eq(schema.OauthSession.sessionId, session.user.sessionId));

    await setAuthCookie({
      jti: String(session.user.sessionId),
      sub: session.user.did,
      token_exp: expiresAt.getTime(),
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
