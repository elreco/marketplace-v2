import { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponse, Review } from '../../../types'
import { supabaseClient } from '../../../utils/supabase'

async function getTopRatedCollections(
): Promise<Review[]> {
    const today = new Date();
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  try {
      const sql = `
      SELECT
        collection_id,
        AVG(rating) as avg_rating,
        COUNT(*) as total_reviews
      FROM
        reviews
      WHERE
        created_at >= '${lastWeek.toISOString()}'
      GROUP BY
        collection_id
      ORDER BY
        avg_rating DESC
    `;

    const { data, error } = await supabaseClient.raw(sql);

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
  res: NextApiResponse<ApiResponse<Review[] | Review>>
) {
  const data = await getTopRatedCollections()
  res.status(200).json({ data })
  return
}
