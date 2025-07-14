'use client'

import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Page() {

  const [data, setData] = useState<{test: number }>({test: 0})

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/`)
    .then((res) => res.data)
    .then((data) => {
      setData(data)
    })
  }, [])

  return (
    <div>
      <h1>test</h1>
      <p>{data.test}</p>
    </div>
  )
}
