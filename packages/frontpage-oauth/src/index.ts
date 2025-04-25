import { type OAuthClientMetadata } from "@atproto/oauth-types";

type GetClientMetadataOptions = {
  redirectUris: [string, ...string[]];
  baseUrl: string;
};

export function getClientMetadata({
  redirectUris,
  baseUrl,
}: GetClientMetadataOptions) {
  return {
    // Client ID is the URL of the client metadata
    // This isn't immediately obvious and if you supply something else the PAR request will fail with a 400 "Invalid url" error. I had to traverse the atproto implementation to find out why!
    client_id: `${baseUrl}/oauth/client-metadata.json`,
    dpop_bound_access_tokens: true,
    application_type: "web",
    subject_type: "public",
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"], // TODO: "code id_token"?
    // TODO: Tweak these?
    scope: "atproto transition:generic",
    client_name: "Frontpage",
    token_endpoint_auth_method: "private_key_jwt",
    token_endpoint_auth_signing_alg: "ES256",
    redirect_uris: redirectUris,
    client_uri: baseUrl,
    jwks_uri: `${baseUrl}/oauth/jwks.json`,
  } satisfies OAuthClientMetadata;
}
