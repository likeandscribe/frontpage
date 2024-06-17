"use client";

import { Button } from "@/lib/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronUpIcon } from "@radix-ui/react-icons";
import { useState } from "react";

export type VoteButtonState = "voted" | "unvoted" | "authored";

type VoteButtonProps = {
  voteAction: () => Promise<void>;
  unvoteAction: () => Promise<void>;
  initialState: VoteButtonState;
  votes?: number;
};

export function VoteButton({
  voteAction,
  unvoteAction,
  initialState,
  votes,
}: VoteButtonProps) {
  const [hasVoted, setHasVoted] = useState(
    initialState === "voted" || initialState === "authored",
  );
  return (
    <form
      action={hasVoted ? unvoteAction : voteAction}
      onSubmit={(e) => {
        e.preventDefault();
        if (hasVoted) {
          unvoteAction();
          setHasVoted(false);
        } else {
          voteAction();
          setHasVoted(true);
        }
      }}
      className="contents"
    >
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-gray-100 dark:hover:bg-gray-800 z-10 relative"
        disabled={initialState === "authored"}
        name={hasVoted ? "unvote" : "vote"}
      >
        <ChevronUpIcon
          className={cn(
            "w-5 h-5",
            hasVoted && "text-yellow-500 disabled:text-yello-500",
          )}
        />
      </Button>
      {votes !== undefined && (
        <span className="font-medium">
          {votes + Number(initialState !== "authored" && hasVoted)}
        </span>
      )}
    </form>
  );
}