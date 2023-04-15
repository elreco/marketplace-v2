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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<number>>
) {
  const { query } = req
  const { collection_id } = query

  if (collection_id && typeof collection_id === 'string') {
    const data = await getReviewsByCollection(collection_id)
    res.status(200).json({ data })
    return
  }

  res.status(200).json({ data: 0 })
}
