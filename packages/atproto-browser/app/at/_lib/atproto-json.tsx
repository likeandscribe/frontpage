import { isDid } from "@atproto/did";
import Link from "@/lib/link";
import { getAtUriPath } from "@/lib/util";
import { AtUri } from "@atproto/syntax";
import { VideoEmbed } from "./video-embed";
import { ErrorBoundary } from "react-error-boundary";
import { VideoEmbedWrapper } from "./video-embed-client";
import { BlobRef, type LexValue } from "@atproto/lexicon";
import { CID } from "multiformats/cid";

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
          &quot;<Link href={getAtUriPath(new AtUri(data))}>{data}</Link>
          &quot;
        </>
      ) : isDid(data) ? (
        <>
          &quot;<Link href={`/at/${data}`}>{data}</Link>
          &quot;
        </>
      ) : URL.canParse(data) ? (
        <>
          &quot;
          <a href={data} rel="noopener noreferer ugc">
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
  return (
    <dl>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} style={{ display: "flex", gap: 10 }}>
          <dt>
            <pre>{key}:</pre>
          </dt>
          <dd style={{ margin: 0 }}>
            {key === "$link" && typeof value === "string" ? (
              <pre>
                <a href={`/blob/${repo}/${value}`}>{value}</a>
              </pre>
            ) : (
              <JSONValue data={value} repo={repo} />
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
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

export function JSONValue({ data, repo }: { data: LexValue; repo: string }) {
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

  if (data instanceof BlobRef) {
    const blobContent = (
      <JSONObject
        data={
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data.toJSON() as any
        }
        repo={repo}
      />
    );

    if (data.mimeType.startsWith("image/")) {
      return (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://cdn.bsky.app/img/feed_thumbnail/plain/${repo}/${data.ref}@jpeg`}
            alt=""
            width={200}
          />
          <details>
            <summary>View blob content</summary>
            {blobContent}
          </details>
        </>
      );
    }

    if (data.mimeType === "video/mp4") {
      return (
        <>
          <ErrorBoundary fallback={<VideoEmbedWrapper />}>
            <VideoEmbed cid={data.ref.toString()} did={repo} />
          </ErrorBoundary>
          <details>
            <summary>View blob content</summary>
            {blobContent}
          </details>
        </>
      );
    }

    return blobContent;
  }

  if (data instanceof CID) {
    return (
      <pre>
        <Link href={`/blob/${repo}/${data.toString()}`}>{data.toString()}</Link>
      </pre>
    );
  }

  return (
    <JSONObject
      data={
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data as any
      }
      repo={repo}
    />
  );
}

export type JSONType =
  | string
  | number
  | boolean
  | null
  | {
      [x: string]: JSONType;
    }
  | JSONType[];
