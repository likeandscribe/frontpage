import Link from "@/lib/link";
import { AtUriForm } from "./aturi-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ATProto Browser",
  description: "Browse the atmosphere.",
};

export default function Home() {
  return (
    <main>
      <h1>Enter an AT uri:</h1>
      <div style={{ maxWidth: "450px" }}>
        <AtUriForm />
      </div>
      <p>
        eg.{" "}
        <Link href="/at/did:plc:2xau7wbgdq4phuou2ypwuen7/app.bsky.feed.like/3kyutnrmg3s2r">
          at://did:plc:2xau7wbgdq4phuou2ypwuen7/app.bsky.feed.like/3kyutnrmg3s2r
        </Link>
      </p>

      <h2 style={{ marginTop: 100 }}>Supported inputs</h2>

      <ul>
        <li>
          at:// URIs eg.{" "}
          <Link href="/at/did:plc:2xau7wbgdq4phuou2ypwuen7/app.bsky.feed.like/3kyutnrmg3s2r">
            at://did:plc:2xau7wbgdq4phuou2ypwuen7/app.bsky.feed.like/3kyutnrmg3s2r
          </Link>
        </li>
        <li>
          The at:// is optional eg.{" "}
          <code>
            did:plc:2xau7wbgdq4phuou2ypwuen7/app.bsky.feed.like/3kyutnrmg3s2r
          </code>{" "}
          or <code>did:plc:2xau7wbgdq4phuou2ypwuen7</code> will work too.
        </li>
        <li>
          Handles eg. <Link href="/at/tom.sherman.is">@tom.sherman.is</Link>.
          Note, the &apos;@&apos; is optional.
        </li>
        <li>
          Bluesky posts and profile HTTPS URLs (when the author has indexing
          enabled)
        </li>
        <li>
          HTTP(s) URLs where the HTML contains a{" "}
          <code>
            {"<"}link rel=&quot;alternate&quot;{">"} with an at:// URI in the{" "}
            <code>href</code> attribute
          </code>
        </li>
        <li>
          lex URIs eg. <code>lex:app.bsky.feed.like</code>
        </li>
      </ul>

      <hr />

      <footer>
        <p>
          Developed by{" "}
          <Link href="/at/did:plc:2xau7wbgdq4phuou2ypwuen7/app.bsky.actor.profile/self">
            @tom.frontpage.team
          </Link>
          .{" "}
          <a href="https://github.com/likeandscribe/frontpage/tree/main/packages/atproto-browser">
            Source code
          </a>
        </p>
      </footer>
    </main>
  );
}
