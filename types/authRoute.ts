// "admin" is what the API reports for a staff or superuser account.
export type Role = "guest" | "user" | "admin";

export type RouteConfig = {
  path: string;
  roles: Role[];
};
