import React, { ComponentPropsWithoutRef, useEffect, useState } from 'react'
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

  useEffect(() => {
    const updateCollections = async () => {
      const updatedCollectionsResults = await updateCollectionsWithReviews(data)
      if (updatedCollectionsResults) {
        setCollections(updatedCollectionsResults)
      }
    }

    updateCollections()
  }, [data])

  return (
    <CollectionRankingsTable
      collections={collections}
      loading={isValidating}
      volumeKey={volumeKey}
    />
  )
}

export default CollectionRankingsTableWrapper
