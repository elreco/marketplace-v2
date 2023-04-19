import { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponse, Review, ReviewInsights } from '../../../types'
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
      .select('rating')
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
  res: NextApiResponse<ApiResponse<ReviewInsights[]>>
) {
  const { query } = req
  const { collection_ids } = query

  try {
    if (collection_ids && typeof collection_ids === 'string') {
      const collectionIdsArray = JSON.parse(collection_ids)

      if (
        Array.isArray(collectionIdsArray) &&
        collectionIdsArray.every((id) => typeof id === 'string')
      ) {
        const ids = collectionIdsArray.map(async (collection_id) => {
          const data = await getReviewsByCollection(collection_id)
          const count = data.length
          const averageRating = calculateAverageRating(data)
          const formattedRating = parseFloat(averageRating.toFixed(2))
          return { collection_id, count, average_rating: formattedRating }
        })
        const results = await Promise.all(ids)
        res.status(200).json({ data: results })
        return
      }
    }
  } catch (error) {
    console.error('Error processing collection_ids:', error)
  }

  res.status(200).json({ data: [] })
}
