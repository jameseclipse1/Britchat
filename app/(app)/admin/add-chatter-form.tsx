"use client";

import { useActionState, useRef } from "react";
import { createChatter } from "@/app/actions";

export default function AddChatterForm() {
  const [state, formAction, pending] = useActionState(createChatter, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await formAction(fd);
        formRef.current?.reset();
      }}
      className="card flex flex-col gap-2.5"
    >
      <h3 className="text-sm font-bold m-0" style={{ textTransform: "none" }}>
        Add a chatter
      </h3>
      <input type="text" name="displayName" placeholder="Display name (e.g. Priya)" required />
      <input type="text" name="username" placeholder="Username (e.g. priya)" required />
      <input
        type="password"
        name="password"
        placeholder="Temporary password (8+ characters)"
        required
        minLength={8}
      />
      {state && "error" in state && (
        <p className="text-sm" style={{ color: "var(--bad)" }}>
          {state.error}
        </p>
      )}
      {state && "success" in state && (
        <p className="text-sm" style={{ color: "var(--good)" }}>
          Added @{state.username}. Share the username and password with them directly.
        </p>
      )}
      <button type="submit" className="btn accent" disabled={pending}>
        {pending ? "Adding..." : "Add chatter"}
      </button>
    </form>
  );
}
