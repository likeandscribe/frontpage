"use client";
import { useActionState } from "react";
import { navigateUriAction } from "./actions";

export function AtUriForm({
  defaultUri,
  style,
}: {
  defaultUri?: string;
  style?: React.CSSProperties;
}) {
  const [state, action, isPending] = useActionState(
    navigateUriAction,
    undefined,
  );
  return (
    <div style={style}>
      <form action={action} style={{ display: "flex" }}>
        <input
          style={{ flexGrow: 1 }}
          type="text"
          name="uri"
          key={defaultUri}
          defaultValue={defaultUri}
        />
        <button type="submit" disabled={isPending}>
          Go
        </button>
      </form>
      {state?.error ? <p style={{ color: "red" }}>{state.error}</p> : null}
    </div>
  );
}
