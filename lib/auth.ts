const USERNAME_DOMAIN = "britchat.internal";

// Chatters log in with a plain username; Supabase Auth needs an email shape,
// so we map deterministically and never show this address anywhere in the UI.
export function usernameToEmail(username: string): string {
  return `${normalizeUsername(username)}@${USERNAME_DOMAIN}`;
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase().replace(/\s+/g, "-");
}

export function isValidUsername(username: string): boolean {
  return /^[a-z0-9-]{2,32}$/.test(normalizeUsername(username));
}
