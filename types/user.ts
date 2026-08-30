export type User = {
  role: "superadmin" | "user";
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  date_of_birth: string;
  avatar: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
};
