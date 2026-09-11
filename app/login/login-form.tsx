"use client";

import { useActionState } from "react";
import { signIn } from "@/app/actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="text" name="username" placeholder="Username" autoComplete="username" required />
      <input
        type="password"
        name="password"
        placeholder="Password"
        autoComplete="current-password"
        required
      />
      {state?.error && (
        <p className="text-sm" style={{ color: "var(--bad)" }}>
          {state.error}
        </p>
      )}
      <button type="submit" className="btn accent" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
