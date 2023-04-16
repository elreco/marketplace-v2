import React, { useState, FC } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarEmpty } from '@fortawesome/free-regular-svg-icons'
import { Flex, Text } from './primitives'
import { IconProp, SizeProp } from '@fortawesome/fontawesome-svg-core'

type Props = {
  rating: number
  onRatingChange?: (newRating: number) => void
  readOnly?: boolean
  starSize?: SizeProp
  isRatingTextSmall?: boolean
}

const RatingStars: FC<Props> = ({
  rating,
  onRatingChange,
  readOnly = false,
  starSize = 'xs',
  isRatingTextSmall = false
}) => {
  const [hoveredStar, setHoveredStar] = useState(-1)
  const fullStars = Math.floor(rating)
  const halfStar = rating - fullStars >= 0.5

  const stars = Array(fullStars).fill(faStar)
  if (halfStar) {
    stars.push(faStarHalfAlt)
  }
  while (stars.length < 5) {
    stars.push(faStarEmpty)
  }

  const getStar = (
    star: typeof faStar | typeof faStarHalfAlt | typeof faStarEmpty,
    index: number
  ) => {
    if (!readOnly && hoveredStar >= index) {
      return faStar
    }
    return star as IconProp
  }

  const handleStarClick = (index: number) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(index + 1)
    }
  }

  const handleMouseEnter = (index: number) => {
    if (!readOnly) {
      setHoveredStar(index)
    }
  }

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoveredStar(-1)
    }
  }

  return (
    <Flex align="center">
      {stars.map((star, index) => (
        <Text
          key={index}
          css={{
            color: '$yellow8',
            cursor: readOnly ? 'normal' : 'pointer',
          }}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleStarClick(index)}
        >
          <FontAwesomeIcon icon={getStar(star, index)} size={starSize} />
        </Text>
      ))} 
      {readOnly && <Text css={{marginLeft: '$2'}} style={isRatingTextSmall ? 'subtitle2' : 'h6'}>{rating}</Text>}
    </Flex>
  )
}

export default RatingStars
