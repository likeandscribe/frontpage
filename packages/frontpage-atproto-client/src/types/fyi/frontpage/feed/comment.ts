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
import type * as FyiFrontpageRichtextBlock from "../richtext/block.js";
import type * as ComAtprotoRepoStrongRef from "../../../com/atproto/repo/strongRef.js";

const is$typed = _is$typed,
  validate = _validate;
const id = "fyi.frontpage.feed.comment";

export interface Record {
  $type: "fyi.frontpage.feed.comment";
  /** The content of the comment. Note, there are additional constraints placed on the total size of the content within the Frontpage AppView that are not possible to express in lexicon. Generally a comment can have a maximum length of 10,000 graphemes, the Frontpage AppView will enforce this limit. */
  blocks: (
    | $Typed<FyiFrontpageRichtextBlock.PlaintextParagraph>
    | { $type: string }
  )[];
  /** Client-declared timestamp when this comment was originally created. */
  createdAt: string;
  parent?: ComAtprotoRepoStrongRef.Main;
  post: ComAtprotoRepoStrongRef.Main;
  [k: string]: unknown;
}

const hashRecord = "main";

export function isRecord<V>(v: V) {
  return is$typed(v, id, hashRecord);
}

export function validateRecord<V>(v: V) {
  return validate<Record & V>(v, id, hashRecord, true);
}
