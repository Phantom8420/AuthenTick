import { demoActive, enableDemo, mockRequest } from "@/lib/mockApi";

const base = () =>
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "";

async function request<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  if (demoActive()) return mockRequest<T>(method, path, body);

  let res: Response;
  try {
    res = await fetch(`${base()}${path}`, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
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

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  return res.json() as Promise<T>;
}

export const apiGet = <T,>(path: string) => request<T>("GET", path);
export const apiPost = <T,>(path: string, body: unknown) => request<T>("POST", path, body);
