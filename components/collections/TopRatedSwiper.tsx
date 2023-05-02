import { Text, Flex, Box } from 'components/primitives'
import { FC, useEffect, useState } from 'react'
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
import { useMediaQuery } from 'react-responsive'
import { useMounted } from 'hooks'
import { useTheme } from 'next-themes'

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
    height: 350,
    marginTop: 80,
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
  variants: {
    backgroundColor: {
      dark: {
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
      light: {
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
        },
      },
    },
  },
})

const ContentWrapper = styled(Flex, {
  position: 'relative',
  zIndex: 2,
})

export const TopRatedSwiper: FC<Props> = ({ topRatedCollections }) => {
  const isMounted = useMounted()
  const isSmallDevice = useMediaQuery({ maxWidth: 905 }) && isMounted
  const { theme } = useTheme()
  const setBackgroundImage = (image: string | undefined) => {
    if (image) {
      return image
    }
    if (theme === 'dark') {
      return '/pattern-black.png'
    }
    return '/pattern-white.png'
  }

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
      {isMounted && topRatedCollections.map((slide, index) => (
        <SwiperSlide key={index}>
          <SlideInner>
            <BackgroundWrapper
              style={{
                backgroundImage: `url(${setBackgroundImage(slide.collection?.banner)})`
              }}
              backgroundColor={theme === 'dark' ? 'dark' : 'light'}
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
                      width: isSmallDevice ? 36 : 56,
                      height: isSmallDevice ? 36 : 56,
                      objectFit: 'cover',
                    }}
                    alt="Collection Image"
                    width={isSmallDevice ? 36 : 56}
                    height={isSmallDevice ? 36 : 56}
                    unoptimized
                  />

                  <Text
                    css={{
                      display: 'inline-block',
                      minWidth: 0,
                    }}
                    style={isSmallDevice ? 'h6' : 'h3'}
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
              <Flex css={{ mt: '$2' }} align="center" direction="column">
                <RatingStars
                  starSize="lg"
                  readOnly
                  rating={slide.average_rating}
                ></RatingStars>
                <Text css={{ mt: '$2' }} style="subtitle1">
                  {formatNumber(slide.total_reviews)}{' '}
                  {slide.total_reviews > 1 ? 'ratings' : 'rating'}
                </Text>
              </Flex>
            </ContentWrapper>
          </SlideInner>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
