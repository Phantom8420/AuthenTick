import { demoActive, enableDemo, isDemoToken, mockRequest } from "@/lib/mockApi";

const base = () =>
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "";

let authProvider: (() => Promise<boolean>) | null = null;
/** The wallet layer registers how to sign in, so a 401 can recover without the page knowing. */
export const setAuthProvider = (fn: (() => Promise<boolean>) | null) => {
  authProvider = fn;
};

async function request<T>(method: "GET" | "POST", path: string, body?: unknown, retried = false): Promise<T> {
  if (!demoActive()) {
    // the built-in demo token always resolves locally, so it works from the search bar on any host
    const ref = decodeURIComponent(path.split("?")[0].split("/").filter(Boolean).pop() ?? "");
    const tokenInBody = typeof (body as { tokenId?: unknown })?.tokenId === "string" && isDemoToken((body as { tokenId: string }).tokenId);
    if (isDemoToken(ref) || tokenInBody) enableDemo(true, "token");
  }
  if (demoActive()) return mockRequest<T>(method, path, body);

  let res: Response;
  try {
    res = await fetch(`${base()}${path}`, {
      method,
      // the session is an httpOnly cookie the browser attaches; the header is the anti-CSRF proof
      credentials: "include",
      headers: {
        "X-Requested-With": "authentick",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // backend unreachable: fall back to the in-browser demo so the app still works
    enableDemo(true);
    return mockRequest<T>(method, path, body);
  }

  // a host with no API typically answers /api/* with its HTML shell
  if (!(res.headers.get("content-type") ?? "").includes("json")) {
    enableDemo(true);
    return mockRequest<T>(method, path, body);
  }

  // the API wants a wallet sign-in: do it once, then replay the call
  if (res.status === 401 && !retried && authProvider && !path.startsWith("/api/auth")) {
    if (await authProvider()) return request<T>(method, path, body, true);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  return res.json() as Promise<T>;
}

/** Ends the cookie session. Best effort: the cookie also expires on its own. */
export const logout = async () => {
  if (demoActive()) return;
  try {
    await fetch(`${base()}/api/auth/logout`, { method: "POST", credentials: "include", headers: { "X-Requested-With": "authentick" } });
  } catch {
    /* offline: nothing to end */
  }
};

export const apiGet = <T,>(path: string) => request<T>("GET", path);
export const apiPost = <T,>(path: string, body: unknown) => request<T>("POST", path, body);
