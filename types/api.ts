export interface PaginatedResponse<T> {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
  links?: {
    next: string | null;
    previous: string | null;
  };
  total_pages?: number;
  current_page?: number;
}
