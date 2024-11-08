import { test, vi, expect, describe, afterAll } from "vitest";
import { navigateAtUri } from "./navigation";

vi.mock("server-only", () => {
  return {
    // mock server-only module
  };
});

class RedirectError extends Error {
  constructor(public readonly location: string) {
    super(`Redirecting to ${location}`);
  }
}

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path) => {
    throw new RedirectError(path);
  }),
}));

const PATH_SUFFIXES = [
  "",
  "/collection",
  "/collection/rkey",
  "/collection/rkey",
];

const makeValidCases = (authority: string) =>
  PATH_SUFFIXES.flatMap((suffix) => {
    const result = `/at/${authority}${suffix}`;
    return [
      [`${authority}${suffix}`, result],
      [`at://${authority}${suffix}`, result],
    ];
  });

const VALID_CASES = [
  ...makeValidCases("example.com"),
  ...makeValidCases("did:plc:hello"),
  ...makeValidCases("did:web:hello"),
  // Unicode should be preserved, we handle punycode transformation within the fetch of the page not on navigation
  ...makeValidCases("mañana.com"),

  ["@example.com", "/at/example.com"],
  ["@mañana.com", "/at/mañana.com"],

  // Not sure about this case. Are bare hosts supported in the spec? For now we allow it to error out at a later stage
  ["host", "/at/host"],
];

describe("navigates valid input", () => {
  test.each(VALID_CASES)("%s -> %s", async (input, expectedRedirect) => {
    await expect(navigateAtUri(input)).rejects.toThrowError(
      new RedirectError(expectedRedirect),
    );
  });
});

describe("strips whitespace and zero-width characters from valid input", () => {
  test.each(VALID_CASES.map((c) => [...c]))(
    "%s -> %s",
    async (input, expectedRedirect) => {
      await expect(
        navigateAtUri(`       ${input}\u200B\u200D\uFEFF  \u202C`),
      ).rejects.toThrowError(new RedirectError(expectedRedirect));
    },
  );
});

describe("shows error on invalid input", () => {
  test.each([
    ["@", "Invalid handle: @"],
    ["@invalid", "Invalid handle: @invalid"],
  ])('"%s" -> "%s"', async (input, expectedError) => {
    expect((await navigateAtUri(input)).error).toMatch(expectedError);
  });
});

const originalFetch = global.fetch;
const mockFetch = vi.fn();
global.fetch = mockFetch;
afterAll(() => {
  global.fetch = originalFetch;
});

describe("valid http input with link", () => {
  // Include only cases with the protocol prefix
  test.each(VALID_CASES.filter((c) => c[0]!.startsWith("at://")))(
    'valid http input with "%s" -> "%s"',
    async (link, expectedUri) => {
      mockFetch.mockResolvedValueOnce(
        new Response(/*html*/ `
        <html>
          <head>
            <link rel="alternate" href="${link}" />
          </head>
          <body></body>
        </html>
      `),
      );

      await expect(navigateAtUri("http://example.com")).rejects.toThrowError(
        new RedirectError(expectedUri),
      );
    },
  );
});

test("valid http input without included at uri", async () => {
  mockFetch.mockResolvedValueOnce(
    new Response(/*html*/ `
    <html>
      <head></head>
      <body></body>
    </html>
  `),
  );

  expect(await navigateAtUri("http://example.com")).toEqual({
    error: "No AT URI found in http://example.com",
  });
});
