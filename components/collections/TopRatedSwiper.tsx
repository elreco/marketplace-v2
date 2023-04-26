import { Text, Flex } from 'components/primitives'
import { FC } from 'react'
import { Autoplay } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/autoplay'
import { TopRatedCollection } from 'types'
import { styled } from '@stitches/react'
import RatingStars from 'components/RatingStars'
import { OpenSeaVerified } from 'components/common/OpenSeaVerified'
import Link from 'next/link'
import Img from 'components/primitives/Img'
import { formatNumber } from 'utils/numbers'

type Props = {
  topRatedCollections: TopRatedCollection[]
}

const SlideInner = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: 200,
  marginTop: 76,
  borderBottom: '1px solid $gray4',
  position: 'relative',
  '@media (min-width: 900px)': { 
    height: 350, marginTop: 80
  },
})

const BackgroundWrapper = styled('div', {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adjust the opacity here (0.5 in this case)
    zIndex: 1,
  },
})
const ContentWrapper = styled(Flex, {
  position: 'relative',
  zIndex: 2,
})
export const TopRatedSwiper: FC<Props> = ({ topRatedCollections }) => {
  return (
    <Swiper
      modules={[Autoplay]}
      loop
      speed={1500}
      parallax
      autoplay={{ delay: 6500, disableOnInteraction: false }}
      watchSlidesProgress
      pagination={{ clickable: true }}
      navigation
    >
      {topRatedCollections.map((slide, index) => (
        <SwiperSlide key={index}>
          <SlideInner>
            <BackgroundWrapper
              style={{
                backgroundImage: `url(${slide.collection?.banner})`,
              }}
            />
            <ContentWrapper direction="column" align="center">
              <Link
                href={`/collection/${slide.chain_slug}/${slide.collection?.id}`}
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
                    src={slide.collection?.image as string}
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
                    style="h3"
                    ellipsify
                  >
                    {slide.collection?.name}
                  </Text>
                  <OpenSeaVerified
                    openseaVerificationStatus={
                      slide.collection?.openseaVerificationStatus
                    }
                  />
                </Flex>
              </Link>
              <RatingStars
                starSize="lg"
                readOnly
                rating={slide.average_rating}
              ></RatingStars>
              <Text css={{ mt: '$2' }} style="subtitle1">
                {formatNumber(slide.total_reviews)}{' '}
                {slide.total_reviews > 1 ? 'ratings' : 'rating'}
              </Text>
            </ContentWrapper>
          </SlideInner>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
