export const TEST_USERS = {
  default: {
    email: "testuser@example.com",
    password: "Test@123",
    fullName: "Ganesh Sutar",
  },
} as const;

export const AUTH_ROUTES = {
  login: "/auth/login",
  register: "/auth/register",
  dashboard: "/app/dashboard",
} as const;
