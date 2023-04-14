export interface Review {
  id: string
  collection_id: string
  user_id: string
  rating: number
  comment: string
}

export type ApiResponse<T> = {
  error?: string
  data: T
}

export interface Review {
  id: string
  collection_id: string
  user_id: string
  rating: number
  comment: string
}

export interface SupabaseDatabase {
  public: {
    Tables: {
      reviews: {
        Row: Review
        Insert: Review
        Update: Review
      }
    }
  }
}
