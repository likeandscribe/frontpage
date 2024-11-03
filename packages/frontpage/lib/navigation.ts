import { DID } from "./data/atproto/did";

type PostInput = {
  handleOrDid: string | DID;
  rkey: string;
};

export function getPostLink({ handleOrDid, rkey }: PostInput) {
  return `/post/${handleOrDid}/${rkey}`;
}

type CommentInput = {
  post: PostInput;
  handleOrDid: string | DID;
  rkey: string;
};

export function getCommentLink({ post, handleOrDid, rkey }: CommentInput) {
  return `/post/${post.handleOrDid}/${post.rkey}/${handleOrDid}/${rkey}`;
}
