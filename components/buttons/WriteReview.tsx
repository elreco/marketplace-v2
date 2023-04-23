import { Box, Button, Flex, Input, Text } from 'components/primitives'
import { ChangeEvent, ComponentProps, FC, useEffect, useState } from 'react'
import { useAccount, useNetwork, useSigner, useSwitchNetwork } from 'wagmi'
import { CSS } from '@stitches/react'
import { useMarketplaceChain } from 'hooks'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { RegularModal } from 'components/common/RegularModal'
import RatingStars from 'components/RatingStars'
import { Review } from 'types'

type Props = {
  buttonCss?: CSS
  buttonProps?: ComponentProps<typeof Button>
  onReviewSubmit?: (review: Pick<Review, 'rating' | 'comment'>) => void
  isLoading?: boolean
}

const WriteReview: FC<Props> = ({
  buttonCss,
  buttonProps = {},
  onReviewSubmit,
  isLoading,
}) => {
  const { isDisconnected } = useAccount()
  const { data: signer } = useSigner()
  const marketplaceChain = useMarketplaceChain()
  const [isOpen, setOpen] = useState(false)
  const { chain: activeChain } = useNetwork()
  const isInTheWrongNetwork = Boolean(
    signer && activeChain?.id !== marketplaceChain.id
  )
  const { switchNetworkAsync } = useSwitchNetwork({
    chainId: marketplaceChain.id,
  })

  const { openConnectModal } = useConnectModal()

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  const handleRatingChange = (newRating: number) => {
    setRating(newRating)
  }

  const handleCommentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const currentValue = event.target.value;
    const cleanedValue = currentValue.replace(/<[^>]*>|[^\w\s]/gi, '');
    setComment(cleanedValue)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (onReviewSubmit) {
      onReviewSubmit({ rating, comment })
    }

    setOpen(false)
    setTimeout(() => {
      setRating(0)
      setComment('')
    }, 200)
  }

  if (isDisconnected || isInTheWrongNetwork) {
    return (
      <Button
        css={buttonCss}
        disabled={isInTheWrongNetwork && !switchNetworkAsync}
        onClick={async () => {
          if (isInTheWrongNetwork && switchNetworkAsync) {
            const chain = await switchNetworkAsync(marketplaceChain.id)
            if (chain.id !== marketplaceChain.id) {
              return false
            }
          }

          if (!signer) {
            openConnectModal?.()
          }
        }}
        {...buttonProps}
      >
        Write a review
      </Button>
    )
  }

  const trigger = (
    <Button
      disabled={isLoading}
      css={buttonCss}
      onClick={() => setOpen(true)}
      {...buttonProps}
    >
      Write a review
    </Button>
  )

  return (
    <RegularModal title="Write a review" isOpen={isOpen} trigger={trigger}>
      <Text>
        Add a rating for the collection by selecting a score from 1 to 5, with 1
        being the lowest and 5 being the highest.
      </Text>
      <form onSubmit={handleSave}>
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
              onChange={handleCommentChange}
              type="text"
              placeholder="Type your review (Optional)"
            />
          </Box>
        </Flex>
        <Flex justify="end" css={{ marginTop: '20px' }}>
          <Button type="submit">Save</Button>
        </Flex>
      </form>
    </RegularModal>
  )
}

export default WriteReview
