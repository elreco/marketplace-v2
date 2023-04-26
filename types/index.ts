import { paths } from '@reservoir0x/reservoir-sdk'

export interface Review {
  id?: string
  collection_id: string
  user_id: string
  rating: number
  comment: string
  created_at?: string
  updated_at?: string
  collection?: ExtendedCollectionItem
}

export interface ReviewInsights {
  count: number
  average_rating: number
  collection_id: string
}

export interface TopRatedCollection {
  collection: ExtendedCollectionItem
  average_rating: number
  collection_id: string
  total_reviews: number
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

type CollectionSchema =
  paths['/collections/v5']['get']['responses']['200']['schema']

export type ExtendedCollectionItem = NonNullable<
  CollectionSchema['collections']
>[number] & { reviewsAverageRating?: number; reviewsCount?: number }

export type ExtendedSchema = Omit<CollectionSchema, 'collections'> & {
  collections?: ExtendedCollectionItem[]
}

export type ChainCollections = Record<string, ExtendedSchema>
