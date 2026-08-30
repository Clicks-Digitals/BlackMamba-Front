export type TicketCategory = "ORDER_ISSUE" | "PAYMENT" | "SHIPPING" | "GENERAL";
export type TicketStatus =
  | "OPEN"
  | "PENDING"
  | "IN_PROGRESS"
  | "CLOSED"
  | "RESOLVED"; // Ensure these match the backend

export interface TicketReply {
  id: string;
  ticket?: string;
  sender?: string;
  sender_name?: string;
  is_staff_reply: boolean;
  body: string;
  attachment?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface SupportTicket {
  id: string;
  user?: string;
  subject: string;
  category: TicketCategory;
  body?: string;
  message?: string;
  status: TicketStatus;
  order?: string;
  guest_email?: string;
  attachment?: string;
  replies?: TicketReply[];
  messages?: TicketReply[];
  created_at: string;
  updated_at: string;
}
