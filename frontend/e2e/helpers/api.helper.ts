import type { APIRequestContext } from "@playwright/test";

const API_URL = "http://localhost:8000";

export async function getCsrfToken(
  request: APIRequestContext
): Promise<string> {
  const response = await request.get(`${API_URL}/api/auth/csrf/`);
  const cookies = (await response.headerValues("set-cookie")).join("; ");
  const match = cookies.match(/csrftoken=([^;]+)/);
  if (!match) {
    throw new Error("CSRF token not found in response cookies");
  }
  return match[1];
}

export async function apiLogin(
  request: APIRequestContext,
  email: string,
  password: string
) {
  const csrfToken = await getCsrfToken(request);
  const response = await request.post(`${API_URL}/api/auth/login/`, {
    data: { email, password },
    headers: {
      "X-CSRFToken": csrfToken,
      "Content-Type": "application/json",
    },
  });
  return response;
}
