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
const id = "fyi.frontpage.richtext.block";

export interface PlaintextParagraph {
  $type?: "fyi.frontpage.richtext.block#plaintextParagraph";
  text?: string;
}

const hashPlaintextParagraph = "plaintextParagraph";

export function isPlaintextParagraph<V>(v: V) {
  return is$typed(v, id, hashPlaintextParagraph);
}

export function validatePlaintextParagraph<V>(v: V) {
  return validate<PlaintextParagraph & V>(v, id, hashPlaintextParagraph);
}
