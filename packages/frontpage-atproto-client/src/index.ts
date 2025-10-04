/**
 * GENERATED CODE - DO NOT MODIFY
 */
import {
  XrpcClient,
  type FetchHandler,
  type FetchHandlerOptions,
} from "@atproto/xrpc";
import { schemas } from "./lexicons.js";
import { CID } from "multiformats/cid";
import { type OmitKey, type Un$Typed } from "./util.js";
import * as ComAtprotoRepoApplyWrites from "./types/com/atproto/repo/applyWrites.js";
import * as ComAtprotoRepoCreateRecord from "./types/com/atproto/repo/createRecord.js";
import * as ComAtprotoRepoDefs from "./types/com/atproto/repo/defs.js";
import * as ComAtprotoRepoDeleteRecord from "./types/com/atproto/repo/deleteRecord.js";
import * as ComAtprotoRepoDescribeRepo from "./types/com/atproto/repo/describeRepo.js";
import * as ComAtprotoRepoGetRecord from "./types/com/atproto/repo/getRecord.js";
import * as ComAtprotoRepoImportRepo from "./types/com/atproto/repo/importRepo.js";
import * as ComAtprotoRepoListMissingBlobs from "./types/com/atproto/repo/listMissingBlobs.js";
import * as ComAtprotoRepoListRecords from "./types/com/atproto/repo/listRecords.js";
import * as ComAtprotoRepoPutRecord from "./types/com/atproto/repo/putRecord.js";
import * as ComAtprotoRepoStrongRef from "./types/com/atproto/repo/strongRef.js";
import * as ComAtprotoRepoUploadBlob from "./types/com/atproto/repo/uploadBlob.js";
import * as FyiFrontpageFeedComment from "./types/fyi/frontpage/feed/comment.js";
import * as FyiFrontpageFeedPost from "./types/fyi/frontpage/feed/post.js";
import * as FyiFrontpageFeedVote from "./types/fyi/frontpage/feed/vote.js";
import * as FyiFrontpageRichtextBlock from "./types/fyi/frontpage/richtext/block.js";
import * as FyiUnravelFrontpageComment from "./types/fyi/unravel/frontpage/comment.js";
import * as FyiUnravelFrontpagePost from "./types/fyi/unravel/frontpage/post.js";
import * as FyiUnravelFrontpageVote from "./types/fyi/unravel/frontpage/vote.js";

export * as ComAtprotoRepoApplyWrites from "./types/com/atproto/repo/applyWrites.js";
export * as ComAtprotoRepoCreateRecord from "./types/com/atproto/repo/createRecord.js";
export * as ComAtprotoRepoDefs from "./types/com/atproto/repo/defs.js";
export * as ComAtprotoRepoDeleteRecord from "./types/com/atproto/repo/deleteRecord.js";
export * as ComAtprotoRepoDescribeRepo from "./types/com/atproto/repo/describeRepo.js";
export * as ComAtprotoRepoGetRecord from "./types/com/atproto/repo/getRecord.js";
export * as ComAtprotoRepoImportRepo from "./types/com/atproto/repo/importRepo.js";
export * as ComAtprotoRepoListMissingBlobs from "./types/com/atproto/repo/listMissingBlobs.js";
export * as ComAtprotoRepoListRecords from "./types/com/atproto/repo/listRecords.js";
export * as ComAtprotoRepoPutRecord from "./types/com/atproto/repo/putRecord.js";
export * as ComAtprotoRepoStrongRef from "./types/com/atproto/repo/strongRef.js";
export * as ComAtprotoRepoUploadBlob from "./types/com/atproto/repo/uploadBlob.js";
export * as FyiFrontpageFeedComment from "./types/fyi/frontpage/feed/comment.js";
export * as FyiFrontpageFeedPost from "./types/fyi/frontpage/feed/post.js";
export * as FyiFrontpageFeedVote from "./types/fyi/frontpage/feed/vote.js";
export * as FyiFrontpageRichtextBlock from "./types/fyi/frontpage/richtext/block.js";
export * as FyiUnravelFrontpageComment from "./types/fyi/unravel/frontpage/comment.js";
export * as FyiUnravelFrontpagePost from "./types/fyi/unravel/frontpage/post.js";
export * as FyiUnravelFrontpageVote from "./types/fyi/unravel/frontpage/vote.js";

export class AtpBaseClient extends XrpcClient {
  com: ComNS;
  fyi: FyiNS;

  constructor(options: FetchHandler | FetchHandlerOptions) {
    super(options, schemas);
    this.com = new ComNS(this);
    this.fyi = new FyiNS(this);
  }

  /** @deprecated use `this` instead */
  get xrpc(): XrpcClient {
    return this;
  }
}

export class ComNS {
  _client: XrpcClient;
  atproto: ComAtprotoNS;

  constructor(client: XrpcClient) {
    this._client = client;
    this.atproto = new ComAtprotoNS(client);
  }
}

export class ComAtprotoNS {
  _client: XrpcClient;
  repo: ComAtprotoRepoNS;

  constructor(client: XrpcClient) {
    this._client = client;
    this.repo = new ComAtprotoRepoNS(client);
  }
}

export class ComAtprotoRepoNS {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  applyWrites(
    data?: ComAtprotoRepoApplyWrites.InputSchema,
    opts?: ComAtprotoRepoApplyWrites.CallOptions,
  ): Promise<ComAtprotoRepoApplyWrites.Response> {
    return this._client
      .call("com.atproto.repo.applyWrites", opts?.qp, data, opts)
      .catch((e) => {
        throw ComAtprotoRepoApplyWrites.toKnownErr(e);
      });
  }

  createRecord(
    data?: ComAtprotoRepoCreateRecord.InputSchema,
    opts?: ComAtprotoRepoCreateRecord.CallOptions,
  ): Promise<ComAtprotoRepoCreateRecord.Response> {
    return this._client
      .call("com.atproto.repo.createRecord", opts?.qp, data, opts)
      .catch((e) => {
        throw ComAtprotoRepoCreateRecord.toKnownErr(e);
      });
  }

  deleteRecord(
    data?: ComAtprotoRepoDeleteRecord.InputSchema,
    opts?: ComAtprotoRepoDeleteRecord.CallOptions,
  ): Promise<ComAtprotoRepoDeleteRecord.Response> {
    return this._client
      .call("com.atproto.repo.deleteRecord", opts?.qp, data, opts)
      .catch((e) => {
        throw ComAtprotoRepoDeleteRecord.toKnownErr(e);
      });
  }

  describeRepo(
    params?: ComAtprotoRepoDescribeRepo.QueryParams,
    opts?: ComAtprotoRepoDescribeRepo.CallOptions,
  ): Promise<ComAtprotoRepoDescribeRepo.Response> {
    return this._client.call(
      "com.atproto.repo.describeRepo",
      params,
      undefined,
      opts,
    );
  }

  getRecord(
    params?: ComAtprotoRepoGetRecord.QueryParams,
    opts?: ComAtprotoRepoGetRecord.CallOptions,
  ): Promise<ComAtprotoRepoGetRecord.Response> {
    return this._client
      .call("com.atproto.repo.getRecord", params, undefined, opts)
      .catch((e) => {
        throw ComAtprotoRepoGetRecord.toKnownErr(e);
      });
  }

  importRepo(
    data?: ComAtprotoRepoImportRepo.InputSchema,
    opts?: ComAtprotoRepoImportRepo.CallOptions,
  ): Promise<ComAtprotoRepoImportRepo.Response> {
    return this._client.call(
      "com.atproto.repo.importRepo",
      opts?.qp,
      data,
      opts,
    );
  }

  listMissingBlobs(
    params?: ComAtprotoRepoListMissingBlobs.QueryParams,
    opts?: ComAtprotoRepoListMissingBlobs.CallOptions,
  ): Promise<ComAtprotoRepoListMissingBlobs.Response> {
    return this._client.call(
      "com.atproto.repo.listMissingBlobs",
      params,
      undefined,
      opts,
    );
  }

  listRecords(
    params?: ComAtprotoRepoListRecords.QueryParams,
    opts?: ComAtprotoRepoListRecords.CallOptions,
  ): Promise<ComAtprotoRepoListRecords.Response> {
    return this._client.call(
      "com.atproto.repo.listRecords",
      params,
      undefined,
      opts,
    );
  }

  putRecord(
    data?: ComAtprotoRepoPutRecord.InputSchema,
    opts?: ComAtprotoRepoPutRecord.CallOptions,
  ): Promise<ComAtprotoRepoPutRecord.Response> {
    return this._client
      .call("com.atproto.repo.putRecord", opts?.qp, data, opts)
      .catch((e) => {
        throw ComAtprotoRepoPutRecord.toKnownErr(e);
      });
  }

  uploadBlob(
    data?: ComAtprotoRepoUploadBlob.InputSchema,
    opts?: ComAtprotoRepoUploadBlob.CallOptions,
  ): Promise<ComAtprotoRepoUploadBlob.Response> {
    return this._client.call(
      "com.atproto.repo.uploadBlob",
      opts?.qp,
      data,
      opts,
    );
  }
}

export class FyiNS {
  _client: XrpcClient;
  frontpage: FyiFrontpageNS;
  unravel: FyiUnravelNS;

  constructor(client: XrpcClient) {
    this._client = client;
    this.frontpage = new FyiFrontpageNS(client);
    this.unravel = new FyiUnravelNS(client);
  }
}

export class FyiFrontpageNS {
  _client: XrpcClient;
  feed: FyiFrontpageFeedNS;
  richtext: FyiFrontpageRichtextNS;

  constructor(client: XrpcClient) {
    this._client = client;
    this.feed = new FyiFrontpageFeedNS(client);
    this.richtext = new FyiFrontpageRichtextNS(client);
  }
}

export class FyiFrontpageFeedNS {
  _client: XrpcClient;
  comment: FyiFrontpageFeedCommentRecord;
  post: FyiFrontpageFeedPostRecord;
  vote: FyiFrontpageFeedVoteRecord;

  constructor(client: XrpcClient) {
    this._client = client;
    this.comment = new FyiFrontpageFeedCommentRecord(client);
    this.post = new FyiFrontpageFeedPostRecord(client);
    this.vote = new FyiFrontpageFeedVoteRecord(client);
  }
}

export class FyiFrontpageFeedCommentRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, "collection">,
  ): Promise<{
    cursor?: string;
    records: { uri: string; value: FyiFrontpageFeedComment.Record }[];
  }> {
    const res = await this._client.call("com.atproto.repo.listRecords", {
      collection: "fyi.frontpage.feed.comment",
      ...params,
    });
    return res.data;
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, "collection">,
  ): Promise<{
    uri: string;
    cid: string;
    value: FyiFrontpageFeedComment.Record;
  }> {
    const res = await this._client.call("com.atproto.repo.getRecord", {
      collection: "fyi.frontpage.feed.comment",
      ...params,
    });
    return res.data;
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<FyiFrontpageFeedComment.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "fyi.frontpage.feed.comment";
    const res = await this._client.call(
      "com.atproto.repo.createRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<FyiFrontpageFeedComment.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "fyi.frontpage.feed.comment";
    const res = await this._client.call(
      "com.atproto.repo.putRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, "collection">,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      "com.atproto.repo.deleteRecord",
      undefined,
      { collection: "fyi.frontpage.feed.comment", ...params },
      { headers },
    );
  }
}

export class FyiFrontpageFeedPostRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, "collection">,
  ): Promise<{
    cursor?: string;
    records: { uri: string; value: FyiFrontpageFeedPost.Record }[];
  }> {
    const res = await this._client.call("com.atproto.repo.listRecords", {
      collection: "fyi.frontpage.feed.post",
      ...params,
    });
    return res.data;
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, "collection">,
  ): Promise<{ uri: string; cid: string; value: FyiFrontpageFeedPost.Record }> {
    const res = await this._client.call("com.atproto.repo.getRecord", {
      collection: "fyi.frontpage.feed.post",
      ...params,
    });
    return res.data;
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<FyiFrontpageFeedPost.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "fyi.frontpage.feed.post";
    const res = await this._client.call(
      "com.atproto.repo.createRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<FyiFrontpageFeedPost.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "fyi.frontpage.feed.post";
    const res = await this._client.call(
      "com.atproto.repo.putRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, "collection">,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      "com.atproto.repo.deleteRecord",
      undefined,
      { collection: "fyi.frontpage.feed.post", ...params },
      { headers },
    );
  }
}

export class FyiFrontpageFeedVoteRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, "collection">,
  ): Promise<{
    cursor?: string;
    records: { uri: string; value: FyiFrontpageFeedVote.Record }[];
  }> {
    const res = await this._client.call("com.atproto.repo.listRecords", {
      collection: "fyi.frontpage.feed.vote",
      ...params,
    });
    return res.data;
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, "collection">,
  ): Promise<{ uri: string; cid: string; value: FyiFrontpageFeedVote.Record }> {
    const res = await this._client.call("com.atproto.repo.getRecord", {
      collection: "fyi.frontpage.feed.vote",
      ...params,
    });
    return res.data;
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<FyiFrontpageFeedVote.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "fyi.frontpage.feed.vote";
    const res = await this._client.call(
      "com.atproto.repo.createRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<FyiFrontpageFeedVote.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "fyi.frontpage.feed.vote";
    const res = await this._client.call(
      "com.atproto.repo.putRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, "collection">,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      "com.atproto.repo.deleteRecord",
      undefined,
      { collection: "fyi.frontpage.feed.vote", ...params },
      { headers },
    );
  }
}

export class FyiFrontpageRichtextNS {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }
}

export class FyiUnravelNS {
  _client: XrpcClient;
  frontpage: FyiUnravelFrontpageNS;

  constructor(client: XrpcClient) {
    this._client = client;
    this.frontpage = new FyiUnravelFrontpageNS(client);
  }
}

export class FyiUnravelFrontpageNS {
  _client: XrpcClient;
  comment: FyiUnravelFrontpageCommentRecord;
  post: FyiUnravelFrontpagePostRecord;
  vote: FyiUnravelFrontpageVoteRecord;

  constructor(client: XrpcClient) {
    this._client = client;
    this.comment = new FyiUnravelFrontpageCommentRecord(client);
    this.post = new FyiUnravelFrontpagePostRecord(client);
    this.vote = new FyiUnravelFrontpageVoteRecord(client);
  }
}

export class FyiUnravelFrontpageCommentRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, "collection">,
  ): Promise<{
    cursor?: string;
    records: { uri: string; value: FyiUnravelFrontpageComment.Record }[];
  }> {
    const res = await this._client.call("com.atproto.repo.listRecords", {
      collection: "fyi.unravel.frontpage.comment",
      ...params,
    });
    return res.data;
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, "collection">,
  ): Promise<{
    uri: string;
    cid: string;
    value: FyiUnravelFrontpageComment.Record;
  }> {
    const res = await this._client.call("com.atproto.repo.getRecord", {
      collection: "fyi.unravel.frontpage.comment",
      ...params,
    });
    return res.data;
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<FyiUnravelFrontpageComment.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "fyi.unravel.frontpage.comment";
    const res = await this._client.call(
      "com.atproto.repo.createRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<FyiUnravelFrontpageComment.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "fyi.unravel.frontpage.comment";
    const res = await this._client.call(
      "com.atproto.repo.putRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, "collection">,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      "com.atproto.repo.deleteRecord",
      undefined,
      { collection: "fyi.unravel.frontpage.comment", ...params },
      { headers },
    );
  }
}

export class FyiUnravelFrontpagePostRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, "collection">,
  ): Promise<{
    cursor?: string;
    records: { uri: string; value: FyiUnravelFrontpagePost.Record }[];
  }> {
    const res = await this._client.call("com.atproto.repo.listRecords", {
      collection: "fyi.unravel.frontpage.post",
      ...params,
    });
    return res.data;
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, "collection">,
  ): Promise<{
    uri: string;
    cid: string;
    value: FyiUnravelFrontpagePost.Record;
  }> {
    const res = await this._client.call("com.atproto.repo.getRecord", {
      collection: "fyi.unravel.frontpage.post",
      ...params,
    });
    return res.data;
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<FyiUnravelFrontpagePost.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "fyi.unravel.frontpage.post";
    const res = await this._client.call(
      "com.atproto.repo.createRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<FyiUnravelFrontpagePost.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "fyi.unravel.frontpage.post";
    const res = await this._client.call(
      "com.atproto.repo.putRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, "collection">,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      "com.atproto.repo.deleteRecord",
      undefined,
      { collection: "fyi.unravel.frontpage.post", ...params },
      { headers },
    );
  }
}

export class FyiUnravelFrontpageVoteRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, "collection">,
  ): Promise<{
    cursor?: string;
    records: { uri: string; value: FyiUnravelFrontpageVote.Record }[];
  }> {
    const res = await this._client.call("com.atproto.repo.listRecords", {
      collection: "fyi.unravel.frontpage.vote",
      ...params,
    });
    return res.data;
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, "collection">,
  ): Promise<{
    uri: string;
    cid: string;
    value: FyiUnravelFrontpageVote.Record;
  }> {
    const res = await this._client.call("com.atproto.repo.getRecord", {
      collection: "fyi.unravel.frontpage.vote",
      ...params,
    });
    return res.data;
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<FyiUnravelFrontpageVote.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "fyi.unravel.frontpage.vote";
    const res = await this._client.call(
      "com.atproto.repo.createRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<FyiUnravelFrontpageVote.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "fyi.unravel.frontpage.vote";
    const res = await this._client.call(
      "com.atproto.repo.putRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, "collection">,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      "com.atproto.repo.deleteRecord",
      undefined,
      { collection: "fyi.unravel.frontpage.vote", ...params },
      { headers },
    );
  }
}
