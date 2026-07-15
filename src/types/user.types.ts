export type Role = "admin" | "user"

export type UserStatus = "active" | "inactive" | "suspended"

export type Department =
  | "Infrastructure"
  | "Network Operations"
  | "Site Reliability"
  | "Security"
  | "IT Support"
  | "Cloud Platform"
  | "Database Administration"
  | "Customer Success"
  | "Procurement"
  | "Executive"

export interface User {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  role: Role
  department: Department
  jobTitle: string
  phone: string
  status: UserStatus
  avatarColor: string
  location: string
  createdAt: string
  lastLoginAt: string | null
}

export interface UserFormInput {
  firstName: string
  lastName: string
  email: string
  role: Role
  department: Department
  jobTitle: string
  phone: string
  status: UserStatus
  location: string
}
