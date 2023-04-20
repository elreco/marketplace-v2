import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import dayjsTimezone from 'dayjs/plugin/timezone'
import dayjsUtc from 'dayjs/plugin/utc'

dayjs.extend(relativeTime)
dayjs.extend(dayjsUtc);
dayjs.extend(dayjsTimezone);

export default function (timestamp?: number | string) {
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    timestamp = Math.floor(date.getTime() / 1000);
  }
  const [timeSince, setTimeSince] = useState('')

  useEffect(() => {
    if (timestamp) {
      setTimeSince(dayjs.unix(timestamp).fromNow())
    } else {
      setTimeSince('')
    }
  }, [timestamp])

  return timeSince
}
