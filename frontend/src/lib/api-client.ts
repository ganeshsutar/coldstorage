import { env } from "@/config/env";

function getCsrfToken(): string | null {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : null;
}

export class ApiClientError extends Error {
  status: number;
  fieldErrors?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    fieldErrors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    // DRF returns field errors as { "field": ["error message"] }
    const fieldErrors: Record<string, string[]> = {};
    let message = "An error occurred";

    if (typeof data === "object" && data !== null) {
      for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value)) {
          fieldErrors[key] = value.map(String);
        } else if (key === "detail" || key === "message") {
          message = String(value);
        }
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      // Use first field error as message if no explicit message
      const firstField = Object.keys(fieldErrors)[0];
      message = fieldErrors[firstField][0];
    }

    throw new ApiClientError(message, response.status, fieldErrors);
  }

  return response.json();
}

export const apiClient = {
  baseUrl: env.API_URL,

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const csrfToken = getCsrfToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (csrfToken) {
      headers["X-CSRFToken"] = csrfToken;
    }
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return handleResponse<T>(response);
  },

  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    const csrfToken = getCsrfToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (csrfToken) {
      headers["X-CSRFToken"] = csrfToken;
    }
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PATCH",
      headers,
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },

  async delete<T = void>(endpoint: string): Promise<T> {
    const csrfToken = getCsrfToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (csrfToken) {
      headers["X-CSRFToken"] = csrfToken;
    }
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      headers,
      credentials: "include",
    });
    if (response.status === 204) {
      return undefined as T;
    }
    return handleResponse<T>(response);
  },
};
