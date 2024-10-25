export function LinkAlternateAtUri({
  authority,
  collection,
  rkey,
}: {
  authority: string;
  collection?: string;
  rkey?: string;
}) {
  return (
    <link
      rel="alternate"
      href={`at://${[authority, collection, rkey].filter(Boolean).join("/")}`}
    />
  );
}
