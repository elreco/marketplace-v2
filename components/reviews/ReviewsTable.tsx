import { FC, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import {
  Text,
  Flex,
  TableCell,
  TableRow,
  HeaderRow,
  Anchor,
  Button,
  Box,
  Input,
} from '../primitives'
import Link from 'next/link'
import { useENSResolver, useMarketplaceChain, useTimeSince } from 'hooks'
import { Review } from 'types'
import { NAVBAR_HEIGHT } from 'components/navbar'
import RatingStars from 'components/RatingStars'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { RegularModal } from 'components/common/RegularModal'
import { useAccount } from 'wagmi'
import { OpenSeaVerified } from 'components/common/OpenSeaVerified'
import Img from 'components/primitives/Img'

type Props = {
  reviews: Review[]
  isFromUserProfile?: boolean
  onReviewUpdate: (
    review: Pick<Review, 'id' | 'rating' | 'comment' | 'collection_id'>
  ) => void
  onReviewDelete: (rating: Pick<Review, 'id'>) => void
}
const mobileTemplateColumns = '1fr 2fr 1fr'
const desktopTemplateColumns = '.8fr 1.2fr repeat(2, 0.8fr)'

export const ReviewsTable: FC<Props> = ({
  reviews,
  isFromUserProfile = false,
  onReviewUpdate,
  onReviewDelete,
}) => {
  return (
    <Flex direction="column" css={{ width: '100%', pb: '$2', my: '$3' }}>
      <TableHeading isFromUserProfile={isFromUserProfile} />
      {reviews.map((review, i) => {
        return (
          <ReviewTableRow
            key={`${review?.id}-${i}`}
            review={review}
            onReviewUpdate={onReviewUpdate}
            onReviewDelete={onReviewDelete}
            isFromUserProfile={isFromUserProfile}
          />
        )
      })}
    </Flex>
  )
}

type ReviewTableRowProps = {
  review: Review
  onReviewUpdate: (
    review: Pick<Review, 'id' | 'rating' | 'comment' | 'collection_id'>
  ) => void
  onReviewDelete: (rating: Pick<Review, 'id'>) => void
  isFromUserProfile: boolean
}

const ReviewTableRow: FC<ReviewTableRowProps> = ({
  review,
  onReviewUpdate,
  onReviewDelete,
  isFromUserProfile,
}) => {
  const isSmallDevice = useMediaQuery({ maxWidth: 900 })
  const { address } = useAccount()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isOpen, setOpen] = useState(false)
  const { routePrefix } = useMarketplaceChain()

  const handleRatingChange = (newRating: number) => {
    setRating(newRating)
  }

  const handleSave = (e: React.FormEvent, review: Review) => {
    e.preventDefault()

    if (onReviewUpdate) {
      onReviewUpdate({
        id: review.id,
        rating,
        comment,
        collection_id: review.collection_id,
      })
    }

    setOpen(false)
    setTimeout(() => {
      setRating(0)
      setComment('')
    }, 200)
  }

  const handleDelete = (id: string | undefined) => {
    if (onReviewDelete) {
      onReviewDelete({ id })
    }

    setOpen(false)
    setTimeout(() => {
      setRating(0)
      setComment('')
    }, 200)
  }

  const selectReview = (review: Review) => {
    setRating(review.rating)
    setComment(review.comment)
    setOpen(true)
  }
  return (
    <>
      <TableRow
        key={review?.id}
        css={{
          gridTemplateColumns: isSmallDevice
            ? mobileTemplateColumns
            : desktopTemplateColumns,
        }}
      >
        <TableCell css={{ minWidth: 0 }}>
          <Flex align="center">
            {!isFromUserProfile ? (
              <>
                <Jazzicon
                  diameter={16}
                  seed={jsNumberForAddress(review.user_id)}
                />
                <Link href={`/profile/${review.user_id}`} legacyBehavior={true}>
                  <Anchor color="primary" weight="normal" css={{ ml: '$1' }}>
                    {useENSResolver(review.user_id).displayName}
                  </Anchor>
                </Link>
              </>
            ) : (
              <Link
                href={`/collection/${routePrefix}/${review.collection?.id}`}
                style={{ display: 'inline-block', width: '100%', minWidth: 0 }}
              >
                <Flex
                  align="center"
                  css={{
                    gap: '$2',
                    cursor: 'pointer',
                    minWidth: 0,
                    overflow: 'hidden',
                    width: '100$',
                  }}
                >
                  <Img
                    src={review.collection?.image as string}
                    css={{
                      borderRadius: 8,
                      width: 56,
                      height: 56,
                      objectFit: 'cover',
                    }}
                    alt="Collection Image"
                    width={56}
                    height={56}
                    unoptimized
                  />

                  <Text
                    css={{
                      display: 'none',
                      minWidth: 0,
                      '@md': { display: 'inline-block' },
                    }}
                    style="subtitle1"
                    ellipsify
                  >
                    {review.collection?.name}
                  </Text>
                  <OpenSeaVerified
                    openseaVerificationStatus={
                      review.collection?.openseaVerificationStatus
                    }
                  />
                </Flex>
              </Link>
            )}
          </Flex>
        </TableCell>
        <TableCell>
          <Flex align="center" css={{ gap: '$2' }}>
            <Text style="subtitle2">{review.comment}</Text>
            {address === review.user_id && (
              <Anchor
                color="primary"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => selectReview(review)}
              >
                <FontAwesomeIcon icon={faEdit} width={12} height={15} />
              </Anchor>
            )}
          </Flex>
        </TableCell>
        <TableCell>
          <RatingStars rating={review.rating} readOnly />
        </TableCell>
        <TableCell css={{ display: 'none', '@md': { display: 'grid' } }}>
          <Text style="subtitle2">{useTimeSince(review.created_at)}</Text>
        </TableCell>
      </TableRow>
      <RegularModal
        title="Update your review"
        isOpen={isOpen}
        trigger={undefined}
      >
        <Text>
          Modify your rating for the collection by selecting a score from 1 to
          5, with 1 being the lowest and 5 being the highest.
        </Text>
        <form onSubmit={(e) => handleSave(e, review)}>
          <Flex
            justify="center"
            align="center"
            direction="column"
            css={{
              gap: '$4',
              width: '100%',
              marginTop: '25px',
              marginBottom: '20px',
            }}
          >
            <Box style={{ marginBottom: '20px' }}>
              <RatingStars
                starSize="lg"
                rating={rating}
                onRatingChange={handleRatingChange}
              />
            </Box>
            <Box style={{ width: '100%' }}>
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                type="text"
                placeholder="Type your review (Optional)"
              />
            </Box>
          </Flex>
          <Flex justify="end" css={{ marginTop: '20px', gap: '$3' }}>
            <Button color="secondary" onClick={() => handleDelete(review.id)}>
              Delete review
            </Button>
            <Button type="submit">Save</Button>
          </Flex>
        </form>
      </RegularModal>
    </>
  )
}

const TableHeading = ({
  isFromUserProfile,
}: {
  isFromUserProfile: boolean
}) => (
  <HeaderRow
    css={{
      gridTemplateColumns: mobileTemplateColumns,
      '@md': {
        display: 'grid',
        gridTemplateColumns: desktopTemplateColumns,
        position: 'sticky',
        top: NAVBAR_HEIGHT,
        backgroundColor: '$neutralBg',
      },
    }}
  >
    {!isFromUserProfile ? (
      <TableCell>
        <Text style="subtitle3" color="subtle">
          User
        </Text>
      </TableCell>
    ) : (
      <TableCell>
        <Text style="subtitle3" color="subtle">
          Collection
        </Text>
      </TableCell>
    )}
    <TableCell>
      <Text style="subtitle3" color="subtle">
        Review
      </Text>
    </TableCell>
    <TableCell>
      <Text style="subtitle3" color="subtle">
        Rating
      </Text>
    </TableCell>
    <TableCell css={{ display: 'none', '@md': { display: 'grid' } }}>
      <Text style="subtitle3" color="subtle">
        Posted
      </Text>
    </TableCell>
  </HeaderRow>
)
