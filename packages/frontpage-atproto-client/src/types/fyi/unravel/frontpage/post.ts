/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { isObj, hasProp } from '../../../../util'
import { lexicons } from '../../../../lexicons'
import { CID } from 'multiformats/cid'

export interface Record {
  /** The title of the post. */
  title?: string
  /** The URL of the post. */
  url?: string
  [k: string]: unknown
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'fyi.unravel.frontpage.post#main' ||
      v.$type === 'fyi.unravel.frontpage.post')
  )
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('fyi.unravel.frontpage.post#main', v)
}
