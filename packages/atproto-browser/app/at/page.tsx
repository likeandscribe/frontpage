import {
  DidResolver,
  getHandle,
  getKey,
  getPds,
  HandleResolver,
} from "@atproto/identity";
import { AtUri, isValidHandle } from "@atproto/syntax";
import { isDid } from "@atproto/did";
import { cache, Suspense } from "react";
import Link from "next/link";
import { AtBlob } from "./_lib/at-blob";
import { CollectionItems } from "./_lib/collection";
import { SWRConfig } from "swr";
import { listRecords } from "@/lib/atproto";
import { verifyRecords } from "@atproto/repo";

const didResolver = new DidResolver({});
const resolveDid = cache((did: string) => didResolver.resolve(did));
const handleResolver = new HandleResolver({});
const resolveHandle = cache((handle: string) => handleResolver.resolve(handle));

export default async function AtPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const uri = new AtUri(searchParams.u!);

  let didStr;
  if (isValidHandle(uri.hostname)) {
    didStr = await resolveHandle(uri.hostname);
    if (!didStr) {
      return <div>Could not resolve handle from did: {uri.hostname}</div>;
    }
  } else {
    if (!isDid(uri.hostname)) {
      return <div>Invalid DID: {uri.hostname}</div>;
    }
    didStr = uri.hostname;
  }

  const didDocument = await resolveDid(didStr);
  if (!didDocument) {
    return <div>Could not resolve DID: {didStr}</div>;
  }
  const pds = getPds(didDocument);
  if (!pds) {
    return <div>No PDS found for DID: {didDocument.id}</div>;
  }

  const handle = getHandle(didDocument) ?? `<invalid handle>`;

  if (uri.pathname === "/" || uri.pathname === "") {
    return (
      <>
        <h1>
          {handle} ({didDocument.id})
        </h1>
        <Author did={didStr} />
      </>
    );
  }

  if (!uri.rkey) {
    const fetchKey =
      `listCollections/collection:${uri.collection}/cursor:none` as const;
    return (
      <div>
        <h1>
          {handle}&apos;s {uri.collection} records
        </h1>
        <ul>
          <SWRConfig
            value={{
              fallback: {
                [fetchKey]: listRecords(pds, didDocument.id, uri.collection),
              },
            }}
          >
            <CollectionItems
              collection={uri.collection}
              pds={pds}
              repo={didDocument.id}
              fetchKey={fetchKey}
            />
          </SWRConfig>
        </ul>
      </div>
    );
  }

  const getRecordUrl = new URL(`${pds}/xrpc/com.atproto.repo.getRecord`);
  getRecordUrl.searchParams.set("repo", didDocument.id);
  getRecordUrl.searchParams.set("collection", uri.collection);
  getRecordUrl.searchParams.set("rkey", uri.rkey);

  const response = await fetch(getRecordUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return (
      <div>
        Failed to fetch record: {response.statusText}. URL:{" "}
        {getRecordUrl.toString()}
      </div>
    );
  }

  const record = (await response.json()) as JSONType;

  return (
    <div>
      <details>
        <summary>
          Author: {handle} (<Link href={`/at?u=at://${didStr}/`}>{didStr}</Link>
          )
        </summary>
        <Suspense>
          <Author did={didStr} />
        </Suspense>
      </details>
      <h2>
        Record
        <Suspense
          fallback={
            <span title="Verifying record..." aria-busy>
              🤔
            </span>
          }
        >
          <RecordVerificationBadge
            did={didStr}
            collection={uri.collection}
            rkey={uri.rkey}
          />
        </Suspense>
      </h2>
      <JSONValue data={record} repo={didDocument.id} />
    </div>
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
  const didDoc = (await resolveDid(did))!;
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
  const car = new Uint8Array(await response.arrayBuffer());
  const key = getKey(didDoc);
  if (!key) {
    return <span title="Invalid record (no key)">❌</span>;
  }

  try {
    await verifyRecords(car, did, key);
    return <span title="Valid record">✅</span>;
  } catch (e) {
    if (e instanceof Error) {
      return <span title={`Invalid record (${e.message})`}>❌</span>;
    } else {
      return <span title="Invalid record (unknown)">❌</span>;
    }
  }
}

async function Author({ did }: { did: string }) {
  const didDocument = await resolveDid(did);
  if (!didDocument) {
    throw new Error(`Could not resolve DID: ${did}`);
  }
  const pds = getPds(didDocument);
  if (!pds) {
    throw new Error(`No PDS found for DID: ${didDocument.id}`);
  }

  const describeRepoUrl = new URL(`${pds}/xrpc/com.atproto.repo.describeRepo`);
  describeRepoUrl.searchParams.set("repo", didDocument.id);
  const response = await fetch(describeRepoUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return (
      <div>
        Failed to fetch collections: {response.statusText}. URL:{" "}
        {describeRepoUrl.toString()}
      </div>
    );
  }

  const { collections } = (await response.json()) as {
    collections: string[];
  };

  return (
    <>
      <h2>Collections</h2>
      <ul>
        {collections.length === 0 ? (
          <p>No collections.</p>
        ) : (
          collections.map((nsid) => {
            const collectionUri = `at://${[did, nsid].join("/")}`;

            return (
              <li key={nsid}>
                <Link href={`/at?u=${collectionUri}`}>{nsid}</Link>
              </li>
            );
          })
        )}
      </ul>
      <h2>DID Doc</h2>
      <JSONValue data={didDocument as JSONType} repo={did} />
    </>
  );
}

function naiveAtUriCheck(atUri: string) {
  if (!atUri.startsWith("at://")) {
    return false;
  }

  // Check there is no whitespace in the URI
  return atUri.split(" ").length === 1;
}

function JSONString({ data }: { data: string }) {
  return (
    <pre
      style={{
        color: "darkgreen",
      }}
    >
      {naiveAtUriCheck(data) ? (
        <>
          &quot;<Link href={`/at?u=${data}`}>{data}</Link>
          &quot;
        </>
      ) : isDid(data) ? (
        <>
          &quot;<Link href={`/at?u=at://${data}`}>{data}</Link>
          &quot;
        </>
      ) : URL.canParse(data) ? (
        <>
          &quot;
          <a href={data} rel="noopener noreferer">
            {data}
          </a>
          &quot;
        </>
      ) : (
        `"${data}"`
      )}
    </pre>
  );
}

function JSONNumber({ data }: { data: number }) {
  return (
    <pre
      style={{
        color: "darkblue",
      }}
    >
      {data}
    </pre>
  );
}

function JSONBoolean({ data }: { data: boolean }) {
  return (
    <pre
      style={{
        color: "darkblue",
      }}
    >
      {data ? "true" : "false"}
    </pre>
  );
}

function JSONNull() {
  return (
    <pre
      style={{
        color: "darkgray",
      }}
    >
      null
    </pre>
  );
}

function JSONObject({
  data,
  repo,
}: {
  data: { [x: string]: JSONType };
  repo: string;
}) {
  const rawObj = (
    <dl>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} style={{ display: "flex", gap: 10 }}>
          <dt>
            <pre>{key}:</pre>
          </dt>
          <dd style={{ margin: 0 }}>
            <JSONValue data={value} repo={repo} />
          </dd>
        </div>
      ))}
    </dl>
  );

  const parseBlobResult = AtBlob.safeParse(data);
  if (
    parseBlobResult.success &&
    parseBlobResult.data.mimeType.startsWith("image/")
  ) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://cdn.bsky.app/img/feed_thumbnail/plain/${repo}/${parseBlobResult.data.ref.$link}@jpeg`}
          alt=""
          width={200}
        />
        <details>
          <summary>View blob content</summary>
          {rawObj}
        </details>
      </>
    );
  }

  return rawObj;
}

function JSONArray({ data, repo }: { data: JSONType[]; repo: string }) {
  return (
    <ul>
      {data.map((value, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <li key={index}>
          <JSONValue data={value} repo={repo} />
        </li>
      ))}
    </ul>
  );
}

function JSONValue({ data, repo }: { data: JSONType; repo: string }) {
  if (typeof data === "string") {
    return <JSONString data={data} />;
  }
  if (typeof data === "number") {
    return <JSONNumber data={data} />;
  }
  if (typeof data === "boolean") {
    return <JSONBoolean data={data} />;
  }
  if (data === null) {
    return <JSONNull />;
  }
  if (Array.isArray(data)) {
    return <JSONArray data={data} repo={repo} />;
  }
  return <JSONObject data={data} repo={repo} />;
}

type JSONType =
  | string
  | number
  | boolean
  | null
  | {
      [x: string]: JSONType;
    }
  | JSONType[];
