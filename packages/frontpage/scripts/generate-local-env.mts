const keyPair = await crypto.subtle.generateKey(
  {
    name: "ECDSA",
    namedCurve: "P-256",
  },
  true,
  ["sign", "verify"],
);

const [privateKey, publicKey] = await Promise.all(
  [keyPair.privateKey, keyPair.publicKey].map((key) =>
    crypto.subtle.exportKey("jwk", key),
  ),
);

console.log(
  `PRIVATE_JWK='${JSON.stringify(privateKey)}'
PUBLIC_JWK='${JSON.stringify(publicKey)}'
DRAINPIPE_CONSUMER_SECRET=secret
TURSO_CONNECTION_URL=libsql://turso.dev.unravel.fyi
PLC_DIRECTORY_URL=https://plc.dev.unravel.fyi`,
);
