import { ApiResponse, ExtendedCollectionItem } from "types";

export async function updateCollectionWithReviews(collection: ExtendedCollectionItem) {
    const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL
    const [reviewsAverageRatingData, reviewsCountData]: [ApiResponse<number>, ApiResponse<number>] = await Promise.all([
      fetch(`${HOST_URL}/api/reviews/average?collection_id=${collection.id}`).then((res) => res.json()),
      fetch(`${HOST_URL}/api/reviews/count?collection_id=${collection.id}`).then((res) => res.json())
    ]);
  
    collection.reviewsAverageRating = reviewsAverageRatingData.data;
    collection.reviewsCount = reviewsCountData.data;
    return collection
  }