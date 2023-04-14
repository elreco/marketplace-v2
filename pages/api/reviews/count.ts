import { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponse, Review } from '../../../types'
import { supabaseClient } from '../../../utils/supabase'

async function getReviewsByCollection(collection_id: string): Promise<number> {
  try {
    const { data, error } = await supabaseClient
      .from('reviews')
      .select('collection_id', { count: 'exact' })
      .eq('collection_id', collection_id)

    if (error) {
      throw error
    }

    return data.length
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error)
    return 0
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<number>>) {
  const { query } = req
  const { collectionId } = query

  if (collectionId && typeof collectionId === 'string') {
    const data = await getReviewsByCollection(collectionId)
    res.status(200).json({ data })
    return
  }

  res.status(200).json({ data: 0 })
}
