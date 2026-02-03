// Common types used across the application

export interface Entity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type Status = "active" | "inactive" | "pending" | "archived";
