export const TEST_USERS = {
  default: {
    email: "test@example.com",
    password: "testpass123",
    fullName: "Test User",
  },
} as const;

export const AUTH_ROUTES = {
  login: "/auth/login",
  register: "/auth/register",
  dashboard: "/app/dashboard",
} as const;
