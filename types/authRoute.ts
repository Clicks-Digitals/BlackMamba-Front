export type Role = "guest" | "user";

export type RouteConfig = {
  path: string;
  roles: Role[];
};
