import React, { ComponentPropsWithoutRef, useEffect, useState } from 'react';
import { ExtendedCollectionItem } from 'types';
import { CollectionRankingsTable } from 'components/rankings/CollectionRankingsTable';
import { updateCollectionWithReviews } from 'utils/reviews';

interface CollectionRankingsTableWrapperProps {
  data: ExtendedCollectionItem[];
  isValidating: boolean;
  volumeKey: ComponentPropsWithoutRef<typeof CollectionRankingsTable>['volumeKey'];
}

export const CollectionRankingsTableWrapper: React.FC<CollectionRankingsTableWrapperProps> = ({ data, isValidating, volumeKey }) => {
  const [collections, setCollections] = useState<ExtendedCollectionItem[]>([]);

  useEffect(() => {
    const updateCollections = async () => {
      const updatedCollectionsPromises = data.map(updateCollectionWithReviews);
      const updatedCollectionsResults = await Promise.all(updatedCollectionsPromises);
      setCollections(updatedCollectionsResults);
    };

    updateCollections();
  }, [data]);

  return <CollectionRankingsTable collections={collections} loading={isValidating} volumeKey={volumeKey} />;
};

export default CollectionRankingsTableWrapper
