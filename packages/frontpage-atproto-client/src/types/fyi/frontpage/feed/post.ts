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

const is$typed = _is$typed,
  validate = _validate;
const id = "fyi.frontpage.feed.post";

export interface Record {
  $type: "fyi.frontpage.feed.post";
  /** The title of the post. */
  title: string;
  subject?: $Typed<UrlSubject> | { $type: string };
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

export interface UrlSubject {
  $type?: "fyi.frontpage.feed.post#urlSubject";
  url: string;
}

const hashUrlSubject = "urlSubject";

export function isUrlSubject<V>(v: V) {
  return is$typed(v, id, hashUrlSubject);
}

export function validateUrlSubject<V>(v: V) {
  return validate<UrlSubject & V>(v, id, hashUrlSubject);
}
