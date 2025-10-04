/**
 * GENERATED CODE - DO NOT MODIFY
 */
import {
  type LexiconDoc,
  Lexicons,
  ValidationError,
  type ValidationResult,
} from "@atproto/lexicon";
import { type $Typed, is$typed, maybe$typed } from "./util.js";

export const schemaDict = {
  ComAtprotoRepoApplyWrites: {
    lexicon: 1,
    id: "com.atproto.repo.applyWrites",
    defs: {
      main: {
        type: "procedure",
        description:
          "Apply a batch transaction of repository creates, updates, and deletes. Requires auth, implemented by PDS.",
        input: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["repo", "writes"],
            properties: {
              repo: {
                type: "string",
                format: "at-identifier",
                description:
                  "The handle or DID of the repo (aka, current account).",
              },
              validate: {
                type: "boolean",
                description:
                  "Can be set to 'false' to skip Lexicon schema validation of record data across all operations, 'true' to require it, or leave unset to validate only for known Lexicons.",
              },
              writes: {
                type: "array",
                items: {
                  type: "union",
                  refs: [
                    "lex:com.atproto.repo.applyWrites#create",
                    "lex:com.atproto.repo.applyWrites#update",
                    "lex:com.atproto.repo.applyWrites#delete",
                  ],
                  closed: true,
                },
              },
              swapCommit: {
                type: "string",
                description:
                  "If provided, the entire operation will fail if the current repo commit CID does not match this value. Used to prevent conflicting repo mutations.",
                format: "cid",
              },
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: [],
            properties: {
              commit: {
                type: "ref",
                ref: "lex:com.atproto.repo.defs#commitMeta",
              },
              results: {
                type: "array",
                items: {
                  type: "union",
                  refs: [
                    "lex:com.atproto.repo.applyWrites#createResult",
                    "lex:com.atproto.repo.applyWrites#updateResult",
                    "lex:com.atproto.repo.applyWrites#deleteResult",
                  ],
                  closed: true,
                },
              },
            },
          },
        },
        errors: [
          {
            name: "InvalidSwap",
            description:
              "Indicates that the 'swapCommit' parameter did not match current commit.",
          },
        ],
      },
      create: {
        type: "object",
        description: "Operation which creates a new record.",
        required: ["collection", "value"],
        properties: {
          collection: {
            type: "string",
            format: "nsid",
          },
          rkey: {
            type: "string",
            maxLength: 15,
          },
          value: {
            type: "unknown",
          },
        },
      },
      update: {
        type: "object",
        description: "Operation which updates an existing record.",
        required: ["collection", "rkey", "value"],
        properties: {
          collection: {
            type: "string",
            format: "nsid",
          },
          rkey: {
            type: "string",
          },
          value: {
            type: "unknown",
          },
        },
      },
      delete: {
        type: "object",
        description: "Operation which deletes an existing record.",
        required: ["collection", "rkey"],
        properties: {
          collection: {
            type: "string",
            format: "nsid",
          },
          rkey: {
            type: "string",
          },
        },
      },
      createResult: {
        type: "object",
        required: ["uri", "cid"],
        properties: {
          uri: {
            type: "string",
            format: "at-uri",
          },
          cid: {
            type: "string",
            format: "cid",
          },
          validationStatus: {
            type: "string",
            knownValues: ["valid", "unknown"],
          },
        },
      },
      updateResult: {
        type: "object",
        required: ["uri", "cid"],
        properties: {
          uri: {
            type: "string",
            format: "at-uri",
          },
          cid: {
            type: "string",
            format: "cid",
          },
          validationStatus: {
            type: "string",
            knownValues: ["valid", "unknown"],
          },
        },
      },
      deleteResult: {
        type: "object",
        required: [],
        properties: {},
      },
    },
  },
  ComAtprotoRepoCreateRecord: {
    lexicon: 1,
    id: "com.atproto.repo.createRecord",
    defs: {
      main: {
        type: "procedure",
        description:
          "Create a single new repository record. Requires auth, implemented by PDS.",
        input: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["repo", "collection", "record"],
            properties: {
              repo: {
                type: "string",
                format: "at-identifier",
                description:
                  "The handle or DID of the repo (aka, current account).",
              },
              collection: {
                type: "string",
                format: "nsid",
                description: "The NSID of the record collection.",
              },
              rkey: {
                type: "string",
                description: "The Record Key.",
                maxLength: 15,
              },
              validate: {
                type: "boolean",
                description:
                  "Can be set to 'false' to skip Lexicon schema validation of record data, 'true' to require it, or leave unset to validate only for known Lexicons.",
              },
              record: {
                type: "unknown",
                description: "The record itself. Must contain a $type field.",
              },
              swapCommit: {
                type: "string",
                format: "cid",
                description:
                  "Compare and swap with the previous commit by CID.",
              },
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["uri", "cid"],
            properties: {
              uri: {
                type: "string",
                format: "at-uri",
              },
              cid: {
                type: "string",
                format: "cid",
              },
              commit: {
                type: "ref",
                ref: "lex:com.atproto.repo.defs#commitMeta",
              },
              validationStatus: {
                type: "string",
                knownValues: ["valid", "unknown"],
              },
            },
          },
        },
        errors: [
          {
            name: "InvalidSwap",
            description:
              "Indicates that 'swapCommit' didn't match current repo commit.",
          },
        ],
      },
    },
  },
  ComAtprotoRepoDefs: {
    lexicon: 1,
    id: "com.atproto.repo.defs",
    defs: {
      commitMeta: {
        type: "object",
        required: ["cid", "rev"],
        properties: {
          cid: {
            type: "string",
            format: "cid",
          },
          rev: {
            type: "string",
          },
        },
      },
    },
  },
  ComAtprotoRepoDeleteRecord: {
    lexicon: 1,
    id: "com.atproto.repo.deleteRecord",
    defs: {
      main: {
        type: "procedure",
        description:
          "Delete a repository record, or ensure it doesn't exist. Requires auth, implemented by PDS.",
        input: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["repo", "collection", "rkey"],
            properties: {
              repo: {
                type: "string",
                format: "at-identifier",
                description:
                  "The handle or DID of the repo (aka, current account).",
              },
              collection: {
                type: "string",
                format: "nsid",
                description: "The NSID of the record collection.",
              },
              rkey: {
                type: "string",
                description: "The Record Key.",
              },
              swapRecord: {
                type: "string",
                format: "cid",
                description:
                  "Compare and swap with the previous record by CID.",
              },
              swapCommit: {
                type: "string",
                format: "cid",
                description:
                  "Compare and swap with the previous commit by CID.",
              },
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            properties: {
              commit: {
                type: "ref",
                ref: "lex:com.atproto.repo.defs#commitMeta",
              },
            },
          },
        },
        errors: [
          {
            name: "InvalidSwap",
          },
        ],
      },
    },
  },
  ComAtprotoRepoDescribeRepo: {
    lexicon: 1,
    id: "com.atproto.repo.describeRepo",
    defs: {
      main: {
        type: "query",
        description:
          "Get information about an account and repository, including the list of collections. Does not require auth.",
        parameters: {
          type: "params",
          required: ["repo"],
          properties: {
            repo: {
              type: "string",
              format: "at-identifier",
              description: "The handle or DID of the repo.",
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: [
              "handle",
              "did",
              "didDoc",
              "collections",
              "handleIsCorrect",
            ],
            properties: {
              handle: {
                type: "string",
                format: "handle",
              },
              did: {
                type: "string",
                format: "did",
              },
              didDoc: {
                type: "unknown",
                description: "The complete DID document for this account.",
              },
              collections: {
                type: "array",
                description:
                  "List of all the collections (NSIDs) for which this repo contains at least one record.",
                items: {
                  type: "string",
                  format: "nsid",
                },
              },
              handleIsCorrect: {
                type: "boolean",
                description:
                  "Indicates if handle is currently valid (resolves bi-directionally)",
              },
            },
          },
        },
      },
    },
  },
  ComAtprotoRepoGetRecord: {
    lexicon: 1,
    id: "com.atproto.repo.getRecord",
    defs: {
      main: {
        type: "query",
        description:
          "Get a single record from a repository. Does not require auth.",
        parameters: {
          type: "params",
          required: ["repo", "collection", "rkey"],
          properties: {
            repo: {
              type: "string",
              format: "at-identifier",
              description: "The handle or DID of the repo.",
            },
            collection: {
              type: "string",
              format: "nsid",
              description: "The NSID of the record collection.",
            },
            rkey: {
              type: "string",
              description: "The Record Key.",
            },
            cid: {
              type: "string",
              format: "cid",
              description:
                "The CID of the version of the record. If not specified, then return the most recent version.",
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["uri", "value"],
            properties: {
              uri: {
                type: "string",
                format: "at-uri",
              },
              cid: {
                type: "string",
                format: "cid",
              },
              value: {
                type: "unknown",
              },
            },
          },
        },
        errors: [
          {
            name: "RecordNotFound",
          },
        ],
      },
    },
  },
  ComAtprotoRepoImportRepo: {
    lexicon: 1,
    id: "com.atproto.repo.importRepo",
    defs: {
      main: {
        type: "procedure",
        description:
          "Import a repo in the form of a CAR file. Requires Content-Length HTTP header to be set.",
        input: {
          encoding: "application/vnd.ipld.car",
        },
      },
    },
  },
  ComAtprotoRepoListMissingBlobs: {
    lexicon: 1,
    id: "com.atproto.repo.listMissingBlobs",
    defs: {
      main: {
        type: "query",
        description:
          "Returns a list of missing blobs for the requesting account. Intended to be used in the account migration flow.",
        parameters: {
          type: "params",
          properties: {
            limit: {
              type: "integer",
              minimum: 1,
              maximum: 1000,
              default: 500,
            },
            cursor: {
              type: "string",
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["blobs"],
            properties: {
              cursor: {
                type: "string",
              },
              blobs: {
                type: "array",
                items: {
                  type: "ref",
                  ref: "lex:com.atproto.repo.listMissingBlobs#recordBlob",
                },
              },
            },
          },
        },
      },
      recordBlob: {
        type: "object",
        required: ["cid", "recordUri"],
        properties: {
          cid: {
            type: "string",
            format: "cid",
          },
          recordUri: {
            type: "string",
            format: "at-uri",
          },
        },
      },
    },
  },
  ComAtprotoRepoListRecords: {
    lexicon: 1,
    id: "com.atproto.repo.listRecords",
    defs: {
      main: {
        type: "query",
        description:
          "List a range of records in a repository, matching a specific collection. Does not require auth.",
        parameters: {
          type: "params",
          required: ["repo", "collection"],
          properties: {
            repo: {
              type: "string",
              format: "at-identifier",
              description: "The handle or DID of the repo.",
            },
            collection: {
              type: "string",
              format: "nsid",
              description: "The NSID of the record type.",
            },
            limit: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 50,
              description: "The number of records to return.",
            },
            cursor: {
              type: "string",
            },
            rkeyStart: {
              type: "string",
              description:
                "DEPRECATED: The lowest sort-ordered rkey to start from (exclusive)",
            },
            rkeyEnd: {
              type: "string",
              description:
                "DEPRECATED: The highest sort-ordered rkey to stop at (exclusive)",
            },
            reverse: {
              type: "boolean",
              description: "Flag to reverse the order of the returned records.",
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["records"],
            properties: {
              cursor: {
                type: "string",
              },
              records: {
                type: "array",
                items: {
                  type: "ref",
                  ref: "lex:com.atproto.repo.listRecords#record",
                },
              },
            },
          },
        },
      },
      record: {
        type: "object",
        required: ["uri", "cid", "value"],
        properties: {
          uri: {
            type: "string",
            format: "at-uri",
          },
          cid: {
            type: "string",
            format: "cid",
          },
          value: {
            type: "unknown",
          },
        },
      },
    },
  },
  ComAtprotoRepoPutRecord: {
    lexicon: 1,
    id: "com.atproto.repo.putRecord",
    defs: {
      main: {
        type: "procedure",
        description:
          "Write a repository record, creating or updating it as needed. Requires auth, implemented by PDS.",
        input: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["repo", "collection", "rkey", "record"],
            nullable: ["swapRecord"],
            properties: {
              repo: {
                type: "string",
                format: "at-identifier",
                description:
                  "The handle or DID of the repo (aka, current account).",
              },
              collection: {
                type: "string",
                format: "nsid",
                description: "The NSID of the record collection.",
              },
              rkey: {
                type: "string",
                description: "The Record Key.",
                maxLength: 15,
              },
              validate: {
                type: "boolean",
                description:
                  "Can be set to 'false' to skip Lexicon schema validation of record data, 'true' to require it, or leave unset to validate only for known Lexicons.",
              },
              record: {
                type: "unknown",
                description: "The record to write.",
              },
              swapRecord: {
                type: "string",
                format: "cid",
                description:
                  "Compare and swap with the previous record by CID. WARNING: nullable and optional field; may cause problems with golang implementation",
              },
              swapCommit: {
                type: "string",
                format: "cid",
                description:
                  "Compare and swap with the previous commit by CID.",
              },
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["uri", "cid"],
            properties: {
              uri: {
                type: "string",
                format: "at-uri",
              },
              cid: {
                type: "string",
                format: "cid",
              },
              commit: {
                type: "ref",
                ref: "lex:com.atproto.repo.defs#commitMeta",
              },
              validationStatus: {
                type: "string",
                knownValues: ["valid", "unknown"],
              },
            },
          },
        },
        errors: [
          {
            name: "InvalidSwap",
          },
        ],
      },
    },
  },
  ComAtprotoRepoStrongRef: {
    lexicon: 1,
    id: "com.atproto.repo.strongRef",
    description: "A URI with a content-hash fingerprint.",
    defs: {
      main: {
        type: "object",
        required: ["uri", "cid"],
        properties: {
          uri: {
            type: "string",
            format: "at-uri",
          },
          cid: {
            type: "string",
            format: "cid",
          },
        },
      },
    },
  },
  ComAtprotoRepoUploadBlob: {
    lexicon: 1,
    id: "com.atproto.repo.uploadBlob",
    defs: {
      main: {
        type: "procedure",
        description:
          "Upload a new blob, to be referenced from a repository record. The blob will be deleted if it is not referenced within a time window (eg, minutes). Blob restrictions (mimetype, size, etc) are enforced when the reference is created. Requires auth, implemented by PDS.",
        input: {
          encoding: "*/*",
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["blob"],
            properties: {
              blob: {
                type: "blob",
              },
            },
          },
        },
      },
    },
  },
  FyiFrontpageFeedComment: {
    lexicon: 1,
    id: "fyi.frontpage.feed.comment",
    defs: {
      main: {
        type: "record",
        description: "Record containing a Frontpage comment.",
        key: "tid",
        record: {
          type: "object",
          required: ["createdAt", "post", "blocks"],
          properties: {
            blocks: {
              type: "array",
              maxLength: 50,
              description:
                "The content of the comment. Note, there are additional constraints placed on the total size of the content within the Frontpage AppView that are not possible to express in lexicon. Generally a comment can have a maximum length of 10,000 graphemes, the Frontpage AppView will enforce this limit.",
              items: {
                type: "ref",
                ref: "lex:fyi.frontpage.richtext.block",
              },
            },
            createdAt: {
              type: "string",
              format: "datetime",
              description:
                "Client-declared timestamp when this comment was originally created.",
            },
            parent: {
              type: "ref",
              ref: "lex:com.atproto.repo.strongRef",
            },
            post: {
              type: "ref",
              ref: "lex:com.atproto.repo.strongRef",
            },
          },
        },
      },
    },
  },
  FyiFrontpageFeedPost: {
    lexicon: 1,
    id: "fyi.frontpage.feed.post",
    defs: {
      main: {
        type: "record",
        description: "Record containing a Frontpage post.",
        key: "tid",
        record: {
          type: "object",
          required: ["title", "createdAt"],
          properties: {
            title: {
              type: "string",
              maxLength: 3000,
              maxGraphemes: 300,
              description: "The title of the post.",
            },
            subject: {
              type: "union",
              description:
                "The piece of content that this Frontpage post is about.",
              refs: ["lex:fyi.frontpage.feed.post#urlSubject"],
            },
            createdAt: {
              type: "string",
              format: "datetime",
              description:
                "Client-declared timestamp when this post was originally created.",
            },
          },
        },
      },
      urlSubject: {
        type: "object",
        required: ["url"],
        properties: {
          url: {
            type: "string",
            format: "uri",
          },
        },
      },
    },
  },
  FyiFrontpageFeedVote: {
    lexicon: 1,
    id: "fyi.frontpage.feed.vote",
    defs: {
      main: {
        type: "record",
        description: "Record containing a Frontpage vote.",
        key: "tid",
        record: {
          type: "object",
          required: ["subject", "createdAt"],
          properties: {
            subject: {
              type: "ref",
              description:
                "The post or comment that this Frontpage vote is for.",
              ref: "lex:com.atproto.repo.strongRef",
            },
            createdAt: {
              type: "string",
              format: "datetime",
              description:
                "Client-declared timestamp when this vote was originally created.",
            },
          },
        },
      },
    },
  },
  FyiFrontpageRichtextBlock: {
    lexicon: 1,
    id: "fyi.frontpage.richtext.block",
    defs: {
      main: {
        type: "object",
        required: ["content"],
        properties: {
          content: {
            type: "union",
            refs: ["lex:fyi.frontpage.richtext.block#plaintextParagraph"],
          },
        },
      },
      plaintextParagraph: {
        type: "object",
        properties: {
          text: {
            type: "string",
            maxLength: 100000,
            maxGraphemes: 10000,
          },
        },
      },
    },
  },
  FyiUnravelFrontpageComment: {
    lexicon: 1,
    id: "fyi.unravel.frontpage.comment",
    defs: {
      main: {
        type: "record",
        description: "Record containing a Frontpage comment.",
        key: "tid",
        record: {
          type: "object",
          required: ["content", "createdAt", "post"],
          properties: {
            content: {
              type: "string",
              maxLength: 100000,
              maxGraphemes: 10000,
              description: "The content of the comment.",
            },
            createdAt: {
              type: "string",
              format: "datetime",
              description:
                "Client-declared timestamp when this comment was originally created.",
            },
            parent: {
              type: "ref",
              ref: "lex:com.atproto.repo.strongRef",
            },
            post: {
              type: "ref",
              ref: "lex:com.atproto.repo.strongRef",
            },
          },
        },
      },
    },
  },
  FyiUnravelFrontpagePost: {
    lexicon: 1,
    id: "fyi.unravel.frontpage.post",
    defs: {
      main: {
        type: "record",
        description: "Record containing a Frontpage post.",
        key: "tid",
        record: {
          type: "object",
          required: ["title", "url", "createdAt"],
          properties: {
            title: {
              type: "string",
              maxLength: 3000,
              maxGraphemes: 300,
              description: "The title of the post.",
            },
            url: {
              type: "string",
              format: "uri",
              description: "The URL of the post.",
            },
            createdAt: {
              type: "string",
              format: "datetime",
              description:
                "Client-declared timestamp when this post was originally created.",
            },
          },
        },
      },
    },
  },
  FyiUnravelFrontpageVote: {
    lexicon: 1,
    id: "fyi.unravel.frontpage.vote",
    defs: {
      main: {
        type: "record",
        description: "Record containing a Frontpage vote.",
        key: "tid",
        record: {
          type: "object",
          required: ["subject", "createdAt"],
          properties: {
            subject: {
              type: "ref",
              ref: "lex:com.atproto.repo.strongRef",
            },
            createdAt: {
              type: "string",
              format: "datetime",
              description:
                "Client-declared timestamp when this vote was originally created.",
            },
          },
        },
      },
    },
  },
} as const satisfies Record<string, LexiconDoc>;
export const schemas = Object.values(schemaDict) satisfies LexiconDoc[];
export const lexicons: Lexicons = new Lexicons(schemas);

export function validate<T extends { $type: string }>(
  v: unknown,
  id: string,
  hash: string,
  requiredType: true,
): ValidationResult<T>;
export function validate<T extends { $type?: string }>(
  v: unknown,
  id: string,
  hash: string,
  requiredType?: false,
): ValidationResult<T>;
export function validate(
  v: unknown,
  id: string,
  hash: string,
  requiredType?: boolean,
): ValidationResult {
  return (requiredType ? is$typed : maybe$typed)(v, id, hash)
    ? lexicons.validate(`${id}#${hash}`, v)
    : {
        success: false,
        error: new ValidationError(
          `Must be an object with "${hash === "main" ? id : `${id}#${hash}`}" $type property`,
        ),
      };
}

export const ids = {
  ComAtprotoRepoApplyWrites: "com.atproto.repo.applyWrites",
  ComAtprotoRepoCreateRecord: "com.atproto.repo.createRecord",
  ComAtprotoRepoDefs: "com.atproto.repo.defs",
  ComAtprotoRepoDeleteRecord: "com.atproto.repo.deleteRecord",
  ComAtprotoRepoDescribeRepo: "com.atproto.repo.describeRepo",
  ComAtprotoRepoGetRecord: "com.atproto.repo.getRecord",
  ComAtprotoRepoImportRepo: "com.atproto.repo.importRepo",
  ComAtprotoRepoListMissingBlobs: "com.atproto.repo.listMissingBlobs",
  ComAtprotoRepoListRecords: "com.atproto.repo.listRecords",
  ComAtprotoRepoPutRecord: "com.atproto.repo.putRecord",
  ComAtprotoRepoStrongRef: "com.atproto.repo.strongRef",
  ComAtprotoRepoUploadBlob: "com.atproto.repo.uploadBlob",
  FyiFrontpageFeedComment: "fyi.frontpage.feed.comment",
  FyiFrontpageFeedPost: "fyi.frontpage.feed.post",
  FyiFrontpageFeedVote: "fyi.frontpage.feed.vote",
  FyiFrontpageRichtextBlock: "fyi.frontpage.richtext.block",
  FyiUnravelFrontpageComment: "fyi.unravel.frontpage.comment",
  FyiUnravelFrontpagePost: "fyi.unravel.frontpage.post",
  FyiUnravelFrontpageVote: "fyi.unravel.frontpage.vote",
} as const;
