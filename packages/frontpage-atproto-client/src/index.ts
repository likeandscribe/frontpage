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
import * as ComAtprotoSyncDefs from "./types/com/atproto/sync/defs.js";
import * as ComAtprotoSyncGetBlob from "./types/com/atproto/sync/getBlob.js";
import * as ComAtprotoSyncGetBlocks from "./types/com/atproto/sync/getBlocks.js";
import * as ComAtprotoSyncGetCheckout from "./types/com/atproto/sync/getCheckout.js";
import * as ComAtprotoSyncGetHead from "./types/com/atproto/sync/getHead.js";
import * as ComAtprotoSyncGetHostStatus from "./types/com/atproto/sync/getHostStatus.js";
import * as ComAtprotoSyncGetLatestCommit from "./types/com/atproto/sync/getLatestCommit.js";
import * as ComAtprotoSyncGetRecord from "./types/com/atproto/sync/getRecord.js";
import * as ComAtprotoSyncGetRepo from "./types/com/atproto/sync/getRepo.js";
import * as ComAtprotoSyncGetRepoStatus from "./types/com/atproto/sync/getRepoStatus.js";
import * as ComAtprotoSyncListBlobs from "./types/com/atproto/sync/listBlobs.js";
import * as ComAtprotoSyncListHosts from "./types/com/atproto/sync/listHosts.js";
import * as ComAtprotoSyncListRepos from "./types/com/atproto/sync/listRepos.js";
import * as ComAtprotoSyncListReposByCollection from "./types/com/atproto/sync/listReposByCollection.js";
import * as ComAtprotoSyncNotifyOfUpdate from "./types/com/atproto/sync/notifyOfUpdate.js";
import * as ComAtprotoSyncRequestCrawl from "./types/com/atproto/sync/requestCrawl.js";
import * as ComAtprotoSyncSubscribeRepos from "./types/com/atproto/sync/subscribeRepos.js";
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
export * as ComAtprotoSyncDefs from "./types/com/atproto/sync/defs.js";
export * as ComAtprotoSyncGetBlob from "./types/com/atproto/sync/getBlob.js";
export * as ComAtprotoSyncGetBlocks from "./types/com/atproto/sync/getBlocks.js";
export * as ComAtprotoSyncGetCheckout from "./types/com/atproto/sync/getCheckout.js";
export * as ComAtprotoSyncGetHead from "./types/com/atproto/sync/getHead.js";
export * as ComAtprotoSyncGetHostStatus from "./types/com/atproto/sync/getHostStatus.js";
export * as ComAtprotoSyncGetLatestCommit from "./types/com/atproto/sync/getLatestCommit.js";
export * as ComAtprotoSyncGetRecord from "./types/com/atproto/sync/getRecord.js";
export * as ComAtprotoSyncGetRepo from "./types/com/atproto/sync/getRepo.js";
export * as ComAtprotoSyncGetRepoStatus from "./types/com/atproto/sync/getRepoStatus.js";
export * as ComAtprotoSyncListBlobs from "./types/com/atproto/sync/listBlobs.js";
export * as ComAtprotoSyncListHosts from "./types/com/atproto/sync/listHosts.js";
export * as ComAtprotoSyncListRepos from "./types/com/atproto/sync/listRepos.js";
export * as ComAtprotoSyncListReposByCollection from "./types/com/atproto/sync/listReposByCollection.js";
export * as ComAtprotoSyncNotifyOfUpdate from "./types/com/atproto/sync/notifyOfUpdate.js";
export * as ComAtprotoSyncRequestCrawl from "./types/com/atproto/sync/requestCrawl.js";
export * as ComAtprotoSyncSubscribeRepos from "./types/com/atproto/sync/subscribeRepos.js";
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
  sync: ComAtprotoSyncNS;

  constructor(client: XrpcClient) {
    this._client = client;
    this.repo = new ComAtprotoRepoNS(client);
    this.sync = new ComAtprotoSyncNS(client);
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

export class ComAtprotoSyncNS {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  getBlob(
    params?: ComAtprotoSyncGetBlob.QueryParams,
    opts?: ComAtprotoSyncGetBlob.CallOptions,
  ): Promise<ComAtprotoSyncGetBlob.Response> {
    return this._client
      .call("com.atproto.sync.getBlob", params, undefined, opts)
      .catch((e) => {
        throw ComAtprotoSyncGetBlob.toKnownErr(e);
      });
  }

  getBlocks(
    params?: ComAtprotoSyncGetBlocks.QueryParams,
    opts?: ComAtprotoSyncGetBlocks.CallOptions,
  ): Promise<ComAtprotoSyncGetBlocks.Response> {
    return this._client
      .call("com.atproto.sync.getBlocks", params, undefined, opts)
      .catch((e) => {
        throw ComAtprotoSyncGetBlocks.toKnownErr(e);
      });
  }

  getCheckout(
    params?: ComAtprotoSyncGetCheckout.QueryParams,
    opts?: ComAtprotoSyncGetCheckout.CallOptions,
  ): Promise<ComAtprotoSyncGetCheckout.Response> {
    return this._client.call(
      "com.atproto.sync.getCheckout",
      params,
      undefined,
      opts,
    );
  }

  getHead(
    params?: ComAtprotoSyncGetHead.QueryParams,
    opts?: ComAtprotoSyncGetHead.CallOptions,
  ): Promise<ComAtprotoSyncGetHead.Response> {
    return this._client
      .call("com.atproto.sync.getHead", params, undefined, opts)
      .catch((e) => {
        throw ComAtprotoSyncGetHead.toKnownErr(e);
      });
  }

  getHostStatus(
    params?: ComAtprotoSyncGetHostStatus.QueryParams,
    opts?: ComAtprotoSyncGetHostStatus.CallOptions,
  ): Promise<ComAtprotoSyncGetHostStatus.Response> {
    return this._client
      .call("com.atproto.sync.getHostStatus", params, undefined, opts)
      .catch((e) => {
        throw ComAtprotoSyncGetHostStatus.toKnownErr(e);
      });
  }

  getLatestCommit(
    params?: ComAtprotoSyncGetLatestCommit.QueryParams,
    opts?: ComAtprotoSyncGetLatestCommit.CallOptions,
  ): Promise<ComAtprotoSyncGetLatestCommit.Response> {
    return this._client
      .call("com.atproto.sync.getLatestCommit", params, undefined, opts)
      .catch((e) => {
        throw ComAtprotoSyncGetLatestCommit.toKnownErr(e);
      });
  }

  getRecord(
    params?: ComAtprotoSyncGetRecord.QueryParams,
    opts?: ComAtprotoSyncGetRecord.CallOptions,
  ): Promise<ComAtprotoSyncGetRecord.Response> {
    return this._client
      .call("com.atproto.sync.getRecord", params, undefined, opts)
      .catch((e) => {
        throw ComAtprotoSyncGetRecord.toKnownErr(e);
      });
  }

  getRepo(
    params?: ComAtprotoSyncGetRepo.QueryParams,
    opts?: ComAtprotoSyncGetRepo.CallOptions,
  ): Promise<ComAtprotoSyncGetRepo.Response> {
    return this._client
      .call("com.atproto.sync.getRepo", params, undefined, opts)
      .catch((e) => {
        throw ComAtprotoSyncGetRepo.toKnownErr(e);
      });
  }

  getRepoStatus(
    params?: ComAtprotoSyncGetRepoStatus.QueryParams,
    opts?: ComAtprotoSyncGetRepoStatus.CallOptions,
  ): Promise<ComAtprotoSyncGetRepoStatus.Response> {
    return this._client
      .call("com.atproto.sync.getRepoStatus", params, undefined, opts)
      .catch((e) => {
        throw ComAtprotoSyncGetRepoStatus.toKnownErr(e);
      });
  }

  listBlobs(
    params?: ComAtprotoSyncListBlobs.QueryParams,
    opts?: ComAtprotoSyncListBlobs.CallOptions,
  ): Promise<ComAtprotoSyncListBlobs.Response> {
    return this._client
      .call("com.atproto.sync.listBlobs", params, undefined, opts)
      .catch((e) => {
        throw ComAtprotoSyncListBlobs.toKnownErr(e);
      });
  }

  listHosts(
    params?: ComAtprotoSyncListHosts.QueryParams,
    opts?: ComAtprotoSyncListHosts.CallOptions,
  ): Promise<ComAtprotoSyncListHosts.Response> {
    return this._client.call(
      "com.atproto.sync.listHosts",
      params,
      undefined,
      opts,
    );
  }

  listRepos(
    params?: ComAtprotoSyncListRepos.QueryParams,
    opts?: ComAtprotoSyncListRepos.CallOptions,
  ): Promise<ComAtprotoSyncListRepos.Response> {
    return this._client.call(
      "com.atproto.sync.listRepos",
      params,
      undefined,
      opts,
    );
  }

  listReposByCollection(
    params?: ComAtprotoSyncListReposByCollection.QueryParams,
    opts?: ComAtprotoSyncListReposByCollection.CallOptions,
  ): Promise<ComAtprotoSyncListReposByCollection.Response> {
    return this._client.call(
      "com.atproto.sync.listReposByCollection",
      params,
      undefined,
      opts,
    );
  }

  notifyOfUpdate(
    data?: ComAtprotoSyncNotifyOfUpdate.InputSchema,
    opts?: ComAtprotoSyncNotifyOfUpdate.CallOptions,
  ): Promise<ComAtprotoSyncNotifyOfUpdate.Response> {
    return this._client.call(
      "com.atproto.sync.notifyOfUpdate",
      opts?.qp,
      data,
      opts,
    );
  }

  requestCrawl(
    data?: ComAtprotoSyncRequestCrawl.InputSchema,
    opts?: ComAtprotoSyncRequestCrawl.CallOptions,
  ): Promise<ComAtprotoSyncRequestCrawl.Response> {
    return this._client
      .call("com.atproto.sync.requestCrawl", opts?.qp, data, opts)
      .catch((e) => {
        throw ComAtprotoSyncRequestCrawl.toKnownErr(e);
      });
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
