import {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next'
import { Text, Flex, Box, Button } from '../../../components/primitives'
import {
  useCollections,
  useCollectionActivity,
  useDynamicTokens,
  useAttributes,
} from '@reservoir0x/reservoir-kit-ui'
import { paths } from '@reservoir0x/reservoir-sdk'
import Layout from 'components/Layout'
import { useEffect, useMemo, useRef, useState, useContext } from 'react'
import { truncateAddress } from 'utils/truncate'
import StatHeader from 'components/collections/StatHeader'
import CollectionActions from 'components/collections/CollectionActions'
import TokenCard from 'components/collections/TokenCard'
import { AttributeFilters } from 'components/collections/filters/AttributeFilters'
import { FilterButton } from 'components/common/FilterButton'
import SelectedAttributes from 'components/collections/filters/SelectedAttributes'
import { CollectionOffer } from 'components/buttons'
import { Grid } from 'components/primitives/Grid'
import { useIntersectionObserver } from 'usehooks-ts'
import fetcher from 'utils/fetcher'
import { useRouter } from 'next/router'
import { SortTokens } from 'components/collections/SortTokens'
import { useMediaQuery } from 'react-responsive'
import { TabsList, TabsTrigger, TabsContent } from 'components/primitives/Tab'
import * as Tabs from '@radix-ui/react-tabs'
import { NAVBAR_HEIGHT } from 'components/navbar'
import { CollectionActivityTable } from 'components/collections/CollectionActivityTable'
import { ActivityFilters } from 'components/common/ActivityFilters'
import { MobileAttributeFilters } from 'components/collections/filters/MobileAttributeFilters'
import { MobileActivityFilters } from 'components/common/MobileActivityFilters'
import LoadingCard from 'components/common/LoadingCard'
import { useMounted } from 'hooks'
import { NORMALIZE_ROYALTIES } from 'pages/_app'
import {
  faBroom,
  faCopy,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import supportedChains, { DefaultChain } from 'utils/chains'
import { Head } from 'components/Head'
import CopyText from 'components/common/CopyText'
import { OpenSeaVerified } from 'components/common/OpenSeaVerified'
import { Address, useAccount } from 'wagmi'
import titleCase from 'utils/titleCase'
import Link from 'next/link'
import Img from 'components/primitives/Img'
import { ApiResponse, Review, ReviewInsights } from 'types'
import WriteReview from 'components/buttons/WriteReview'
import { ToastContext } from 'context/ToastContextProvider'
import { ReviewsTable } from 'components/reviews/ReviewsTable'
import { SortReviews } from 'components/reviews/SortReviews'
import Sweep from 'components/buttons/Sweep'

type ActivityTypes = Exclude<
  NonNullable<
    NonNullable<
      Exclude<Parameters<typeof useCollectionActivity>['0'], boolean>
    >['types']
  >,
  string
>

type Props = InferGetStaticPropsType<typeof getStaticProps>

const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL

const CollectionPage: NextPage<Props> = ({ id, ssr }) => {
  const router = useRouter()
  const { address } = useAccount()
  const [attributeFiltersOpen, setAttributeFiltersOpen] = useState(false)
  const [activityFiltersOpen, setActivityFiltersOpen] = useState(true)
  const [reviewsAverageRating, setReviewsAverageRating] = useState(
    ssr.reviewInsights.average_rating
  )
  const [reviewsCount, setReviewsCount] = useState(ssr.reviewInsights.count)
  const [reviews, setReviews] = useState(ssr.reviews)
  const [isReviewLoading, setReviewLoading] = useState(false)
  const [activityTypes, setActivityTypes] = useState<ActivityTypes>(['sale'])
  const [initialTokenFallbackData, setInitialTokenFallbackData] = useState(true)
  const isMounted = useMounted()
  const isSmallDevice = useMediaQuery({ maxWidth: 905 }) && isMounted
  const smallSubtitle = useMediaQuery({ maxWidth: 1150 }) && isMounted
  const [playingElement, setPlayingElement] = useState<
    HTMLAudioElement | HTMLVideoElement | null
  >()
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const loadMoreObserver = useIntersectionObserver(loadMoreRef, {})
  const { addToast } = useContext(ToastContext)

  const scrollRef = useRef<HTMLDivElement | null>(null)

  const handleReviewSubmit = async (
    review: Pick<Review, 'rating' | 'comment'>
  ) => {
    setReviewLoading(true)
    const { rating, comment } = review
    try {
      if (!address || !id) {
        return
      }

      const payload: Review = {
        collection_id: id,
        rating,
        comment,
        user_id: address,
      }

      const response = await fetch(`${HOST_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.status === 409) {
        addToast?.({
          title: 'You already reviewed this collection',
          description: 'We cannot add your review.',
        })
      } else if (!response.ok) {
        addToast?.({
          title: 'Review not added',
          description: 'We cannot add your review.',
        })
      } else {
        const { data } = await response.json()
        const updatedReviews = [...reviews]
        updatedReviews.push(data)
        setReviews(updatedReviews)
        await updateReviewsData()

        addToast?.({
          title: 'Your review has been added',
          description: 'Thanks for submitting your review.',
        })
      }
    } catch (error) {
      console.error("Can't add review:", error)
    } finally {
      setReviewLoading(false)
    }
  }

  const handleReviewUpdate = async (
    review: Pick<Review, 'id' | 'rating' | 'comment'>
  ) => {
    setReviewLoading(true)
    const { id: reviewId, rating, comment } = review
    try {
      if (!address || !id) {
        return
      }

      const payload: Review = {
        collection_id: id,
        rating,
        comment,
        user_id: address,
      }

      const response = await fetch(`${HOST_URL}/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        addToast?.({
          title: 'Review not modified',
          description: 'We cannot modify your review.',
        })
      } else {
        const { data: newData } = (await response.json()) as ApiResponse<Review>
        const index = reviews.findIndex((r) => r.id === reviewId)
        const updatedReviews = [...reviews]
        if (index > -1) {
          updatedReviews[index] = {
            ...updatedReviews[index],
            ...newData,
          }

          setReviews(updatedReviews)
        }
        await updateReviewsData()

        addToast?.({
          title: 'Your review has been modified',
          description: 'Thanks for modifying your review.',
        })
      }
    } catch (error) {
      console.error("Can't modify review:", error)
    } finally {
      setReviewLoading(false)
    }
  }

  const handleReviewDelete = async (review: Pick<Review, 'id'>) => {
    setReviewLoading(true)
    const { id: reviewId } = review
    try {
      if (!address || !id) {
        return
      }

      const response = await fetch(`${HOST_URL}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        addToast?.({
          title: 'Review not deleted',
          description: 'We cannot delete your review.',
        })
      } else {
        const index = reviews.findIndex((r) => r.id === reviewId)
        const updatedReviews = [...reviews]
        if (index > -1) {
          updatedReviews.splice(index, 1)
          setReviews(updatedReviews)
        }
        await updateReviewsData()

        addToast?.({
          title: 'Your review has been deleted',
          description: 'Thanks for deleting your review.',
        })
      }
    } catch (error) {
      console.error("Can't modify review:", error)
    } finally {
      setReviewLoading(false)
    }
  }

  const updateReviewsData = async () => {
    try {
      const ids = [id]
      const response = await fetch(
        `${HOST_URL}/api/reviews/insights`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(ids),
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch reviews data`)
      }

      const { data }: ApiResponse<ReviewInsights[]> = await response.json()
      const insightsMap: Record<string, ReviewInsights> = data.reduce(
        (acc: Record<string, ReviewInsights>, insight) => {
          acc[insight.collection_id] = insight
          return acc
        },
        {}
      )

      const insight = insightsMap[String(id)]

      if (insight) {
        setReviewsAverageRating(insight.average_rating)
        setReviewsCount(insight.count)
      } else {
        setReviewsAverageRating(0)
        setReviewsCount(0)
      }

      const response2 = await fetch(`${HOST_URL}/api/reviews/${id}}`)

      if (!response2.ok) {
        throw new Error(`Failed to fetch reviews data`)
      }

      const { data: reviews }: ApiResponse<Review[]> = await response.json()

      if (reviews) {
        setReviews(reviews)
      }
    } catch (error) {
      console.error("Can't update review data:", error)
    }
  }

  const scrollToTop = () => {
    let top = (scrollRef.current?.offsetTop || 0) - (NAVBAR_HEIGHT + 16)
    window.scrollTo({ top: top })
  }

  let collectionQuery: Parameters<typeof useCollections>['0'] = {
    id,
    includeTopBid: true,
  }

  const { data: collections } = useCollections(collectionQuery, {
    fallbackData: [ssr.collection],
  })

  let collection = collections && collections[0]

  let tokenQuery: Parameters<typeof useDynamicTokens>['0'] = {
    limit: 20,
    collection: id,
    sortBy: 'floorAskPrice',
    sortDirection: 'asc',
    includeQuantity: true,
    includeLastSale: true,
  }

  const sortDirection = router.query['sortDirection']?.toString()
  const sortBy = router.query['sortBy']?.toString()

  if (sortBy === 'tokenId' || sortBy === 'rarity') tokenQuery.sortBy = sortBy
  if (sortDirection === 'desc') tokenQuery.sortDirection = 'desc'

  // Extract all queries of attribute type
  Object.keys({ ...router.query }).map((key) => {
    if (
      key.startsWith('attributes[') &&
      key.endsWith(']') &&
      router.query[key] !== ''
    ) {
      //@ts-ignore
      tokenQuery[key] = router.query[key]
    }
  })

  const {
    data: tokens,
    mutate,
    fetchNextPage,
    setSize,
    resetCache,
    isFetchingInitialData,
    isFetchingPage,
    hasNextPage,
  } = useDynamicTokens(tokenQuery, {
    fallbackData: initialTokenFallbackData ? [ssr.tokens] : undefined,
  })

  const attributesData = useAttributes(id)

  const attributes = useMemo(() => {
    if (!attributesData.data) {
      return []
    }
    return attributesData.data
      ?.filter(
        (attribute) => attribute.kind != 'number' && attribute.kind != 'range'
      )
      .sort((a, b) => a.key.localeCompare(b.key))
  }, [attributesData.data])

  if (attributeFiltersOpen && attributesData.response && !attributes.length) {
    setAttributeFiltersOpen(false)
  }

  let creatorRoyalties = collection?.royalties?.bps
    ? collection?.royalties?.bps * 0.01
    : 0
  let chain = titleCase(router.query.chain as string)

  const rarityEnabledCollection = Boolean(
    collection?.tokenCount &&
      +collection.tokenCount >= 2 &&
      attributes &&
      attributes?.length >= 2
  )

  //@ts-ignore: Ignore until we regenerate the types
  const contractKind = collection?.contractKind?.toUpperCase()

  useEffect(() => {
    const isVisible = !!loadMoreObserver?.isIntersecting
    if (isVisible) {
      fetchNextPage()
    }
  }, [loadMoreObserver?.isIntersecting])

  useEffect(() => {
    if (isMounted && initialTokenFallbackData) {
      setInitialTokenFallbackData(false)
    }
  }, [router.query])

  return (
    <Layout>
      <Head
        ogImage={ssr?.collection?.collections?.[0]?.banner}
        title={ssr?.collection?.collections?.[0]?.name}
        description={ssr?.collection?.collections?.[0]?.description as string}
      />

      {collection ? (
        <Flex
          direction="column"
          css={{
            px: '$4',
            pt: '$5',
            pb: 0,
            '@sm': {
              px: '$5',
            },
          }}
        >
          <Flex justify="between" css={{ mb: '$4' }}>
            <Flex direction="column" css={{ gap: '$4', minWidth: 0 }}>
              <Flex css={{ gap: '$4', flex: 1 }} align="center">
                <Img
                  src={collection.image!}
                  width={64}
                  height={64}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 8,
                    objectFit: 'cover',
                  }}
                  alt="Collection Page Image"
                />
                <Box css={{ minWidth: 0 }}>
                  <Flex align="center" css={{ gap: '$2' }}>
                    <Text style="h5" as="h6" ellipsify>
                      {collection.name}
                    </Text>
                    <OpenSeaVerified
                      openseaVerificationStatus={
                        collection?.openseaVerificationStatus
                      }
                    />
                  </Flex>

                  {!smallSubtitle && (
                    <Flex align="end" css={{ gap: 24 }}>
                      <CopyText
                        text={collection.id as string}
                        css={{ width: 'max-content' }}
                      >
                        <Flex css={{ gap: '$2', width: 'max-content' }}>
                          {!isSmallDevice && (
                            <Text style="body1" color="subtle">
                              Collection
                            </Text>
                          )}
                          <Text
                            style="body1"
                            color={isSmallDevice ? 'subtle' : undefined}
                            as="p"
                          >
                            {truncateAddress(collection.id as string)}
                          </Text>
                          <Box css={{ color: '$gray10' }}>
                            <FontAwesomeIcon
                              icon={faCopy}
                              width={16}
                              height={16}
                            />
                          </Box>
                        </Flex>
                      </CopyText>
                      <Box>
                        <Text style="body1" color="subtle">
                          Token Standard{' '}
                        </Text>
                        <Text style="body1">{contractKind}</Text>
                      </Box>
                      <Box>
                        <Text style="body1" color="subtle">
                          Chain{' '}
                        </Text>
                        <Link
                          href={`/collection-rankings?chain=${router.query.chain}`}
                        >
                          <Text style="body1">{chain}</Text>
                        </Link>
                      </Box>
                      <Box>
                        <Text style="body1" color="subtle">
                          Creator Earnings
                        </Text>
                        <Text style="body1"> {creatorRoyalties}%</Text>
                      </Box>
                    </Flex>
                  )}
                </Box>
              </Flex>
            </Flex>
            <CollectionActions collection={collection} />
          </Flex>
          {smallSubtitle && (
            <Grid
              css={{
                gap: 12,
                mb: 24,
                gridTemplateColumns: '1fr 1fr',
                maxWidth: 550,
              }}
            >
              <CopyText
                text={collection.id as string}
                css={{ width: 'max-content' }}
              >
                <Flex css={{ width: 'max-content' }} direction="column">
                  <Text style="body1" color="subtle">
                    Collection
                  </Text>
                  <Flex css={{ gap: '$2' }}>
                    <Text style="body1" as="p">
                      {truncateAddress(collection.id as string)}
                    </Text>
                    <Box css={{ color: '$gray10' }}>
                      <FontAwesomeIcon icon={faCopy} width={16} height={16} />
                    </Box>
                  </Flex>
                </Flex>
              </CopyText>
              <Flex direction="column">
                <Text style="body1" color="subtle">
                  Token Standard{' '}
                </Text>
                <Text style="body1">{contractKind}</Text>
              </Flex>
              <Flex direction="column">
                <Text style="body1" color="subtle">
                  Chain{' '}
                </Text>
                <Text style="body1">{chain}</Text>
              </Flex>
              <Flex direction="column">
                <Text style="body1" color="subtle">
                  Creator Earnings
                </Text>
                <Text style="body1"> {creatorRoyalties}%</Text>
              </Flex>
            </Grid>
          )}
          <StatHeader
            collection={collection}
            reviewsAverageRating={reviewsAverageRating}
            reviewsCount={reviewsCount}
          />
          <Tabs.Root
            defaultValue="items"
            onValueChange={(value) => {
              if (value === 'items') {
                resetCache()
                setSize(1)
                mutate()
              }
            }}
          >
            <TabsList>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="items">
              <Flex
                css={{
                  gap: attributeFiltersOpen ? '$5' : '',
                  position: 'relative',
                }}
                ref={scrollRef}
              >
                {isSmallDevice ? (
                  <MobileAttributeFilters
                    attributes={attributes}
                    scrollToTop={scrollToTop}
                  />
                ) : (
                  <AttributeFilters
                    attributes={attributes}
                    open={attributeFiltersOpen}
                    setOpen={setAttributeFiltersOpen}
                    scrollToTop={scrollToTop}
                  />
                )}
                <Box
                  css={{
                    flex: 1,
                    width: '100%',
                  }}
                >
                  <Flex justify="between" css={{ marginBottom: '$4' }}>
                    {attributes && attributes.length > 0 && !isSmallDevice && (
                      <FilterButton
                        open={attributeFiltersOpen}
                        setOpen={setAttributeFiltersOpen}
                      />
                    )}
                    <Flex
                      css={{
                        ml: 'auto',
                        width: '100%',
                        flexDirection: 'row',
                        whiteSpace: 'nowrap',
                        gap: '$3',
                        '@md': {
                          width: 'max-content',
                          gap: '$3',
                        },
                      }}
                    >
                      <SortTokens
                        css={{
                          order: 3,
                          px: '14px',
                          justifyContent: 'center',
                          '@md': {
                            order: 1,
                            width: '220px',
                            minWidth: 'max-content',
                            px: '$5',
                          },
                        }}
                      />
                      <Sweep
                        collectionId={collection.id}
                        buttonChildren={<FontAwesomeIcon icon={faBroom} />}
                        buttonCss={{
                          minWidth: 48,
                          minHeight: 48,
                          justifyContent: 'center',
                          padding: 0,
                          order: 1,
                          '@md': {
                            order: 2,
                          },
                        }}
                        mutate={mutate}
                      />
                      <CollectionOffer
                        collection={collection}
                        buttonCss={{
                          width: '100%',
                          justifyContent: 'center',
                          order: 2,
                          '@md': {
                            order: 3,
                          },
                          '@sm': {
                            maxWidth: '220px',
                          },
                        }}
                        mutate={mutate}
                      />
                    </Flex>
                  </Flex>
                  {!isSmallDevice && <SelectedAttributes />}
                  <Grid
                    css={{
                      gap: '$4',
                      pb: '$6',
                      gridTemplateColumns:
                        'repeat(auto-fill, minmax(200px, 1fr))',
                      '@md': {
                        gridTemplateColumns:
                          'repeat(auto-fill, minmax(240px, 1fr))',
                      },
                    }}
                  >
                    {isFetchingInitialData
                      ? Array(10)
                          .fill(null)
                          .map((_, index) => (
                            <LoadingCard key={`loading-card-${index}`} />
                          ))
                      : tokens.map((token, i) => (
                          <TokenCard
                            key={i}
                            token={token}
                            orderQuantity={
                              token?.market?.floorAsk?.quantityRemaining
                            }
                            address={address as Address}
                            mutate={mutate}
                            rarityEnabled={rarityEnabledCollection}
                            onMediaPlayed={(e) => {
                              if (
                                playingElement &&
                                playingElement !== e.nativeEvent.target
                              ) {
                                playingElement.pause()
                              }
                              const element =
                                (e.nativeEvent.target as HTMLAudioElement) ||
                                (e.nativeEvent.target as HTMLVideoElement)
                              if (element) {
                                setPlayingElement(element)
                              }
                            }}
                          />
                        ))}
                    <Box
                      ref={loadMoreRef}
                      css={{
                        display: isFetchingPage ? 'none' : 'block',
                      }}
                    >
                      {(hasNextPage || isFetchingPage) &&
                        !isFetchingInitialData && <LoadingCard />}
                    </Box>
                    {(hasNextPage || isFetchingPage) &&
                      !isFetchingInitialData && (
                        <>
                          {Array(6)
                            .fill(null)
                            .map((_, index) => (
                              <LoadingCard key={`loading-card-${index}`} />
                            ))}
                        </>
                      )}
                  </Grid>
                  {tokens.length == 0 && !isFetchingPage && (
                    <Flex
                      direction="column"
                      align="center"
                      css={{ py: '$6', gap: '$4' }}
                    >
                      <Text css={{ color: '$gray11' }}>
                        <FontAwesomeIcon icon={faMagnifyingGlass} size="2xl" />
                      </Text>
                      <Text css={{ color: '$gray11' }}>No items found</Text>
                    </Flex>
                  )}
                </Box>
              </Flex>
            </TabsContent>
            <TabsContent value="activity">
              <Flex
                css={{
                  gap: activityFiltersOpen ? '$5' : '',
                  position: 'relative',
                }}
              >
                {isSmallDevice ? (
                  <MobileActivityFilters
                    activityTypes={activityTypes}
                    setActivityTypes={setActivityTypes}
                  />
                ) : (
                  <ActivityFilters
                    open={activityFiltersOpen}
                    setOpen={setActivityFiltersOpen}
                    activityTypes={activityTypes}
                    setActivityTypes={setActivityTypes}
                  />
                )}
                <Box
                  css={{
                    flex: 1,
                    gap: '$4',
                    pb: '$5',
                  }}
                >
                  {!isSmallDevice && (
                    <FilterButton
                      open={activityFiltersOpen}
                      setOpen={setActivityFiltersOpen}
                    />
                  )}
                  <CollectionActivityTable
                    id={id}
                    activityTypes={activityTypes}
                  />
                </Box>
              </Flex>
            </TabsContent>
            <TabsContent value="reviews">
              <Flex
                css={{
                  gap: attributeFiltersOpen ? '$5' : '',
                  position: 'relative',
                }}
                ref={scrollRef}
              >
                <Box
                  css={{
                    flex: 1,
                    width: '100%',
                  }}
                >
                  <Flex justify="between" css={{ marginBottom: '$4' }}>
                    <Flex
                      css={{
                        ml: 'auto',
                        width: '100%',
                        flexDirection: 'row',
                        whiteSpace: 'nowrap',
                        gap: '$3',
                        '@md': {
                          flexDirection: 'row',
                          width: 'max-content',
                          gap: '$4',
                        },
                      }}
                    >
                      {/*<SortReviews />*/}
                      <WriteReview
                        isLoading={isReviewLoading}
                        onReviewSubmit={handleReviewSubmit}
                        buttonCss={{
                          width: '100%',
                          justifyContent: 'center',
                          '@sm': {
                            maxWidth: '220px',
                          },
                        }}
                      />
                    </Flex>
                  </Flex>
                  <ReviewsTable
                    reviews={reviews}
                    onReviewDelete={handleReviewDelete}
                    onReviewUpdate={handleReviewUpdate}
                  />
                  {reviews.length == 0 && (
                    <Flex
                      direction="column"
                      align="center"
                      css={{ py: '$6', gap: '$4' }}
                    >
                      <Text css={{ color: '$gray11' }}>
                        <FontAwesomeIcon icon={faMagnifyingGlass} size="2xl" />
                      </Text>
                      <Text css={{ color: '$gray11' }}>No reviews found</Text>
                    </Flex>
                  )}
                </Box>
              </Flex>
            </TabsContent>
          </Tabs.Root>
        </Flex>
      ) : (
        <Box />
      )}
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<{
  ssr: {
    collection?: paths['/collections/v5']['get']['responses']['200']['schema']
    tokens?: paths['/tokens/v6']['get']['responses']['200']['schema']
    hasAttributes: boolean
    reviewInsights: ReviewInsights
    reviews: Review[]
  }
  id: string | undefined
}> = async ({ params }) => {
  const id = params?.contract?.toString()
  const { reservoirBaseUrl, apiKey, routePrefix } =
    supportedChains.find((chain) => params?.chain === chain.routePrefix) ||
    DefaultChain
  const headers: RequestInit = {
    headers: {
      'x-api-key': apiKey || '',
    },
  }

  let collectionQuery: paths['/collections/v5']['get']['parameters']['query'] =
    {
      id,
      includeTopBid: true,
      normalizeRoyalties: NORMALIZE_ROYALTIES,
    }

  const collectionsPromise = fetcher(
    `${reservoirBaseUrl}/collections/v5`,
    collectionQuery,
    headers
  )

  let tokensQuery: paths['/tokens/v6']['get']['parameters']['query'] = {
    collection: id,
    sortBy: 'floorAskPrice',
    sortDirection: 'asc',
    limit: 20,
    normalizeRoyalties: NORMALIZE_ROYALTIES,
    includeDynamicPricing: true,
    includeAttributes: true,
    includeQuantity: true,
    includeLastSale: true,
  }

  const tokensPromise = fetcher(
    `${reservoirBaseUrl}/tokens/v6`,
    tokensQuery,
    headers
  )

  const ids = [id]
  const reviewInsightsPromise = await fetch(
    `${HOST_URL}/api/reviews/insights`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ids),
    }
  )
  const reviewsPromise = fetch(`${HOST_URL}/api/reviews?collection_id=${id}`)

  const promises = await Promise.allSettled([
    collectionsPromise,
    tokensPromise,
    reviewInsightsPromise,
    reviewsPromise,
  ]).catch(() => {})
  const collection: Props['ssr']['collection'] =
    promises?.[0].status === 'fulfilled' && promises[0].value.data
      ? (promises[0].value.data as Props['ssr']['collection'])
      : {}
  const tokens: Props['ssr']['tokens'] =
    promises?.[1].status === 'fulfilled' && promises[1].value.data
      ? (promises[1].value.data as Props['ssr']['tokens'])
      : {}

  const hasAttributes =
    tokens?.tokens?.some(
      (token) => (token?.token?.attributes?.length || 0) > 0
    ) || false

  const {
    data: reviewInsights,
  }: ApiResponse<Props['ssr']['reviewInsights'][]> =
    promises?.[2].status === 'fulfilled' && (await promises[2].value.json())

  const insightsMap: Record<string, ReviewInsights> = reviewInsights.reduce(
    (acc: Record<string, ReviewInsights>, insight) => {
      acc[insight.collection_id] = insight
      return acc
    },
    {}
  )

  const insight = insightsMap[String(id)]

  const { data: reviews }: ApiResponse<Props['ssr']['reviews']> =
    promises?.[3].status === 'fulfilled' && (await promises[3].value.json())
  reviews.forEach((review) => {
    fetcher(`${reservoirBaseUrl}/users/${review.user_id}/tokens/v6`, headers)
  })

  if (
    collection &&
    collection.collections?.[0].contractKind === 'erc1155' &&
    Number(collection?.collections?.[0].tokenCount) === 1 &&
    tokens?.tokens?.[0].token?.tokenId !== undefined
  ) {
    return {
      redirect: {
        destination: `/collection/${routePrefix}/${id}/${tokens.tokens[0].token.tokenId}`,
        permanent: false,
      },
    }
  }

  return {
    props: {
      ssr: {
        collection,
        tokens,
        hasAttributes,
        reviewInsights: insight,
        reviews,
      },
      id,
    },
    revalidate: 30,
  }
}

export default CollectionPage
