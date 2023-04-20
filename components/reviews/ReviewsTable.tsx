import { FC } from 'react'
import { useMediaQuery } from 'react-responsive'
import {
  Text,
  Flex,
  TableCell,
  TableRow,
  HeaderRow,
  Anchor,
} from '../primitives'
import Link from 'next/link'
import { useENSResolver, useTimeSince } from 'hooks'
import { Review } from 'types'
import { NAVBAR_HEIGHT } from 'components/navbar'
import RatingStars from 'components/RatingStars'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'

type Props = {
  reviews: Review[]
}
const mobileTemplateColumns = '1fr 2fr 1fr'
const desktopTemplateColumns = '.8fr 1.2fr repeat(2, 0.8fr)'

export const ReviewsTable: FC<Props> = ({ reviews }) => {
  return (
        <Flex direction="column" css={{ width: '100%', pb: '$2' }}>
          <TableHeading />
          {reviews.map((review, i) => {
            return (
              <ReviewTableRow
                key={`${review?.id}-${i}`}
                review={review}
              />
            )
          })}
        </Flex>)
    
}

type ReviewTableRowProps = {
  review: Review
}

const ReviewTableRow: FC<ReviewTableRowProps> = ({
    review,
}) => {
  const isSmallDevice = useMediaQuery({ maxWidth: 900 })

  return (
    <TableRow
      key={review?.id}
      css={{ gridTemplateColumns: isSmallDevice ? mobileTemplateColumns : desktopTemplateColumns }}
    >
      <TableCell css={{ minWidth: 0 }}>
      <Flex align="center">
      <Jazzicon
                    diameter={16}
                    seed={jsNumberForAddress(review.user_id)}
                  />
                  <Link href={`/profile/${review.user_id}`} legacyBehavior={true}>
                    <Anchor color="primary" weight="normal" css={{ ml: '$1' }}>
                      {useENSResolver(review.user_id).displayName}
                    </Anchor>
                  </Link>
                  </Flex>
      </TableCell>
      <TableCell>
      <Text style="subtitle2">{review.comment}</Text>
      </TableCell>
      <TableCell>
        <RatingStars rating={review.rating} readOnly />
      </TableCell>
      <TableCell  css={{ display: 'none', '@md': { display: 'grid' } }}>
        <Text style="subtitle2">{useTimeSince(review.created_at)}</Text>
      </TableCell>
    </TableRow>
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
      <Text
        style="subtitle3"
        color="subtle"
      >
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
    <TableCell   css={{ display: 'none', '@md': { display: 'grid' } }}>
      <Text style="subtitle3" color="subtle">
        Posted
      </Text>
    </TableCell>
  </HeaderRow>
)
