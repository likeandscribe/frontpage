/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { XrpcClient, FetchHandler, FetchHandlerOptions } from "@atproto/xrpc";
import { schemas } from "./lexicons";
import { CID } from "multiformats/cid";
import * as ComAtprotoRepoApplyWrites from "./types/com/atproto/repo/applyWrites";
import * as ComAtprotoRepoCreateRecord from "./types/com/atproto/repo/createRecord";
import * as ComAtprotoRepoDefs from "./types/com/atproto/repo/defs";
import * as ComAtprotoRepoDeleteRecord from "./types/com/atproto/repo/deleteRecord";
import * as ComAtprotoRepoDescribeRepo from "./types/com/atproto/repo/describeRepo";
import * as ComAtprotoRepoGetRecord from "./types/com/atproto/repo/getRecord";
import * as ComAtprotoRepoImportRepo from "./types/com/atproto/repo/importRepo";
import * as ComAtprotoRepoListMissingBlobs from "./types/com/atproto/repo/listMissingBlobs";
import * as ComAtprotoRepoListRecords from "./types/com/atproto/repo/listRecords";
import * as ComAtprotoRepoPutRecord from "./types/com/atproto/repo/putRecord";
import * as ComAtprotoRepoStrongRef from "./types/com/atproto/repo/strongRef";
import * as ComAtprotoRepoUploadBlob from "./types/com/atproto/repo/uploadBlob";
import * as FyiUnravelFrontpageComment from "./types/fyi/unravel/frontpage/comment";
import * as FyiUnravelFrontpagePost from "./types/fyi/unravel/frontpage/post";
import * as FyiUnravelFrontpageVote from "./types/fyi/unravel/frontpage/vote";

export * as ComAtprotoRepoApplyWrites from "./types/com/atproto/repo/applyWrites";
export * as ComAtprotoRepoCreateRecord from "./types/com/atproto/repo/createRecord";
export * as ComAtprotoRepoDefs from "./types/com/atproto/repo/defs";
export * as ComAtprotoRepoDeleteRecord from "./types/com/atproto/repo/deleteRecord";
export * as ComAtprotoRepoDescribeRepo from "./types/com/atproto/repo/describeRepo";
export * as ComAtprotoRepoGetRecord from "./types/com/atproto/repo/getRecord";
export * as ComAtprotoRepoImportRepo from "./types/com/atproto/repo/importRepo";
export * as ComAtprotoRepoListMissingBlobs from "./types/com/atproto/repo/listMissingBlobs";
export * as ComAtprotoRepoListRecords from "./types/com/atproto/repo/listRecords";
export * as ComAtprotoRepoPutRecord from "./types/com/atproto/repo/putRecord";
export * as ComAtprotoRepoStrongRef from "./types/com/atproto/repo/strongRef";
export * as ComAtprotoRepoUploadBlob from "./types/com/atproto/repo/uploadBlob";
export * as FyiUnravelFrontpageComment from "./types/fyi/unravel/frontpage/comment";
export * as FyiUnravelFrontpagePost from "./types/fyi/unravel/frontpage/post";
export * as FyiUnravelFrontpageVote from "./types/fyi/unravel/frontpage/vote";

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
  unravel: FyiUnravelNS;

  constructor(client: XrpcClient) {
    this._client = client;
    this.unravel = new FyiUnravelNS(client);
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
  comment: CommentRecord;
  post: PostRecord;
  vote: VoteRecord;

  constructor(client: XrpcClient) {
    this._client = client;
    this.comment = new CommentRecord(client);
    this.post = new PostRecord(client);
    this.vote = new VoteRecord(client);
  }
}

export class CommentRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(
    params: Omit<ComAtprotoRepoListRecords.QueryParams, "collection">,
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
    params: Omit<ComAtprotoRepoGetRecord.QueryParams, "collection">,
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
    params: Omit<
      ComAtprotoRepoCreateRecord.InputSchema,
      "collection" | "record"
    >,
    record: FyiUnravelFrontpageComment.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = "fyi.unravel.frontpage.comment";
    const res = await this._client.call(
      "com.atproto.repo.createRecord",
      undefined,
      { collection: "fyi.unravel.frontpage.comment", ...params, record },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async delete(
    params: Omit<ComAtprotoRepoDeleteRecord.InputSchema, "collection">,
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

export class PostRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(
    params: Omit<ComAtprotoRepoListRecords.QueryParams, "collection">,
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
    params: Omit<ComAtprotoRepoGetRecord.QueryParams, "collection">,
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
    params: Omit<
      ComAtprotoRepoCreateRecord.InputSchema,
      "collection" | "record"
    >,
    record: FyiUnravelFrontpagePost.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = "fyi.unravel.frontpage.post";
    const res = await this._client.call(
      "com.atproto.repo.createRecord",
      undefined,
      { collection: "fyi.unravel.frontpage.post", ...params, record },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async delete(
    params: Omit<ComAtprotoRepoDeleteRecord.InputSchema, "collection">,
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

export class VoteRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(
    params: Omit<ComAtprotoRepoListRecords.QueryParams, "collection">,
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
    params: Omit<ComAtprotoRepoGetRecord.QueryParams, "collection">,
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
    params: Omit<
      ComAtprotoRepoCreateRecord.InputSchema,
      "collection" | "record"
    >,
    record: FyiUnravelFrontpageVote.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = "fyi.unravel.frontpage.vote";
    const res = await this._client.call(
      "com.atproto.repo.createRecord",
      undefined,
      { collection: "fyi.unravel.frontpage.vote", ...params, record },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async delete(
    params: Omit<ComAtprotoRepoDeleteRecord.InputSchema, "collection">,
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
