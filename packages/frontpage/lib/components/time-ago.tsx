import { formatDistance, format } from "date-fns";
import {
  SimpleTooltip,
  type TooltipContentProps,
} from "@/lib/components/ui/tooltip";

export function TimeAgo({
  createdAt,
  side,
  className,
}: {
  createdAt: Date;
  side?: TooltipContentProps["side"];
  className?: string;
}) {
  return (
    <SimpleTooltip
      content={format(createdAt, "EEEE do MMMM y,  pp")}
      side={side}
    >
      <span className={className}>
        {formatDistance(createdAt, new Date())} ago
      </span>
    </SimpleTooltip>
  );
}
