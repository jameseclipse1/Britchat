"use client";

import { useState } from "react";
import { resetChatterPassword } from "@/app/actions";

export default function ResetPasswordButton({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!open) {
    return (
      <button className="text-xs underline cursor-pointer" onClick={() => setOpen(true)}>
        Reset password
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 items-end">
      <div className="flex gap-1.5">
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="text-xs"
          style={{ width: 140, padding: "6px 8px" }}
        />
        <button
          className="btn accent"
          style={{ padding: "6px 12px", fontSize: 12 }}
          disabled={pending}
          onClick={async () => {
            setPending(true);
            const result = await resetChatterPassword(userId, password);
            setPending(false);
            if (result && "error" in result) setMessage(result.error);
            else {
              setMessage("Done.");
              setPassword("");
              setTimeout(() => setOpen(false), 1200);
            }
          }}
        >
          {pending ? "..." : "Save"}
        </button>
      </div>
      {message && <span className="text-xs" style={{ color: "var(--muted)" }}>{message}</span>}
    </div>
  );
}
