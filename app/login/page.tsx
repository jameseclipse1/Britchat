import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div
        className="card w-full max-w-sm text-center"
        style={{ boxShadow: "0 8px 24px var(--shadow)" }}
      >
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold display"
          style={{ background: "var(--pitch)", color: "var(--pitch-ink)" }}
        >
          BC
        </div>
        <h1 className="text-2xl mb-1">BritChat</h1>
        <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
          Sign in with the username and password your manager set up for you.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
