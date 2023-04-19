import { useCollections } from '@reservoir0x/reservoir-kit-ui'
import {
  Text,
  Box,
  FormatCryptoCurrency,
  Grid,
  Flex,
} from 'components/primitives'
import RatingStars from 'components/RatingStars'
import { useMounted } from 'hooks'
import { FC, ReactNode } from 'react'
import { useMediaQuery } from 'react-responsive'
import { formatNumber } from 'utils/numbers'

type Props = {
  label: string
  children: ReactNode
}

const StatBox: FC<Props> = ({ label, children }) => (
  <Box
    css={{
      p: '$4',
      minWidth: 120,
      background: '$panelBg',
    }}
  >
    <Text style="subtitle3" css={{ color: '$gray12' }} as="p">
      {label}
    </Text>
    {children}
  </Box>
)

const ReviewBox: FC<{ reviewsAverageRating: number }> = ({
  reviewsAverageRating,
}) => {
  if (reviewsAverageRating) {
    return (
      <Flex align="center" css={{ gap: '$1' }}>
        <RatingStars rating={reviewsAverageRating} readOnly></RatingStars>
      </Flex>
    )
  }
  return <Text style="h6">-</Text>
}

type StatHeaderProps = {
  collection: NonNullable<ReturnType<typeof useCollections>['data']>['0']
  reviewsAverageRating: number
  reviewsCount: number
}

const StatHeader: FC<StatHeaderProps> = ({
  collection,
  reviewsAverageRating,
  reviewsCount,
}) => {
  const isMounted = useMounted()
  const isSmallDevice = useMediaQuery({ maxWidth: 600 }) && isMounted
  const listedPercentage =
    ((collection?.onSaleCount ? +collection.onSaleCount : 0) /
      (collection?.tokenCount ? +collection.tokenCount : 0)) *
    100

  const ratingLabel = () => {
    const formatedReviewsCount = formatNumber(reviewsCount)
    return formatedReviewsCount ? `Rating (${formatedReviewsCount})` : 'Rating'
  }

  return (
    <Grid
      css={{
        borderRadius: 8,
        overflow: 'hidden',
        gap: 1,
        gridTemplateColumns: '1fr 1fr',
        '@md': {
          gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
          marginRight: 'auto',
        },
      }}
    >
      <StatBox label="Floor">
        <FormatCryptoCurrency
          amount={collection?.floorAsk?.price?.amount?.decimal}
          address={collection?.floorAsk?.price?.currency?.contract}
          decimals={collection?.floorAsk?.price?.currency?.decimals}
          logoHeight={18}
          textStyle={'h6'}
          maximumFractionDigits={4}
        />
      </StatBox>

      <StatBox label="Top Offer">
        <FormatCryptoCurrency
          amount={collection?.topBid?.price?.amount?.decimal}
          address={collection?.topBid?.price?.currency?.contract}
          decimals={collection?.topBid?.price?.currency?.decimals}
          logoHeight={18}
          textStyle={'h6'}
          maximumFractionDigits={4}
        />
      </StatBox>

      <StatBox label="Listed">
        <Text style="h6">{formatNumber(listedPercentage)}%</Text>
      </StatBox>

      <StatBox label="Total Volume">
        <FormatCryptoCurrency
          amount={collection.volume?.allTime}
          logoHeight={18}
          textStyle={'h6'}
          maximumFractionDigits={4}
        />
      </StatBox>

      <StatBox label="Count">
        <Text style="h6">{formatNumber(collection?.tokenCount)}</Text>
      </StatBox>

      <StatBox label={ratingLabel()}>
        <ReviewBox reviewsAverageRating={reviewsAverageRating} />
      </StatBox>
    </Grid>
  )
}

export default StatHeader
