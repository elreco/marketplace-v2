import { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponse, Review } from '../../../types'
import { supabaseClient } from '../../../utils/supabase'

async function updateReview(
  reviewId: string,
  updatedReview: Partial<Review>
): Promise<Review | null> {
  const { data, error } = await supabaseClient
    .from('reviews')
    .update(updatedReview)
    .eq('id', reviewId)
    .select()
  if (error) {
    throw error
  }

  return data[0] as Review
}

async function deleteReview(reviewId: string): Promise<boolean> {
  try {
    const { error } = await supabaseClient
      .from('reviews')
      .delete()
      .eq('id', reviewId)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error('Error deleting the review:', error)
    return false
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Review[] | Review | null | boolean>>
) {
  const { query, method } = req
  const { id: review_id } = query

  if (method === 'PUT') {
    if (review_id && typeof review_id === 'string') {
      const updatedReviewData: Partial<Review> = req.body

      const updatedReview = await updateReview(review_id, updatedReviewData)
      res.status(updatedReview ? 200 : 400).json({ data: updatedReview })
      return
    }
  } else if (method === 'DELETE') {
    if (review_id && typeof review_id === 'string') {
      const success = await deleteReview(review_id)
      res.status(success ? 200 : 400).json({ data: success })
      return
    }
  }

  res.status(200).json({ data: [] })
}
