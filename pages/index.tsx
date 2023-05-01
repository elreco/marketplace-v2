import { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import { Text, Flex, Box, Button } from 'components/primitives'
import Layout from 'components/Layout'
import {
  ComponentPropsWithoutRef,
  useContext,
  useState,
  lazy,
  Suspense,
} from 'react'
import { Footer } from 'components/home/Footer'
import { useMediaQuery } from 'react-responsive'
import { useMarketplaceChain, useMounted } from 'hooks'
import { paths } from '@reservoir0x/reservoir-sdk'
import { useAccount } from 'wagmi'
import { useCollections } from '@reservoir0x/reservoir-kit-ui'
import fetcher from 'utils/fetcher'
import { NORMALIZE_ROYALTIES } from './_app'
import supportedChains, { DefaultChain } from 'utils/chains'
import Link from 'next/link'
import ChainToggle from 'components/common/ChainToggle'
import CollectionsTimeDropdown, {
  CollectionsSortingOption,
} from 'components/common/CollectionsTimeDropdown'
import { Head } from 'components/Head'
import { CollectionRankingsTable } from 'components/rankings/CollectionRankingsTable'
import { ChainContext } from 'context/ChainContextProvider'
import { ChainCollections, TopRatedCollection } from 'types'
import { updateCollectionsWithReviews } from 'utils/reviews'
import LoadingSpinner from 'components/common/LoadingSpinner'
import { TopRatedSwiper } from 'components/collections/TopRatedSwiper'

const CollectionRankingsTableWrapper = lazy(
  () => import('components/rankings/CollectionRankingsTableWrapper')
)

type Props = InferGetStaticPropsType<typeof getStaticProps>

const IndexPage: NextPage<Props> = ({ ssr }) => {
  const isSSR = typeof window === 'undefined'
  const isMounted = useMounted()
  const compactToggleNames = useMediaQuery({ query: '(max-width: 800px)' })
  const [sortByTime, setSortByTime] =
    useState<CollectionsSortingOption>('1DayVolume')
  const marketplaceChain = useMarketplaceChain()
  const { isDisconnected } = useAccount()

  let collectionQuery: Parameters<typeof useCollections>['0'] = {
    limit: 10,
    sortBy: sortByTime,
    includeTopBid: true,
  }

  const { chain } = useContext(ChainContext)

  if (chain.collectionSetId) {
    collectionQuery.collectionsSetId = chain.collectionSetId
  } else if (chain.community) {
    collectionQuery.community = chain.community
  }

  const { data, isValidating } = useCollections(collectionQuery, {
    fallbackData: [ssr.collections[marketplaceChain.id]],
  })

  let volumeKey: ComponentPropsWithoutRef<
    typeof CollectionRankingsTable
  >['volumeKey'] = 'allTime'

  switch (sortByTime) {
    case '1DayVolume':
      volumeKey = '1day'
      break
    case '7DayVolume':
      volumeKey = '7day'
      break
    case '30DayVolume':
      volumeKey = '30day'
      break
  }

  return (
    <>
      {isMounted && <TopRatedSwiper topRatedCollections={ssr.topRatedCollections} />}
      <Layout pt={10}>
        <Head />
        <Box
          css={{
            p: 24,
            height: '100%',
            '@bp800': {
              p: '$6',
            },
          }}
        >
          {isDisconnected && (
            <Flex
              direction="column"
              align="center"
              css={{ mx: 'auto', maxWidth: 728, pt: '$2', textAlign: 'center' }}
            >
              <Text style="h3" css={{ mb: 24 }}>
                NFT Canyon Marketplace
              </Text>
              <Text style="body1" css={{ mb: 48 }}>
                Buy, sell, and explore NFTs while sharing insights and opinions.
                Elevate your NFT experience with community-driven reviews and
                ratings.
              </Text>
            </Flex>
          )}

          <Flex css={{ my: '$5', gap: 65 }} direction="column">
            <Flex
              justify="between"
              align="start"
              css={{
                flexDirection: 'column',
                gap: 24,
                '@bp800': {
                  alignItems: 'center',
                  flexDirection: 'row',
                },
              }}
            >
              <Text style="h4" as="h4">
                Popular Collections
              </Text>
              <Flex align="center" css={{ gap: '$4' }}>
                <CollectionsTimeDropdown
                  compact={compactToggleNames && isMounted}
                  option={sortByTime}
                  onOptionSelected={(option) => {
                    setSortByTime(option)
                  }}
                />
                <ChainToggle />
              </Flex>
            </Flex>

            {!isSSR && isMounted && (
              <Suspense fallback={<div>Loading...</div>}>
                <CollectionRankingsTableWrapper
                  data={data}
                  isValidating={isValidating}
                  volumeKey={volumeKey}
                />
              </Suspense>
            )}
            {isValidating && (
              <Flex align="center" justify="center" css={{ py: '$4' }}>
                <LoadingSpinner />
              </Flex>
            )}
            <Box css={{ alignSelf: 'center' }}>
              <Link href="/collection-rankings">
                <Button
                  css={{
                    minWidth: 224,
                    justifyContent: 'center',
                  }}
                  size="large"
                >
                  View All
                </Button>
              </Link>
            </Box>
          </Flex>
          <Footer />
        </Box>
      </Layout>
    </>
  )
}

export const getStaticProps: GetStaticProps<{
  ssr: {
    collections: ChainCollections
    topRatedCollections: TopRatedCollection[]
  }
}> = async () => {
  let collectionQuery: paths['/collections/v5']['get']['parameters']['query'] =
    {
      sortBy: '1DayVolume',
      normalizeRoyalties: NORMALIZE_ROYALTIES,
      includeTopBid: true,
      limit: 10,
    }

  const promises: ReturnType<typeof fetcher>[] = []
  supportedChains.forEach((chain) => {
    const query = { ...collectionQuery }
    if (chain.collectionSetId) {
      query.collectionsSetId = chain.collectionSetId
    } else if (chain.community) {
      query.community = chain.community
    }

    promises.push(
      fetcher(`${chain.reservoirBaseUrl}/collections/v5`, query, {
        headers: {
          'x-api-key': chain.apiKey || '',
        },
      })
    )
  })

  const responses = await Promise.allSettled(promises)
  const collections: ChainCollections = {}

  responses.forEach(async (response, i) => {
    if (response.status === 'fulfilled') {
      collections[supportedChains[i].id] = response.value.data
      collections[supportedChains[i].id].collections =
        await updateCollectionsWithReviews(
          collections[supportedChains[i].id].collections
        )
    }
  })

  const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL
  const fetchTopRatedCollections = await fetch(
    `${HOST_URL}/api/reviews/topRatedCollections`
  )
  const { data: topRatedCollections } = await fetchTopRatedCollections.json()
  await Promise.all(
    topRatedCollections.map(
      async (topRatedCollection: TopRatedCollection, index: number) => {
        const chain =
          supportedChains.find(
            (c) => c.routePrefix === topRatedCollection.chain_slug
          ) || DefaultChain

        if (chain) {
          const { data } = await fetcher(
            `${chain.reservoirBaseUrl}/collections/v5`,
            {
              id: topRatedCollection.collection_id,
            },
            {
              headers: {
                'x-api-key': chain?.apiKey || '',
              },
            }
          )
          if (data.collections && data.collections[0]) {
            topRatedCollection.collection = data.collections[0]
          } else {
            topRatedCollections.splice(index, 1)
          }
        } else {
          topRatedCollections.splice(index, 1)
        }
      }
    )
  )
  return {
    props: { ssr: { collections, topRatedCollections } },
    revalidate: 5,
  }
}

export default IndexPage
