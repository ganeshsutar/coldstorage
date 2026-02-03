import { apiClient } from "@/lib/api-client"
import type {
  CreateUserRequest,
  OrganizationUser,
  UpdateUserRequest,
  UserPermissions,
} from "../types"

export const usersService = {
  async getUsers(): Promise<OrganizationUser[]> {
    return apiClient.get<OrganizationUser[]>("/api/system/users/")
  },

  async getUser(id: string): Promise<OrganizationUser> {
    return apiClient.get<OrganizationUser>(`/api/system/users/${id}/`)
  },

  async createUser(data: CreateUserRequest): Promise<OrganizationUser> {
    return apiClient.post<OrganizationUser>("/api/system/users/", data)
  },

  async updateUser(
    id: string,
    data: UpdateUserRequest
  ): Promise<OrganizationUser> {
    return apiClient.patch<OrganizationUser>(`/api/system/users/${id}/`, data)
  },

  async deleteUser(id: string): Promise<void> {
    return apiClient.delete(`/api/system/users/${id}/`)
  },

  async getUserPermissions(
    id: string
  ): Promise<{ permissions: UserPermissions }> {
    return apiClient.get<{ permissions: UserPermissions }>(
      `/api/system/users/${id}/permissions/`
    )
  },

  async updateUserPermissions(
    id: string,
    permissions: UserPermissions
  ): Promise<{ permissions: UserPermissions }> {
    return apiClient.patch<{ permissions: UserPermissions }>(
      `/api/system/users/${id}/permissions/`,
      { permissions }
    )
  },
}
