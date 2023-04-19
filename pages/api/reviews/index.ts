import { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponse, Review } from '../../../types'
import { supabaseClient } from '../../../utils/supabase'

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

async function reviewExists(
  user_id: string,
  collection_id: string
): Promise<boolean> {
  try {
    const { data, error } = await supabaseClient
      .from('reviews')
      .select('id')
      .eq('user_id', user_id)
      .eq('collection_id', collection_id)

    if (error) {
      throw error
    }

    return data && data.length > 0
  } catch (error) {
    console.error('Error while checking if review exists:', error)
    return false
  }
}

async function addReview(review: Review): Promise<Review | null> {
  try {
    const exists = await reviewExists(review.user_id, review.collection_id)

    if (exists) {
      console.error('A review already exists for this user and collection.')
      return null
    }

    const { data, error } = await supabaseClient
      .from('reviews')
      .insert([review])
      .select('*')

    if (error) {
      throw error
    }

    if (data && data.length > 0) {
      return data[0] as Review
    } else {
      return null
    }
  } catch (error) {
    console.error('Error while adding review:', error)
    return null
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Review[] | Review>>
) {
  if (req.method === 'POST') {
    const review: Review = req.body

    const addedReview = await addReview(review)
    if (addedReview) {
      res.status(200).json({ data: addedReview })
    } else {
      res.status(409).json({ data: [], error: 'Review already exists' })
    }
    return
  }

  const { query } = req
  const { collection_id } = query

  if (collection_id && typeof collection_id === 'string') {
    const data = await getReviewsByCollection(collection_id)
    res.status(200).json({ data })
    return
  }

  res.status(200).json({ data: [] })
}
