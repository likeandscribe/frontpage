import Link from "@/lib/link";
import { AtUriForm } from "./aturi-form";
import type { Metadata } from "next";
import { EXAMPLE_PATH } from "@/app/consts";

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
        eg. <Link href={`/at/${EXAMPLE_PATH}`}>at://{EXAMPLE_PATH}</Link>
      </p>

      <footer>
        <p>
          Developed by
          <Link href="/at/did:plc:2xau7wbgdq4phuou2ypwuen7/app.bsky.actor.profile/self">
            @tom.frontpage.team
          </Link>
          .
          <a href="https://github.com/likeandscribe/frontpage/tree/main/packages/atproto-browser">
            Source code
          </a>
        </p>
      </footer>
    </main>
  );
}
