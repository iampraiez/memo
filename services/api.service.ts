/**
 * Base API service for handling fetch requests with consistent error handling.
 */

export class ApiError extends Error {
  constructor(public message: string, public status: number, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }
    throw new ApiError(
      errorData?.error || response.statusText || "An error occurred",
      response.status,
      errorData
    );
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const apiService = {
  get: <T>(url: string, options?: RequestInit) => request<T>(url, { ...options, method: "GET" }),
  post: <T>(url: string, data?: any, options?: RequestInit) =>
    request<T>(url, { ...options, method: "POST", body: JSON.stringify(data) }),
  patch: <T>(url: string, data?: any, options?: RequestInit) =>
    request<T>(url, { ...options, method: "PATCH", body: JSON.stringify(data) }),
  put: <T>(url: string, data?: any, options?: RequestInit) =>
    request<T>(url, { ...options, method: "PUT", body: JSON.stringify(data) }),
  delete: <T>(url: string, options?: RequestInit) => request<T>(url, { ...options, method: "DELETE" }),
};
