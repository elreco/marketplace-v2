import { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponse, Review } from '../../../types'
import { supabaseClient } from '../../../utils/supabase'

function calculateAverageRating(reviews: Review[]) {
  if (reviews.length === 0) {
    return 0
  }

  const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
  const average = sum / reviews.length

  return average
}

async function getReviewsByCollection(
  collection_id: string
): Promise<Review[]> {
  try {
    const { data, error } = await supabaseClient
      .from('reviews')
      .select('*')
      .eq('collection_id', collection_id)

    if (error) {
      throw error
    }

    return data as Review[]
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error)
    return []
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Review[]>>
) {
  const { query } = req
  const { collection_id } = query

  if (collection_id && typeof collection_id === 'string') {
    const data = await getReviewsByCollection(collection_id)
    res.status(200).json({ data })
    return
  }

  res.status(200).json({ data: [] })
}
