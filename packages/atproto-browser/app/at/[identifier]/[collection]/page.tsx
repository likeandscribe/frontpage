import { listRecords } from "@/lib/atproto";
import { resolveIdentity } from "@/lib/atproto-server";
import { getPds } from "@atproto/identity";
import Link from "@/lib/link";
import { SWRConfig } from "swr";
import { CollectionItems } from "../../_lib/collection";

export default async function CollectionPage(props: {
  params: Promise<{ identifier: string; collection: string }>;
}) {
  const params = await props.params;
  const identityResult = await resolveIdentity(params.identifier);
  if (!identityResult.success) {
    return <div>{identityResult.error}</div>;
  }
  const { didDocument } = identityResult;
  const pds = getPds(didDocument);
  if (!pds) {
    return <div>🚨 No PDS found for DID: {didDocument.id}</div>;
  }

  const fetchKey =
    `listCollections/collection:${params.collection}/cursor:none` as const;

  return (
    <div>
      <link
        rel="alternate"
        href={`at://${identityResult.didDocument.id}/${params.collection}`}
      />
      <h1>
        {params.collection} records{" "}
        <Link
          href={`/collection-rss?u=at://${params.identifier}/${params.collection}`}
          title="RSS feed"
        >
          🛜
        </Link>
      </h1>
      <ul>
        <SWRConfig
          value={{
            fallback: {
              [fetchKey]: listRecords(pds, didDocument.id, params.collection),
            },
          }}
        >
          <CollectionItems
            collection={params.collection}
            pds={pds}
            repo={didDocument.id}
            fetchKey={fetchKey}
          />
        </SWRConfig>
      </ul>
    </div>
  );
}
