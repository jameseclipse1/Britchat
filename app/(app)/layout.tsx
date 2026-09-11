import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";
import TabLink from "./tab-link";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  let profile: { display_name: string; role: string } | null = null;
  if (userData.user) {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, role")
      .eq("id", userData.user.id)
      .single();
    profile = data;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-12">
      <header
        className="sticky top-0 z-10 pt-4 pb-2.5 mb-5"
        style={{ background: "var(--paper)", borderBottom: "1px solid var(--line)" }}
      >
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h1 className="text-2xl flex items-baseline gap-2 m-0">
            BritChat<span style={{ color: "var(--badge-red)" }}>.</span>
          </h1>
          <div className="text-xs" style={{ color: "var(--muted)" }}>
            Signed in as <b style={{ color: "var(--ink)" }}>{profile?.display_name ?? "..."}</b>
            {" · "}
            <form action={signOut} className="inline">
              <button type="submit" className="underline cursor-pointer">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav className="flex gap-1.5 mt-3.5 overflow-x-auto pb-0.5">
          <TabLink href="/dictionary">Dictionary</TabLink>
          <TabLink href="/grammar">Grammar Trainer</TabLink>
          <TabLink href="/progress">My Progress</TabLink>
          {profile?.role === "admin" && <TabLink href="/admin">Admin</TabLink>}
        </nav>
      </header>
      {children}
    </div>
  );
}
