/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from "@atproto/lexicon";
import { isObj, hasProp } from "../../../../util";
import { lexicons } from "../../../../lexicons";
import { CID } from "multiformats/cid";
import * as ComAtprotoRepoStrongRef from "../../../com/atproto/repo/strongRef";

export interface Record {
  subject: ComAtprotoRepoStrongRef.Main;
  /** Client-declared timestamp when this vote was originally created. */
  createdAt: string;
  [k: string]: unknown;
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    (v.$type === "fyi.unravel.frontpage.vote#main" ||
      v.$type === "fyi.unravel.frontpage.vote")
  );
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate("fyi.unravel.frontpage.vote#main", v);
}
