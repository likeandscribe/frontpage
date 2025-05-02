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
            maxLength: 512,
            format: "record-key",
            description:
              "NOTE: maxLength is redundant with record-key format. Keeping it temporarily to ensure backwards compatibility.",
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
            format: "record-key",
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
            format: "record-key",
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
                format: "record-key",
                description: "The Record Key.",
                maxLength: 512,
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
            format: "tid",
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
                format: "record-key",
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
              format: "record-key",
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
                format: "record-key",
                description: "The Record Key.",
                maxLength: 512,
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
  ComAtprotoSyncDefs: {
    lexicon: 1,
    id: "com.atproto.sync.defs",
    defs: {
      hostStatus: {
        type: "string",
        knownValues: ["active", "idle", "offline", "throttled", "banned"],
      },
    },
  },
  ComAtprotoSyncGetBlob: {
    lexicon: 1,
    id: "com.atproto.sync.getBlob",
    defs: {
      main: {
        type: "query",
        description:
          "Get a blob associated with a given account. Returns the full blob as originally uploaded. Does not require auth; implemented by PDS.",
        parameters: {
          type: "params",
          required: ["did", "cid"],
          properties: {
            did: {
              type: "string",
              format: "did",
              description: "The DID of the account.",
            },
            cid: {
              type: "string",
              format: "cid",
              description: "The CID of the blob to fetch",
            },
          },
        },
        output: {
          encoding: "*/*",
        },
        errors: [
          {
            name: "BlobNotFound",
          },
          {
            name: "RepoNotFound",
          },
          {
            name: "RepoTakendown",
          },
          {
            name: "RepoSuspended",
          },
          {
            name: "RepoDeactivated",
          },
        ],
      },
    },
  },
  ComAtprotoSyncGetBlocks: {
    lexicon: 1,
    id: "com.atproto.sync.getBlocks",
    defs: {
      main: {
        type: "query",
        description:
          "Get data blocks from a given repo, by CID. For example, intermediate MST nodes, or records. Does not require auth; implemented by PDS.",
        parameters: {
          type: "params",
          required: ["did", "cids"],
          properties: {
            did: {
              type: "string",
              format: "did",
              description: "The DID of the repo.",
            },
            cids: {
              type: "array",
              items: {
                type: "string",
                format: "cid",
              },
            },
          },
        },
        output: {
          encoding: "application/vnd.ipld.car",
        },
        errors: [
          {
            name: "BlockNotFound",
          },
          {
            name: "RepoNotFound",
          },
          {
            name: "RepoTakendown",
          },
          {
            name: "RepoSuspended",
          },
          {
            name: "RepoDeactivated",
          },
        ],
      },
    },
  },
  ComAtprotoSyncGetCheckout: {
    lexicon: 1,
    id: "com.atproto.sync.getCheckout",
    defs: {
      main: {
        type: "query",
        description: "DEPRECATED - please use com.atproto.sync.getRepo instead",
        parameters: {
          type: "params",
          required: ["did"],
          properties: {
            did: {
              type: "string",
              format: "did",
              description: "The DID of the repo.",
            },
          },
        },
        output: {
          encoding: "application/vnd.ipld.car",
        },
      },
    },
  },
  ComAtprotoSyncGetHead: {
    lexicon: 1,
    id: "com.atproto.sync.getHead",
    defs: {
      main: {
        type: "query",
        description:
          "DEPRECATED - please use com.atproto.sync.getLatestCommit instead",
        parameters: {
          type: "params",
          required: ["did"],
          properties: {
            did: {
              type: "string",
              format: "did",
              description: "The DID of the repo.",
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["root"],
            properties: {
              root: {
                type: "string",
                format: "cid",
              },
            },
          },
        },
        errors: [
          {
            name: "HeadNotFound",
          },
        ],
      },
    },
  },
  ComAtprotoSyncGetHostStatus: {
    lexicon: 1,
    id: "com.atproto.sync.getHostStatus",
    defs: {
      main: {
        type: "query",
        description:
          "Returns information about a specified upstream host, as consumed by the server. Implemented by relays.",
        parameters: {
          type: "params",
          required: ["hostname"],
          properties: {
            hostname: {
              type: "string",
              description:
                "Hostname of the host (eg, PDS or relay) being queried.",
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["hostname"],
            properties: {
              hostname: {
                type: "string",
              },
              seq: {
                type: "integer",
                description:
                  "Recent repo stream event sequence number. May be delayed from actual stream processing (eg, persisted cursor not in-memory cursor).",
              },
              accountCount: {
                type: "integer",
                description:
                  "Number of accounts on the server which are associated with the upstream host. Note that the upstream may actually have more accounts.",
              },
              status: {
                type: "ref",
                ref: "lex:com.atproto.sync.defs#hostStatus",
              },
            },
          },
        },
        errors: [
          {
            name: "HostNotFound",
          },
        ],
      },
    },
  },
  ComAtprotoSyncGetLatestCommit: {
    lexicon: 1,
    id: "com.atproto.sync.getLatestCommit",
    defs: {
      main: {
        type: "query",
        description:
          "Get the current commit CID & revision of the specified repo. Does not require auth.",
        parameters: {
          type: "params",
          required: ["did"],
          properties: {
            did: {
              type: "string",
              format: "did",
              description: "The DID of the repo.",
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["cid", "rev"],
            properties: {
              cid: {
                type: "string",
                format: "cid",
              },
              rev: {
                type: "string",
                format: "tid",
              },
            },
          },
        },
        errors: [
          {
            name: "RepoNotFound",
          },
          {
            name: "RepoTakendown",
          },
          {
            name: "RepoSuspended",
          },
          {
            name: "RepoDeactivated",
          },
        ],
      },
    },
  },
  ComAtprotoSyncGetRecord: {
    lexicon: 1,
    id: "com.atproto.sync.getRecord",
    defs: {
      main: {
        type: "query",
        description:
          "Get data blocks needed to prove the existence or non-existence of record in the current version of repo. Does not require auth.",
        parameters: {
          type: "params",
          required: ["did", "collection", "rkey"],
          properties: {
            did: {
              type: "string",
              format: "did",
              description: "The DID of the repo.",
            },
            collection: {
              type: "string",
              format: "nsid",
            },
            rkey: {
              type: "string",
              description: "Record Key",
              format: "record-key",
            },
          },
        },
        output: {
          encoding: "application/vnd.ipld.car",
        },
        errors: [
          {
            name: "RecordNotFound",
          },
          {
            name: "RepoNotFound",
          },
          {
            name: "RepoTakendown",
          },
          {
            name: "RepoSuspended",
          },
          {
            name: "RepoDeactivated",
          },
        ],
      },
    },
  },
  ComAtprotoSyncGetRepo: {
    lexicon: 1,
    id: "com.atproto.sync.getRepo",
    defs: {
      main: {
        type: "query",
        description:
          "Download a repository export as CAR file. Optionally only a 'diff' since a previous revision. Does not require auth; implemented by PDS.",
        parameters: {
          type: "params",
          required: ["did"],
          properties: {
            did: {
              type: "string",
              format: "did",
              description: "The DID of the repo.",
            },
            since: {
              type: "string",
              format: "tid",
              description:
                "The revision ('rev') of the repo to create a diff from.",
            },
          },
        },
        output: {
          encoding: "application/vnd.ipld.car",
        },
        errors: [
          {
            name: "RepoNotFound",
          },
          {
            name: "RepoTakendown",
          },
          {
            name: "RepoSuspended",
          },
          {
            name: "RepoDeactivated",
          },
        ],
      },
    },
  },
  ComAtprotoSyncGetRepoStatus: {
    lexicon: 1,
    id: "com.atproto.sync.getRepoStatus",
    defs: {
      main: {
        type: "query",
        description:
          "Get the hosting status for a repository, on this server. Expected to be implemented by PDS and Relay.",
        parameters: {
          type: "params",
          required: ["did"],
          properties: {
            did: {
              type: "string",
              format: "did",
              description: "The DID of the repo.",
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["did", "active"],
            properties: {
              did: {
                type: "string",
                format: "did",
              },
              active: {
                type: "boolean",
              },
              status: {
                type: "string",
                description:
                  "If active=false, this optional field indicates a possible reason for why the account is not active. If active=false and no status is supplied, then the host makes no claim for why the repository is no longer being hosted.",
                knownValues: [
                  "takendown",
                  "suspended",
                  "deleted",
                  "deactivated",
                  "desynchronized",
                  "throttled",
                ],
              },
              rev: {
                type: "string",
                format: "tid",
                description:
                  "Optional field, the current rev of the repo, if active=true",
              },
            },
          },
        },
        errors: [
          {
            name: "RepoNotFound",
          },
        ],
      },
    },
  },
  ComAtprotoSyncListBlobs: {
    lexicon: 1,
    id: "com.atproto.sync.listBlobs",
    defs: {
      main: {
        type: "query",
        description:
          "List blob CIDs for an account, since some repo revision. Does not require auth; implemented by PDS.",
        parameters: {
          type: "params",
          required: ["did"],
          properties: {
            did: {
              type: "string",
              format: "did",
              description: "The DID of the repo.",
            },
            since: {
              type: "string",
              format: "tid",
              description: "Optional revision of the repo to list blobs since.",
            },
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
            required: ["cids"],
            properties: {
              cursor: {
                type: "string",
              },
              cids: {
                type: "array",
                items: {
                  type: "string",
                  format: "cid",
                },
              },
            },
          },
        },
        errors: [
          {
            name: "RepoNotFound",
          },
          {
            name: "RepoTakendown",
          },
          {
            name: "RepoSuspended",
          },
          {
            name: "RepoDeactivated",
          },
        ],
      },
    },
  },
  ComAtprotoSyncListHosts: {
    lexicon: 1,
    id: "com.atproto.sync.listHosts",
    defs: {
      main: {
        type: "query",
        description:
          "Enumerates upstream hosts (eg, PDS or relay instances) that this service consumes from. Implemented by relays.",
        parameters: {
          type: "params",
          properties: {
            limit: {
              type: "integer",
              minimum: 1,
              maximum: 1000,
              default: 200,
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
            required: ["hosts"],
            properties: {
              cursor: {
                type: "string",
              },
              hosts: {
                type: "array",
                items: {
                  type: "ref",
                  ref: "lex:com.atproto.sync.listHosts#host",
                },
                description:
                  "Sort order is not formally specified. Recommended order is by time host was first seen by the server, with oldest first.",
              },
            },
          },
        },
      },
      host: {
        type: "object",
        required: ["hostname"],
        properties: {
          hostname: {
            type: "string",
            description: "hostname of server; not a URL (no scheme)",
          },
          seq: {
            type: "integer",
            description:
              "Recent repo stream event sequence number. May be delayed from actual stream processing (eg, persisted cursor not in-memory cursor).",
          },
          accountCount: {
            type: "integer",
          },
          status: {
            type: "ref",
            ref: "lex:com.atproto.sync.defs#hostStatus",
          },
        },
      },
    },
  },
  ComAtprotoSyncListRepos: {
    lexicon: 1,
    id: "com.atproto.sync.listRepos",
    defs: {
      main: {
        type: "query",
        description:
          "Enumerates all the DID, rev, and commit CID for all repos hosted by this service. Does not require auth; implemented by PDS and Relay.",
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
            required: ["repos"],
            properties: {
              cursor: {
                type: "string",
              },
              repos: {
                type: "array",
                items: {
                  type: "ref",
                  ref: "lex:com.atproto.sync.listRepos#repo",
                },
              },
            },
          },
        },
      },
      repo: {
        type: "object",
        required: ["did", "head", "rev"],
        properties: {
          did: {
            type: "string",
            format: "did",
          },
          head: {
            type: "string",
            format: "cid",
            description: "Current repo commit CID",
          },
          rev: {
            type: "string",
            format: "tid",
          },
          active: {
            type: "boolean",
          },
          status: {
            type: "string",
            description:
              "If active=false, this optional field indicates a possible reason for why the account is not active. If active=false and no status is supplied, then the host makes no claim for why the repository is no longer being hosted.",
            knownValues: [
              "takendown",
              "suspended",
              "deleted",
              "deactivated",
              "desynchronized",
              "throttled",
            ],
          },
        },
      },
    },
  },
  ComAtprotoSyncListReposByCollection: {
    lexicon: 1,
    id: "com.atproto.sync.listReposByCollection",
    defs: {
      main: {
        type: "query",
        description:
          "Enumerates all the DIDs which have records with the given collection NSID.",
        parameters: {
          type: "params",
          required: ["collection"],
          properties: {
            collection: {
              type: "string",
              format: "nsid",
            },
            limit: {
              type: "integer",
              description:
                "Maximum size of response set. Recommend setting a large maximum (1000+) when enumerating large DID lists.",
              minimum: 1,
              maximum: 2000,
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
            required: ["repos"],
            properties: {
              cursor: {
                type: "string",
              },
              repos: {
                type: "array",
                items: {
                  type: "ref",
                  ref: "lex:com.atproto.sync.listReposByCollection#repo",
                },
              },
            },
          },
        },
      },
      repo: {
        type: "object",
        required: ["did"],
        properties: {
          did: {
            type: "string",
            format: "did",
          },
        },
      },
    },
  },
  ComAtprotoSyncNotifyOfUpdate: {
    lexicon: 1,
    id: "com.atproto.sync.notifyOfUpdate",
    defs: {
      main: {
        type: "procedure",
        description:
          "Notify a crawling service of a recent update, and that crawling should resume. Intended use is after a gap between repo stream events caused the crawling service to disconnect. Does not require auth; implemented by Relay. DEPRECATED: just use com.atproto.sync.requestCrawl",
        input: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["hostname"],
            properties: {
              hostname: {
                type: "string",
                description:
                  "Hostname of the current service (usually a PDS) that is notifying of update.",
              },
            },
          },
        },
      },
    },
  },
  ComAtprotoSyncRequestCrawl: {
    lexicon: 1,
    id: "com.atproto.sync.requestCrawl",
    defs: {
      main: {
        type: "procedure",
        description:
          "Request a service to persistently crawl hosted repos. Expected use is new PDS instances declaring their existence to Relays. Does not require auth.",
        input: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["hostname"],
            properties: {
              hostname: {
                type: "string",
                description:
                  "Hostname of the current service (eg, PDS) that is requesting to be crawled.",
              },
            },
          },
        },
        errors: [
          {
            name: "HostBanned",
          },
        ],
      },
    },
  },
  ComAtprotoSyncSubscribeRepos: {
    lexicon: 1,
    id: "com.atproto.sync.subscribeRepos",
    defs: {
      main: {
        type: "subscription",
        description:
          "Repository event stream, aka Firehose endpoint. Outputs repo commits with diff data, and identity update events, for all repositories on the current server. See the atproto specifications for details around stream sequencing, repo versioning, CAR diff format, and more. Public and does not require auth; implemented by PDS and Relay.",
        parameters: {
          type: "params",
          properties: {
            cursor: {
              type: "integer",
              description: "The last known event seq number to backfill from.",
            },
          },
        },
        message: {
          schema: {
            type: "union",
            refs: [
              "lex:com.atproto.sync.subscribeRepos#commit",
              "lex:com.atproto.sync.subscribeRepos#sync",
              "lex:com.atproto.sync.subscribeRepos#identity",
              "lex:com.atproto.sync.subscribeRepos#account",
              "lex:com.atproto.sync.subscribeRepos#info",
            ],
          },
        },
        errors: [
          {
            name: "FutureCursor",
          },
          {
            name: "ConsumerTooSlow",
            description:
              "If the consumer of the stream can not keep up with events, and a backlog gets too large, the server will drop the connection.",
          },
        ],
      },
      commit: {
        type: "object",
        description:
          "Represents an update of repository state. Note that empty commits are allowed, which include no repo data changes, but an update to rev and signature.",
        required: [
          "seq",
          "rebase",
          "tooBig",
          "repo",
          "commit",
          "rev",
          "since",
          "blocks",
          "ops",
          "blobs",
          "time",
        ],
        nullable: ["since"],
        properties: {
          seq: {
            type: "integer",
            description: "The stream sequence number of this message.",
          },
          rebase: {
            type: "boolean",
            description: "DEPRECATED -- unused",
          },
          tooBig: {
            type: "boolean",
            description:
              "DEPRECATED -- replaced by #sync event and data limits. Indicates that this commit contained too many ops, or data size was too large. Consumers will need to make a separate request to get missing data.",
          },
          repo: {
            type: "string",
            format: "did",
            description:
              "The repo this event comes from. Note that all other message types name this field 'did'.",
          },
          commit: {
            type: "cid-link",
            description: "Repo commit object CID.",
          },
          rev: {
            type: "string",
            format: "tid",
            description:
              "The rev of the emitted commit. Note that this information is also in the commit object included in blocks, unless this is a tooBig event.",
          },
          since: {
            type: "string",
            format: "tid",
            description:
              "The rev of the last emitted commit from this repo (if any).",
          },
          blocks: {
            type: "bytes",
            description:
              "CAR file containing relevant blocks, as a diff since the previous repo state. The commit must be included as a block, and the commit block CID must be the first entry in the CAR header 'roots' list.",
            maxLength: 2000000,
          },
          ops: {
            type: "array",
            items: {
              type: "ref",
              ref: "lex:com.atproto.sync.subscribeRepos#repoOp",
              description:
                "List of repo mutation operations in this commit (eg, records created, updated, or deleted).",
            },
            maxLength: 200,
          },
          blobs: {
            type: "array",
            items: {
              type: "cid-link",
              description:
                "DEPRECATED -- will soon always be empty. List of new blobs (by CID) referenced by records in this commit.",
            },
          },
          prevData: {
            type: "cid-link",
            description:
              "The root CID of the MST tree for the previous commit from this repo (indicated by the 'since' revision field in this message). Corresponds to the 'data' field in the repo commit object. NOTE: this field is effectively required for the 'inductive' version of firehose.",
          },
          time: {
            type: "string",
            format: "datetime",
            description:
              "Timestamp of when this message was originally broadcast.",
          },
        },
      },
      sync: {
        type: "object",
        description:
          "Updates the repo to a new state, without necessarily including that state on the firehose. Used to recover from broken commit streams, data loss incidents, or in situations where upstream host does not know recent state of the repository.",
        required: ["seq", "did", "blocks", "rev", "time"],
        properties: {
          seq: {
            type: "integer",
            description: "The stream sequence number of this message.",
          },
          did: {
            type: "string",
            format: "did",
            description:
              "The account this repo event corresponds to. Must match that in the commit object.",
          },
          blocks: {
            type: "bytes",
            description:
              "CAR file containing the commit, as a block. The CAR header must include the commit block CID as the first 'root'.",
            maxLength: 10000,
          },
          rev: {
            type: "string",
            description:
              "The rev of the commit. This value must match that in the commit object.",
          },
          time: {
            type: "string",
            format: "datetime",
            description:
              "Timestamp of when this message was originally broadcast.",
          },
        },
      },
      identity: {
        type: "object",
        description:
          "Represents a change to an account's identity. Could be an updated handle, signing key, or pds hosting endpoint. Serves as a prod to all downstream services to refresh their identity cache.",
        required: ["seq", "did", "time"],
        properties: {
          seq: {
            type: "integer",
          },
          did: {
            type: "string",
            format: "did",
          },
          time: {
            type: "string",
            format: "datetime",
          },
          handle: {
            type: "string",
            format: "handle",
            description:
              "The current handle for the account, or 'handle.invalid' if validation fails. This field is optional, might have been validated or passed-through from an upstream source. Semantics and behaviors for PDS vs Relay may evolve in the future; see atproto specs for more details.",
          },
        },
      },
      account: {
        type: "object",
        description:
          "Represents a change to an account's status on a host (eg, PDS or Relay). The semantics of this event are that the status is at the host which emitted the event, not necessarily that at the currently active PDS. Eg, a Relay takedown would emit a takedown with active=false, even if the PDS is still active.",
        required: ["seq", "did", "time", "active"],
        properties: {
          seq: {
            type: "integer",
          },
          did: {
            type: "string",
            format: "did",
          },
          time: {
            type: "string",
            format: "datetime",
          },
          active: {
            type: "boolean",
            description:
              "Indicates that the account has a repository which can be fetched from the host that emitted this event.",
          },
          status: {
            type: "string",
            description:
              "If active=false, this optional field indicates a reason for why the account is not active.",
            knownValues: [
              "takendown",
              "suspended",
              "deleted",
              "deactivated",
              "desynchronized",
              "throttled",
            ],
          },
        },
      },
      info: {
        type: "object",
        required: ["name"],
        properties: {
          name: {
            type: "string",
            knownValues: ["OutdatedCursor"],
          },
          message: {
            type: "string",
          },
        },
      },
      repoOp: {
        type: "object",
        description: "A repo operation, ie a mutation of a single record.",
        required: ["action", "path", "cid"],
        nullable: ["cid"],
        properties: {
          action: {
            type: "string",
            knownValues: ["create", "update", "delete"],
          },
          path: {
            type: "string",
          },
          cid: {
            type: "cid-link",
            description:
              "For creates and updates, the new record CID. For deletions, null.",
          },
          prev: {
            type: "cid-link",
            description:
              "For updates and deletes, the previous record CID (required for inductive firehose). For creations, field should not be defined.",
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
  ComAtprotoSyncDefs: "com.atproto.sync.defs",
  ComAtprotoSyncGetBlob: "com.atproto.sync.getBlob",
  ComAtprotoSyncGetBlocks: "com.atproto.sync.getBlocks",
  ComAtprotoSyncGetCheckout: "com.atproto.sync.getCheckout",
  ComAtprotoSyncGetHead: "com.atproto.sync.getHead",
  ComAtprotoSyncGetHostStatus: "com.atproto.sync.getHostStatus",
  ComAtprotoSyncGetLatestCommit: "com.atproto.sync.getLatestCommit",
  ComAtprotoSyncGetRecord: "com.atproto.sync.getRecord",
  ComAtprotoSyncGetRepo: "com.atproto.sync.getRepo",
  ComAtprotoSyncGetRepoStatus: "com.atproto.sync.getRepoStatus",
  ComAtprotoSyncListBlobs: "com.atproto.sync.listBlobs",
  ComAtprotoSyncListHosts: "com.atproto.sync.listHosts",
  ComAtprotoSyncListRepos: "com.atproto.sync.listRepos",
  ComAtprotoSyncListReposByCollection: "com.atproto.sync.listReposByCollection",
  ComAtprotoSyncNotifyOfUpdate: "com.atproto.sync.notifyOfUpdate",
  ComAtprotoSyncRequestCrawl: "com.atproto.sync.requestCrawl",
  ComAtprotoSyncSubscribeRepos: "com.atproto.sync.subscribeRepos",
  FyiUnravelFrontpageComment: "fyi.unravel.frontpage.comment",
  FyiUnravelFrontpagePost: "fyi.unravel.frontpage.post",
  FyiUnravelFrontpageVote: "fyi.unravel.frontpage.vote",
} as const;
