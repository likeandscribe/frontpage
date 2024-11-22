/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from "@atproto/lexicon";
import { isObj, hasProp } from "../../../../util";
import { lexicons } from "../../../../lexicons";
import { CID } from "multiformats/cid";
import * as AppBskyRichtextFacet from "../../../app/bsky/richtext/facet";
import * as ComAtprotoRepoStrongRef from "../../../com/atproto/repo/strongRef";

export interface Record {
  /** The content of the comment. */
  content: string;
  /** Annotations of text (mentions, URLs, hashtags, etc) */
  facets?: AppBskyRichtextFacet.Main[];
  /** Client-declared timestamp when this comment was originally created. */
  createdAt: string;
  parent?: ComAtprotoRepoStrongRef.Main;
  post: ComAtprotoRepoStrongRef.Main;
  [k: string]: unknown;
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    (v.$type === "fyi.unravel.frontpage.comment#main" ||
      v.$type === "fyi.unravel.frontpage.comment")
  );
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate("fyi.unravel.frontpage.comment#main", v);
}
