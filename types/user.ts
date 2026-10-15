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
  /** A3: true only once the owner follows the link we email on sign-up. */
  is_email_verified: boolean;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
};
