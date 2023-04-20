import React, { ComponentPropsWithoutRef, useEffect, useMemo, useState } from 'react'
import { ExtendedCollectionItem } from 'types'
import { CollectionRankingsTable } from 'components/rankings/CollectionRankingsTable'
import { updateCollectionsWithReviews } from 'utils/reviews'

interface CollectionRankingsTableWrapperProps {
  data: ExtendedCollectionItem[]
  isValidating: boolean
  volumeKey: ComponentPropsWithoutRef<
    typeof CollectionRankingsTable
  >['volumeKey']
}

export const CollectionRankingsTableWrapper: React.FC<
  CollectionRankingsTableWrapperProps
> = ({ data, isValidating, volumeKey }) => {
  const [collections, setCollections] = useState<ExtendedCollectionItem[]>([])
  const [isLoading, setLoading] = useState(true)
  
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLoading(true);
  
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  
    const updateCollections = async () => {
      const updatedCollectionsResults = await updateCollectionsWithReviews(data);
      setLoading(false);
      if (updatedCollectionsResults) {
        setCollections(updatedCollectionsResults);
      }
    };
  
    const newTimeoutId = setTimeout(() => {
      updateCollections();
    }, 700);
  
    setTimeoutId(newTimeoutId);
  
    return () => {
      clearTimeout(newTimeoutId);
    };
  }, [data]);
  

  return (
    <CollectionRankingsTable
      collections={collections}
      loading={isLoading || isValidating}
      volumeKey={volumeKey}
    />
  )
}

export default CollectionRankingsTableWrapper
