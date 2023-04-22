import { ApiResponse, ExtendedCollectionItem, ReviewInsights } from 'types'

export async function updateCollectionsWithReviews(
  collections: ExtendedCollectionItem[] | undefined
): Promise<ExtendedCollectionItem[]> {
  if (!collections) {
    return []
  }

  try {
    const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL
    const ids = collections.map((collection) => collection.id)

    const response = await fetch(`${HOST_URL}/api/reviews/insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ids),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch review insights for collections')
    }

    const { data }: ApiResponse<ReviewInsights[]> = await response.json()
    const insightsMap: Record<string, ReviewInsights> = data.reduce(
      (acc: Record<string, ReviewInsights>, insight) => {
        acc[insight.collection_id] = insight
        return acc
      },
      {}
    )

    return collections.map((collection) => {
      const insight = insightsMap[String(collection.id)]
      return {
        ...collection,
        reviewsAverageRating: insight?.average_rating ?? 0,
        reviewsCount: insight?.count ?? 0,
      }
    })
  } catch (error) {
    console.error(error)
    return collections
  }
}
