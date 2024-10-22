/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { LexiconDoc, Lexicons } from '@atproto/lexicon'

export const schemaDict = {
  FyiUnravelFrontpagePost: {
    lexicon: 1,
    id: 'fyi.unravel.frontpage.post',
    defs: {
      main: {
        type: 'record',
        description: 'Record containing a Frontpage post.',
        key: 'tid',
        record: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              maxLength: 3000,
              maxGraphemes: 300,
              description: 'The title of the post.',
            },
            url: {
              type: 'string',
              format: 'uri',
              description: 'The URL of the post.',
            },
          },
        },
      },
    },
  },
}
export const schemas: LexiconDoc[] = Object.values(schemaDict) as LexiconDoc[]
export const lexicons: Lexicons = new Lexicons(schemas)
export const ids = { FyiUnravelFrontpagePost: 'fyi.unravel.frontpage.post' }
