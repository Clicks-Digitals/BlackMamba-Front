import type { RouteConfig } from "@/types";

export const routes: RouteConfig[] = [
  { path: "/orders", roles: ["user"] },
  { path: "/profile", roles: ["user"] }
];
