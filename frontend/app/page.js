import React from 'react'
import Link from 'next/link'
const home = () => {
  return (
    <div> 
      <button className='bg-blue-700 text-white ml-20 '><Link href='/login'>Go to Login page</Link></button>
    </div>
  )
}

export default home