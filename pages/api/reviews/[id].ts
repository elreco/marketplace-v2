import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import { ApiResponse, Review } from '../../../types'
import { supabaseClient } from '../../../utils/supabase'

const secret = process.env.NEXTAUTH_SECRET

async function getReviewById(
  review_id: string
): Promise<Review | null> {
  try {
    const { data, error } = await supabaseClient
      .from('reviews')
      .select('*')
      .eq('id', review_id)

    if (error) {
      throw error
    }

    return data[0] as Review || null
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error)
    return null
  }
}

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
  const token = await getToken({ req, secret })
  if (method === 'PUT') {
    if (review_id && typeof review_id === 'string') {
      const updatedReviewData: Partial<Review> = req.body
      if (token?.sub !== updatedReviewData.user_id) {
        res.status(403).json({ data: [], error: 'Not authorized' })
        return
      }
      const updatedReview = await updateReview(review_id, updatedReviewData)
      res.status(updatedReview ? 200 : 400).json({ data: updatedReview })
      return
    }
  } else if (method === 'DELETE') {
    if (review_id && typeof review_id === 'string') {
      const review = await getReviewById(review_id)
      if (!review || token?.sub !== review.user_id) {
        res.status(403).json({ data: [], error: 'Not authorized' })
        return
      }
      const success = await deleteReview(review_id)
      res.status(success ? 200 : 400).json({ data: success })
      return
    }
  }

  res.status(200).json({ data: [] })
}
