/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from "@atproto/lexicon";
import { CID } from "multiformats/cid";
import { validate as _validate } from "../../../../lexicons";
import {
  type $Typed,
  is$typed as _is$typed,
  type OmitKey,
} from "../../../../util";
import type * as FyiFrontpageFeedSubjectUrl from "./subject/url.js";

const is$typed = _is$typed,
  validate = _validate;
const id = "fyi.frontpage.feed.post";

export interface Record {
  $type: "fyi.frontpage.feed.post";
  /** The title of the post. */
  title: string;
  subject?: $Typed<FyiFrontpageFeedSubjectUrl.Main> | { $type: string };
  /** Client-declared timestamp when this post was originally created. */
  createdAt: string;
  [k: string]: unknown;
}

const hashRecord = "main";

export function isRecord<V>(v: V) {
  return is$typed(v, id, hashRecord);
}

export function validateRecord<V>(v: V) {
  return validate<Record & V>(v, id, hashRecord, true);
}
