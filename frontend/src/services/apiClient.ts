import { auth } from "./firebase";

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`API request failed with status ${status}`);
    this.status = status;
    this.body = body;
  }
}

async function authHeader(): Promise<Record<string, string>> {
  const idToken = await auth.currentUser?.getIdToken();
  return idToken ? { Authorization: `Bearer ${idToken}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...(await authHeader()),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const body = response.status === 204 ? undefined : await response.json().catch(() => undefined);

  if (!response.ok) {
    throw new ApiError(response.status, body);
  }

  return body as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "POST", body: data ? JSON.stringify(data) : undefined }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "PUT", body: data ? JSON.stringify(data) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
