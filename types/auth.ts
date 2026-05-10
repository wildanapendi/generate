/**
 * Type-safe auth types untuk RBAC system.
 *
 * - `UserRole`: discriminated union yang match dengan DB enum `user_role`
 * - `SessionUser`: shape yang dikembalikan oleh `getSessionUser()` — single source of truth
 * - `RoutePermission`: declarative route access map untuk middleware & sidebar filtering
 */

/** Role enum sesuai `user_role` PostgreSQL enum di schema.sql */
export type UserRole = "admin" | "lecturer";

/**
 * Representasi user session yang sudah ter-autentikasi.
 * Dikonsumsi oleh middleware, server components, dan route handlers
 * melalui `getSessionUser()` — menghindari duplicate query.
 */
export interface SessionUser {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
}

/**
 * Declarative route permission map.
 * Digunakan untuk sidebar filtering dan future middleware RBAC expansion.
 */
export interface RoutePermission {
  /** Path prefix yang di-protect, contoh: "/templates" */
  path: string;
  /** Role minimum yang dibutuhkan. Undefined = semua authenticated user. */
  requiredRole?: UserRole;
}
