"use client";

import { Button } from "@/lib/components/ui/button";
import { cn, exhaustiveCheck } from "@/lib/utils";
import { ChevronUpIcon } from "@radix-ui/react-icons";
import { useState } from "react";

export type VoteButtonState = "voted" | "unvoted" | "authored";

type VoteButtonProps = {
  voteAction: () => Promise<void>;
  unvoteAction: () => Promise<void>;
  initialState: VoteButtonState;
  votes?: number;
  disabled?: boolean;
};

export function VoteButton({
  voteAction,
  unvoteAction,
  initialState,
  votes,
  disabled,
}: VoteButtonProps) {
  // TODO: useOptimistic here to fix cached vote count bug
  const [hasOptimisticallyVoted, setHasOptimisticallyVoted] = useState<
    null | boolean
  >(null);

  const hasVoted =
    hasOptimisticallyVoted !== null
      ? hasOptimisticallyVoted
      : initialState === "voted" || initialState === "authored";

  let actualVotes = votes ?? 0;

  // voteCount = 1
  // initialState === "voted"
  // hasOptimisticallyVoted === null => voteCount + 1 => 2
  // hasOptimisticallyVoted === true => voteCount + 1 => 2
  // hasOptimisticallyVoted === false => voteCount => 1

  // voteCount = 1
  // initialState === "unvoted"
  // hasOptimisticallyVoted === null => voteCount + 1 => 2
  // hasOptimisticallyVoted === true => voteCount + 2 => 3
  // hasOptimisticallyVoted === false => voteCount + 1 => 2
  if (initialState === "voted" || initialState === "authored") {
    actualVotes += hasOptimisticallyVoted === false ? 0 : 1;
  } else if (initialState === "unvoted") {
    actualVotes += hasOptimisticallyVoted === true ? 2 : 1;
  } else {
    exhaustiveCheck(initialState, "Invalid state");
  }

  return (
    <form
      // Action or unSubmit won't be triggered if you're an author because the button is disabled in that case
      action={hasVoted ? unvoteAction : voteAction}
      onSubmit={(e) => {
        e.preventDefault();
        if (hasVoted) {
          void unvoteAction();
          setHasOptimisticallyVoted(false);
        } else {
          void voteAction();
          setHasOptimisticallyVoted(true);
        }
      }}
      className="contents"
    >
      <Button
        variant="ghost"
        size="icon"
        disabled={disabled || initialState === "authored"}
        name={hasVoted ? "unvote" : "vote"}
        aria-label={hasVoted ? "Unvote" : "Vote"}
      >
        <ChevronUpIcon
          className={cn(
            "w-5 h-5",
            hasVoted && "text-yellow-500 group-disabled:text-yellow-500",
          )}
        />
      </Button>
      {votes === undefined ? null : (
        <span className="font-medium">{actualVotes}</span>
      )}
    </form>
  );
}
