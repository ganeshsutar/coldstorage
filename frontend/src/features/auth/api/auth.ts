import { apiClient } from "@/lib/api-client";
import type { SignupRequest, LoginRequest, UserWithOrganizations } from "../types/auth";

export const authService = {
  async ensureCsrfToken(): Promise<void> {
    await apiClient.get<{ csrfToken: string }>("/api/auth/csrf/");
  },

  async signup(data: SignupRequest): Promise<UserWithOrganizations> {
    await this.ensureCsrfToken();
    return apiClient.post<UserWithOrganizations>("/api/auth/signup/", data);
  },

  async login(data: LoginRequest): Promise<UserWithOrganizations> {
    await this.ensureCsrfToken();
    return apiClient.post<UserWithOrganizations>("/api/auth/login/", data);
  },

  async logout(): Promise<void> {
    return apiClient.post<void>("/api/auth/logout/", {});
  },
};
