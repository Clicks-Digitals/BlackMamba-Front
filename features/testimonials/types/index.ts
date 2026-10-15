/** Matches TestimonialSerializer from /api/testimonials/ */
export interface Testimonial {
  id: string;
  user_name: string;
  title: string;
  content: string;
  rating: number;
  created_at: string;
}
