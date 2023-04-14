export interface Review {
  id?: string
  collection_id: string
  user_id: `0x${string}`
  rating: number
  comment: string
}

export type ApiResponse<T> = {
  error?: string
  data: T
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
