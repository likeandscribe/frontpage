import { JSONType, JSONValue } from "@/app/at/_lib/atproto-json";
import { resolveNsidAuthority, resolveIdentity } from "@/lib/atproto-server";
import Link from "@/lib/link";
import { getHandle, getKey, getPds } from "@atproto/identity";
import {
  InvalidLexiconError,
  LexValue,
  LexiconDefNotFoundError,
  LexiconDoc,
  Lexicons,
  lexiconDoc,
} from "@atproto/lexicon";
import { AtpBaseClient, ComAtprotoRepoGetRecord } from "@atproto/api";
import { verifyRecords } from "@atproto/repo";
import React, { cache, Fragment, ReactNode, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { z } from "zod";
import { AtUri, InvalidNsidError, NSID } from "@atproto/syntax";
import { resolveNSIDs } from "@lpm/core";
import { getAtUriPath } from "@/lib/util";

export default async function RkeyPage(props: {
  params: Promise<{
    identifier: string;
    collection: string;
    rkey: string;
  }>;
}) {
  const params = await props.params;
  const identityResult = await resolveIdentity(params.identifier);
  if (!identityResult.success) {
    return <div>🚨 {identityResult.error}</div>;
  }
  const didDocument = identityResult.didDocument;
  const handle = getHandle(didDocument);
  if (!handle) {
    return <div>🚨 No handle found for DID: {didDocument.id}</div>;
  }
  const pds = getPds(didDocument);
  if (!pds) {
    return <div>🚨 No PDS found for DID: {didDocument.id}</div>;
  }

  const getRecordResult = await getRecord(
    didDocument.id,
    params.collection,
    params.rkey,
  );

  if (!getRecordResult.success) {
    return <div>🚨 Failed to fetch record: {getRecordResult.error}</div>;
  }

  return (
    <>
      <link
        rel="alternate"
        href={`at://${identityResult.didDocument.id}/${params.collection}/${params.rkey}`}
      />
      <h2>
        Record{" "}
        <ErrorBoundary
          fallback={<span title="Error verifying record.">🤔</span>}
        >
          <Suspense
            fallback={
              <span title="Verifying record..." aria-busy>
                🤔
              </span>
            }
          >
            <RecordVerificationBadge
              did={didDocument.id}
              collection={params.collection}
              rkey={params.rkey}
            />
          </Suspense>
        </ErrorBoundary>
      </h2>
      <div>
        <small style={{ opacity: 0.5 }}>
          cid: <code>{getRecordResult.record.cid}</code>
        </small>
      </div>
      {params.collection === "com.atproto.lexicon.schema" ? (
        <ErrorBoundary fallback={<div>❌ Error verifying lexicon</div>}>
          <Suspense fallback={<div>Verifying lexicon...</div>}>
            <LexiconDefinitionVerification
              did={identityResult.didDocument.id}
              nsid={params.rkey}
            />
          </Suspense>
        </ErrorBoundary>
      ) : null}

      <ErrorBoundary
        fallback={
          <details>
            <summary>❌ Error validating lexicon</summary>
            <div>An unknown error occurred</div>
          </details>
        }
      >
        <Suspense
          fallback={
            <details aria-busy>
              <summary>🤔 Validating against lexicon...</summary>
            </details>
          }
        >
          <RecordValidation
            did={didDocument.id}
            collection={params.collection}
            rkey={params.rkey}
          />
        </Suspense>
      </ErrorBoundary>

      <JSONValue data={getRecordResult.record.value} repo={didDocument.id} />
      <small>
        <a href={getRecordResult.url} rel="ugc">
          View raw record response
        </a>
      </small>
    </>
  );
}

async function RecordVerificationBadge({
  did,
  collection,
  rkey,
}: {
  did: string;
  collection: string;
  rkey: string;
}) {
  const identityResult = await resolveIdentity(did);
  if (!identityResult.success) {
    throw new Error(identityResult.error);
  }
  const didDoc = identityResult.didDocument;
  const pds = getPds(didDoc);
  if (!pds) {
    return <span title="Invalid record (no pds)">❌</span>;
  }

  const verifyRecordsUrl = new URL(`${pds}/xrpc/com.atproto.sync.getRecord`);
  verifyRecordsUrl.searchParams.set("did", did);
  verifyRecordsUrl.searchParams.set("collection", collection);
  verifyRecordsUrl.searchParams.set("rkey", rkey);

  const response = await fetch(verifyRecordsUrl, {
    headers: {
      accept: "application/vnd.ipld.car",
    },
  });

  if (!response.ok) {
    return (
      <span title={`Invalid record (failed to fetch ${await response.text()})`}>
        ❌
      </span>
    );
  }
  const proofBytes = new Uint8Array(await response.arrayBuffer());
  const key = getKey(didDoc);
  if (!key) {
    return <span title="Invalid record (no key)">❌</span>;
  }

  // No need to worry about sequential requests here, should have already been fetched and in the cache
  const recordResult = await getRecord(did, collection, rkey);
  if (!recordResult.success) {
    throw new Error(recordResult.error);
  }

  try {
    const [claim] = await verifyRecords(proofBytes, did, key);
    if (!claim || !claim.record) {
      return <span title="Invalid record (no record)">❌</span>;
    }

    // Whether we compare bytes or JSON or object value (ie. key order independent) isn't specced out.
    // We decide to compare by object "contents" (key order independent) here. This results in the check that we want which is to make sure that no one has tampered with the JSON representation of the record.
    if (
      !compareJson(
        // Converting to plain object because some values are classes (eg. CIDs)
        JSON.parse(JSON.stringify(claim.record)),
        JSON.parse(JSON.stringify(recordResult.record?.value)),
      )
    ) {
      return (
        <div style={{ display: "inline-block" }}>
          <span title="Invalid record (mismatch)">❌</span>
        </div>
      );
    }
  } catch (e) {
    if (e instanceof Error) {
      return <span title={`Invalid record (${e.message})`}>❌</span>;
    } else {
      return <span title="Invalid record (unknown)">❌</span>;
    }
  }

  return <span title="Valid record">🔒</span>;
}

type GetRecordResult =
  | {
      success: true;
      url: string;
      record: {
        uri: string;
        cid?: string;
        value: LexValue;
      };
    }
  | {
      success: false;
      error: string;
    };

/**
 * Errors thrown in this function shuould be invariants that are checked before the function is called.
 */
const getRecord = cache(
  async (
    did: string,
    collection: string,
    rkey: string,
  ): Promise<GetRecordResult> => {
    const identityResult = await resolveIdentity(did);
    if (!identityResult.success) {
      throw new Error(identityResult.error);
    }

    const didDocument = identityResult.didDocument;

    const pds = getPds(didDocument);
    if (!pds) {
      throw new Error("No PDS found for DID");
    }

    const atpClient = new AtpBaseClient((url, init) =>
      fetch(new URL(url, pds), init),
    );

    let response;

    try {
      response = await atpClient.com.atproto.repo.getRecord({
        repo: didDocument.id,
        collection,
        rkey,
      });
    } catch (e) {
      if (e instanceof ComAtprotoRepoGetRecord.RecordNotFoundError) {
        return {
          success: false as const,
          error: "RecordNotFound",
        };
      }

      throw e;
    }

    return {
      success: true as const,
      record: response.data,
      url: `${pds}/xrpc/com.atproto.repo.getRecord?repo=${didDocument.id}&collection=${collection}&rkey=${rkey}`,
    };
  },
);

const JsonTypeSchema: z.ZodType<JSONType> = z.lazy(() =>
  z.union([
    z.record(JsonTypeSchema),
    z.array(JsonTypeSchema),
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
  ]),
);

const RecordValueSchema = z.object({
  uri: z.string(),
  cid: z.string(),
  value: JsonTypeSchema,
});

const GetRecordFailure = z.object({
  error: z.string(),
  message: z.string().optional(),
});

/**
 * Compare objects deeply, ignoring key order.
 */
function compareJson(a: unknown, b: unknown): boolean {
  if (typeof a !== typeof b) {
    return false;
  }

  if (typeof a !== "object") {
    return a === b;
  }

  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }

  if (Array.isArray(a)) {
    if (a.length !== (b as unknown[]).length) {
      return false;
    }

    return a.every((item, index) => compareJson(item, (b as unknown[])[index]));
  }

  if (a == null || b == null) {
    return a === b;
  }

  const aKeys = Object.keys(a);

  if (aKeys.length !== Object.keys(b).length) {
    return false;
  }

  return aKeys.every((key) => {
    // @ts-expect-error - We know a and b are indexable (not null)
    return compareJson(a[key], b[key]);
  });
}

async function LexiconDefinitionVerification({
  nsid: nsidStr,
  did,
}: {
  nsid: string;
  did: string;
}) {
  let nsid;
  try {
    nsid = NSID.parse(nsidStr);
  } catch (e) {
    if (e instanceof InvalidNsidError) {
      return <div>❌ Invalid lexicon: {e.message}</div>;
    } else {
      throw e;
    }
  }
  const result = await resolveNsidAuthority(nsid);

  return (
    <div style={{ marginTop: "1em" }}>
      {result.success
        ? result.authorityDid === did
          ? "✅ Verified lexicon"
          : `❌ Unverified lexicon: ${result.authorityDid}`
        : `❌ Unverified lexicon: ${result.error}`}
    </div>
  );
}

async function RecordValidation({
  did,
  collection,
  rkey,
}: {
  did: string;
  collection: string;
  rkey: string;
}) {
  const successfulSteps: ReactNode[] = [];

  let nsid;
  try {
    nsid = NSID.parse(collection);
  } catch (e) {
    if (e instanceof InvalidNsidError) {
      return (
        <RecordValidationResult error={e.message} steps={successfulSteps} />
      );
    } else {
      throw e;
    }
  }

  const nsidAuthorityResult = await resolveNsidAuthority(nsid);

  if (!nsidAuthorityResult.success) {
    return (
      <RecordValidationResult
        error={nsidAuthorityResult.error}
        steps={successfulSteps}
      />
    );
  }

  successfulSteps.push(
    <li>Fetched authority: {nsidAuthorityResult.authorityDid}</li>,
  );

  const lexiconRecordResult = await getRecord(
    nsidAuthorityResult.authorityDid,
    "com.atproto.lexicon.schema",
    nsid.toString(),
  );

  if (!lexiconRecordResult.success) {
    return (
      <details>
        <summary>❌ Record not validated</summary>
        <pre>{lexiconRecordResult.error}</pre>
      </details>
    );
  }

  successfulSteps.push(
    <li>
      Fetched lexicon doc{" "}
      <Link href={`/at?u=${lexiconRecordResult.record.uri}`}>
        {lexiconRecordResult.record.uri}
      </Link>
    </li>,
  );

  const schemaResult = lexiconDoc.safeParse(
    omit(lexiconRecordResult.record.value as Record<string, unknown>, [
      "$type",
    ]),
  );

  if (!schemaResult.success) {
    return (
      <RecordValidationResult
        error={
          <>
            Failed to parse lexicon doc: <pre>{schemaResult.error.message}</pre>
          </>
        }
        steps={successfulSteps}
      />
    );
  }

  const resolvedLexicon = await resolveLexiconDocs(
    nsidAuthorityResult.authorityDid,
    nsid,
  );

  successfulSteps.push(
    <li>
      Resolved {resolvedLexicon.successes.length} docs:{" "}
      <ul>
        {resolvedLexicon.successes.map((resolution, i) => (
          <li key={i}>
            <Link href={getAtUriPath(resolution.uri)}>
              {resolution.uri.rkey}
            </Link>
          </li>
        ))}
      </ul>
    </li>,
  );

  if (resolvedLexicon.errors.length > 0) {
    return (
      <RecordValidationResult
        error={
          <ul>
            {resolvedLexicon.errors.map((error, i) => (
              <li key={i}>
                <pre>
                  {error.nsid.toString()}: {error.error}
                </pre>
              </li>
            ))}
          </ul>
        }
        steps={successfulSteps}
      />
    );
  }

  const lexicons = new Lexicons(resolvedLexicon.successes.map((r) => r.doc));

  const recordResult = await getRecord(did, collection, rkey);
  if (!recordResult.success) {
    // This should never happen, as we should have already fetched the record
    throw new Error(recordResult.error);
  }

  const record = recordResult.record;

  let validationResult;
  try {
    validationResult = lexicons.validate(collection, record.value);
  } catch (e) {
    return (
      <RecordValidationResult
        error={
          e instanceof InvalidLexiconError ||
          e instanceof LexiconDefNotFoundError
            ? `Error validating record: ${e.message}`
            : "Unknown error occurred calling validate()"
        }
        steps={successfulSteps}
      />
    );
  }

  if (!validationResult.success) {
    return (
      <RecordValidationResult
        error={validationResult.error.message}
        steps={successfulSteps}
      />
    );
  }

  return <RecordValidationResult steps={successfulSteps} />;
}

function RecordValidationResult({
  error,
  steps,
}: {
  error?: ReactNode;
  steps: ReactNode[];
}) {
  return (
    <details>
      <summary>
        {error ? "❌ Record not validated" : "✅ Record validated"}
      </summary>
      <ul>
        {steps.map((step, i) => (
          <Fragment key={i}>{step}</Fragment>
        ))}
        {error ? <li>{error}</li> : null}
      </ul>
    </details>
  );
}

function omit(
  obj: Record<string, unknown>,
  keys: string[],
): Record<string, unknown> {
  const copy = { ...obj };
  for (const key of keys) {
    delete copy[key];
  }
  return copy;
}

async function resolveLexiconDocs(
  did: string,
  nsid: NSID,
): Promise<{
  successes: Array<{
    doc: LexiconDoc;
    uri: AtUri;
  }>;
  errors: {
    nsid: NSID;
    error: string;
  }[];
}> {
  const resolutions = [];
  for await (const resolution of resolveNSIDs([nsid.toString()])) {
    resolutions.push(resolution);
  }

  const successes = resolutions.filter((resolution) => resolution.success);
  const errors = resolutions
    .filter((resolution) => !resolution.success)
    .map((resolution) => ({
      error: resolution.errorCode,
      nsid: resolution.nsid,
    }));

  const mainResolution = resolutions.find(
    (resolution) =>
      resolution.success &&
      resolution.nsid.toString() === nsid.toString() &&
      resolution.uri.host === did,
  );

  if (!mainResolution) {
    throw new Error("Main resolution not found");
  }

  return {
    successes,
    errors,
  };
}
