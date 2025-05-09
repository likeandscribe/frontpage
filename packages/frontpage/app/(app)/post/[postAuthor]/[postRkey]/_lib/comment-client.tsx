"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/lib/components/ui/alert-dialog";
import { Button } from "@/lib/components/ui/button";
import { Textarea } from "@/lib/components/ui/textarea";
import { SimpleTooltip } from "@/lib/components/ui/tooltip";
import { useToast } from "@/lib/components/ui/use-toast";
import {
  commentUnvoteAction,
  commentVoteAction,
  createCommentAction,
  deleteCommentAction,
  reportCommentAction,
} from "./actions";
import { ChatBubbleIcon, TrashIcon } from "@radix-ui/react-icons";
import {
  useActionState,
  useRef,
  useState,
  useId,
  startTransition,
} from "react";
import {
  VoteButton,
  type VoteButtonState,
} from "../../../../_components/vote-button";
import { Spinner } from "@/lib/components/ui/spinner";
import { type DID } from "@/lib/data/atproto/did";
import { InputLengthIndicator } from "@/lib/components/input-length-indicator";
import { MAX_COMMENT_LENGTH } from "@/lib/data/db/constants";
import type { CommentModel } from "@/lib/data/db/comment";
import { EllipsisDropdown } from "@/app/(app)/_components/ellipsis-dropdown";
import { ReportDialogDropdownButton } from "@/app/(app)/_components/report-dialog";
import { DeleteButton } from "@/app/(app)/_components/delete-button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ShareDropdownButton } from "@/app/(app)/_components/share-button";

const commentVariants = cva(undefined, {
  variants: {
    level: {
      0: "",
      1: "pl-8",
      2: "pl-16",
      3: "pl-24",
    },
  },
  defaultVariants: {
    level: 0,
  },
});

type CommentVariantProps = VariantProps<typeof commentVariants>;
export type CommentLevel = CommentVariantProps["level"];

type CommentClientProps = CommentVariantProps &
  Pick<CommentModel, "rkey" | "cid" | "id" | "authorDid"> & {
    postRkey: string;
    postAuthorDid: DID;
    allowReply: boolean;
    initialVoteState: VoteButtonState;
    hasAuthored: boolean;
    commentHref: string;
    children: React.ReactNode;
  };

export function CommentClientWrapperWithToolbar({
  id,
  rkey,
  cid,
  postRkey,
  authorDid,
  postAuthorDid,
  initialVoteState,
  hasAuthored,
  children,
  level,
  allowReply,
  commentHref,
}: CommentClientProps) {
  const [showNewComment, setShowNewComment] = useState(false);
  const commentRef = useRef<HTMLDivElement>(null);
  const newCommentTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  return (
    <NestComment level={level}>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <div className="flex flex-col gap-2 p-1" tabIndex={0} ref={commentRef}>
        {children}
        <div className="flex items-center gap-4">
          <SimpleTooltip content="Vote" side="bottom">
            <VoteButton
              initialState={initialVoteState}
              voteAction={commentVoteAction.bind(null, {
                authorDid,
                cid: cid!,
                rkey,
              })}
              unvoteAction={commentUnvoteAction.bind(null, id)}
            />
          </SimpleTooltip>
          <SimpleTooltip content="Comment" side="bottom">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNewComment(true)}
              disabled={!allowReply || cid === null}
            >
              <ChatBubbleIcon className="w-4 h-4" />
              <span className="sr-only">Reply</span>
            </Button>
          </SimpleTooltip>
          <SimpleTooltip content="action-menu" side="bottom">
            <EllipsisDropdown aria-label="Comment actions">
              <ShareDropdownButton path={commentHref} />
              {cid && !hasAuthored ? (
                <ReportDialogDropdownButton
                  reportAction={reportCommentAction.bind(null, {
                    authorDid: authorDid,
                    cid,
                    rkey: rkey,
                  })}
                />
              ) : null}

              {hasAuthored ? (
                <DeleteButton
                  deleteAction={deleteCommentAction.bind(null, rkey)}
                />
              ) : null}
            </EllipsisDropdown>
          </SimpleTooltip>
        </div>
      </div>
      {showNewComment ? (
        <NewComment
          textAreaRef={newCommentTextAreaRef}
          parent={{ rkey, did: authorDid }}
          postRkey={postRkey}
          postAuthorDid={postAuthorDid}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          onActionDone={() => {
            startTransition(() => {
              setShowNewComment(false);
            });
          }}
          extraButton={
            <AlertDialog>
              <SimpleTooltip content="Discard comment">
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(event) => {
                      if (newCommentTextAreaRef.current?.value.trim() === "") {
                        event.preventDefault();
                        commentRef.current?.focus();
                        setShowNewComment(false);
                      }
                    }}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
              </SimpleTooltip>
              <AlertDialogContent
                onCloseAutoFocus={() => {
                  commentRef.current?.focus();
                }}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will discard your comment.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      setShowNewComment(false);
                      toast({
                        title: "Comment discarded",
                        type: "foreground",
                      });
                    }}
                  >
                    Discard
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          }
        />
      ) : null}
    </NestComment>
  );
}

export function NestComment({
  children,
  level,
  className,
}: {
  children: React.ReactNode;
  level: CommentLevel;
  className?: string;
}) {
  return (
    <article className={cn(className, commentVariants({ level }))}>
      {children}
    </article>
  );
}

export function NewComment({
  autoFocus = false,
  parent,
  postRkey,
  postAuthorDid,
  extraButton,
  textAreaRef,
  onActionDone,
}: {
  parent?: { did: DID; rkey: string };
  postRkey: string;
  postAuthorDid: DID;
  autoFocus?: boolean;
  onActionDone?: () => void;
  extraButton?: React.ReactNode;
  textAreaRef?: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const [input, setInput] = useState("");
  const [_, action, isPending] = useActionState(
    createCommentAction.bind(null, { parent, postRkey, postAuthorDid }),
    undefined,
  );
  const id = useId();
  const textAreaId = `${id}-comment`;

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <form
      action={action}
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(() => {
          action(new FormData(event.currentTarget));
          onActionDone?.();
          setInput("");
        });
      }}
      aria-busy={isPending}
      onKeyDown={(event) => {
        const isCommentTextArea =
          "id" in event.target && event.target.id === textAreaId;

        const isCmdEnter =
          event.key === "Enter" && (event.metaKey || event.ctrlKey);

        if (isCommentTextArea && isCmdEnter) {
          event.preventDefault();
          event.currentTarget.requestSubmit();
        }
      }}
      className="space-y-2"
    >
      <Textarea
        value={input}
        onChange={(event) => {
          setInput(event.target.value);
        }}
        id={textAreaId}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        name="comment"
        ref={textAreaRef}
        placeholder="Write a comment..."
        disabled={isPending}
        className="resize-y flex-1"
      />
      <div className="w-full flex justify-between">
        <InputLengthIndicator
          length={input.length}
          maxLength={MAX_COMMENT_LENGTH}
        />
        <div className="flex gap-2">
          {extraButton}
          <Button type="submit" disabled={isPending}>
            {isPending ? <Spinner /> : "Post"}
          </Button>
        </div>
      </div>
    </form>
  );
}
