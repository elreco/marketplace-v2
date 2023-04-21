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
import { useENSResolver, useTimeSince } from 'hooks'
import { Review } from 'types'
import { NAVBAR_HEIGHT } from 'components/navbar'
import RatingStars from 'components/RatingStars'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { RegularModal } from 'components/common/RegularModal'

type Props = {
  reviews: Review[]
  onReviewUpdate?: (review: Pick<Review, 'id' | 'rating' | 'comment'>) => void
  onReviewDelete?: (rating: Pick<Review, 'id'>) => void
}
const mobileTemplateColumns = '1fr 2fr 1fr'
const desktopTemplateColumns = '.8fr 1.2fr repeat(2, 0.8fr)'

export const ReviewsTable: FC<Props> = ({
  reviews,
  onReviewUpdate,
  onReviewDelete,
}) => {
  return (
    <Flex direction="column" css={{ width: '100%', pb: '$2' }}>
      <TableHeading />
      {reviews.map((review, i) => {
        return (
          <ReviewTableRow
            key={`${review?.id}-${i}`}
            review={review}
            onReviewUpdate={onReviewUpdate}
            onReviewDelete={onReviewDelete}
          />
        )
      })}
    </Flex>
  )
}

type ReviewTableRowProps = {
  review: Review
  onReviewUpdate?: (review: Pick<Review, 'id' | 'rating' | 'comment'>) => void
  onReviewDelete?: (rating: Pick<Review, 'id'>) => void
}

const ReviewTableRow: FC<ReviewTableRowProps> = ({
  review,
  onReviewUpdate,
  onReviewDelete,
}) => {
  const isSmallDevice = useMediaQuery({ maxWidth: 900 })

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isOpen, setOpen] = useState(false)

  const handleRatingChange = (newRating: number) => {
    setRating(newRating)
  }

  const handleSave = (e: React.FormEvent, id: string | undefined) => {
    e.preventDefault()

    if (onReviewUpdate) {
      onReviewUpdate({ id, rating, comment })
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
            <Jazzicon diameter={16} seed={jsNumberForAddress(review.user_id)} />
            <Link href={`/profile/${review.user_id}`} legacyBehavior={true}>
              <Anchor color="primary" weight="normal" css={{ ml: '$1' }}>
                {useENSResolver(review.user_id).displayName}
              </Anchor>
            </Link>
          </Flex>
        </TableCell>
        <TableCell>
          <Flex align="center" css={{ gap: '$2' }}>
            <Text style="subtitle2">{review.comment}</Text>
            <Anchor
              color="primary"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => selectReview(review)}
            >
              <FontAwesomeIcon icon={faEdit} width={12} height={15} />
            </Anchor>
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
        <form onSubmit={(e) => handleSave(e, review.id)}>
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

const TableHeading = () => (
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
    <TableCell>
      <Text style="subtitle3" color="subtle">
        User
      </Text>
    </TableCell>
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
