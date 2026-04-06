export interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  is_configured: boolean;
}

export interface OrganizationMembership {
  id: string;
  organization: Organization;
  role: string;
  is_default: boolean;
  status: string;
  joined_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
}

export interface UserWithOrganizations extends User {
  organizations: OrganizationMembership[];
}
