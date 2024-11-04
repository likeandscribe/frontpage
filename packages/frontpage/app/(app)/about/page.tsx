import { ReactNode } from "react";

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

      <ol className="my-6 ml-6 list-disc [&>li]:mt-2">
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
    </>
  );
}

function Heading1({ children }: { children: ReactNode }) {
  return (
    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
      {children}
    </h1>
  );
}

function Heading2({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2
      id={id}
      className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"
    >
      {children}
    </h2>
  );
}

function Paragraph({ children }: { children: ReactNode }) {
  return <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>;
}
