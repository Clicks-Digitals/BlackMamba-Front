import type { RouteConfig } from "@/types";

// A staff account signs in as "admin", which locked it out of its own
// profile and orders — so "Add your address from profile" at checkout led
// nowhere and a staff member could not buy anything.
export const routes: RouteConfig[] = [
  { path: "/orders", roles: ["user", "admin"] },
  { path: "/profile", roles: ["user", "admin"] }
];
