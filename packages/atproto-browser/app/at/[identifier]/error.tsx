"use client";

import { useParams } from "next/navigation";

export default function CollectionError() {
  const params = useParams();

  return (
    <div>
      🚨 Failed to fetch{" "}
      {typeof params.identifier === "string" ? (
        <code>{decodeURIComponent(params.identifier)}</code>
      ) : (
        "actor"
      )}
      .
    </div>
  );
}
