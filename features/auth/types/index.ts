import { User } from "@/types";

interface AuthResponse {
  message: string;
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

export type { AuthResponse };
