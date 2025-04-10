import {
  Heading1,
  Paragraph,
  Heading2,
  TextLink,
} from "@/lib/components/ui/typography";
import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "About Frontpage",
  description: "Learn about Frontpage and our community guidelines.",
  openGraph: {
    title: "About Frontpage",
    description: "Learn about Frontpage and our community guidelines.",
  },
};

export default function CommunityGuidelinesPage() {
  return (
    <>
      <Heading1>About Frontpage</Heading1>
      <Paragraph>
        Frontpage is a decentralised and federated link aggregator that&apos;s
        built on the same protocol as Bluesky.
      </Paragraph>
      <Heading2>Community Guidelines</Heading2>
      <Paragraph>
        We want Frontpage to be a safe and welcoming place for everyone. And so
        we ask that you follow these guidelines:
      </Paragraph>
      <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">
        <li>
          Don&apos;t post hate speech, harassment, or other forms of abuse.
        </li>
        <li>Don&apos;t post content that is illegal or harmful.</li>
        <li>Don&apos;t post adult content*.</li>
      </ol>
      <small className="text-sm font-medium leading-none">
        * this is a temporary guideline while we build labeling and content
        warning features.
      </small>
      <Paragraph>
        Frontpage is moderated by it&apos;s core developers, but we also rely on
        reports from users to help us keep the community safe. Please report any
        content that violates our guidelines.
      </Paragraph>
      <Heading2 id="contact">Contact</Heading2>
      <Paragraph>
        Email us at{" "}
        <TextLink href="mailto:team@frontpage.fyi">team@frontpage.fyi</TextLink>
        .
      </Paragraph>
    </>
  );
}
