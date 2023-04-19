import React, { ComponentPropsWithoutRef, useEffect, useState } from 'react';
import { ApiResponse, ExtendedCollectionItem } from 'types';
import { CollectionRankingsTable } from 'components/rankings/CollectionRankingsTable';

async function updateCollectionWithRatings(collection: ExtendedCollectionItem) {
    const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL
    const [reviewsAverageRatingData, reviewsCountData]: [ApiResponse<number>, ApiResponse<number>] = await Promise.all([
      fetch(`${HOST_URL}/api/reviews/average?collection_id=${collection.id}`).then((res) => res.json()),
      fetch(`${HOST_URL}/api/reviews/count?collection_id=${collection.id}`).then((res) => res.json())
    ]);
  
    collection.reviewsAverageRating = reviewsAverageRatingData.data;
    collection.reviewsCount = reviewsCountData.data;
    return collection
  }

interface CollectionRankingsTableWrapperProps {
  data: ExtendedCollectionItem[];
  isValidating: boolean;
  volumeKey: ComponentPropsWithoutRef<typeof CollectionRankingsTable>['volumeKey'];
}

export const CollectionRankingsTableWrapper: React.FC<CollectionRankingsTableWrapperProps> = ({ data, isValidating, volumeKey }) => {
  const [collections, setCollections] = useState<ExtendedCollectionItem[]>([]);

  useEffect(() => {
    const updateCollections = async () => {
      const updatedCollectionsPromises = data.map(updateCollectionWithRatings);
      const updatedCollectionsResults = await Promise.all(updatedCollectionsPromises);
      setCollections(updatedCollectionsResults);
    };

    updateCollections();
  }, [data]);

  return <CollectionRankingsTable collections={collections} loading={isValidating} volumeKey={volumeKey} />;
};

export default CollectionRankingsTableWrapper
