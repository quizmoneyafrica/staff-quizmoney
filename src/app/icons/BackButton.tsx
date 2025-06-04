
'use client'
import React from 'react'
import CustomImage from '../components/CustomImage'
import { useRouter } from 'next/navigation'


export default function BackButton() {
  const route = useRouter()
  return (
    <button onClick={()=>route.back()} className=' cursor-pointer w-fit flex gap-2 items-center'>
        <CustomImage src={'/icons/arrLeft.svg'} alt=''/>
        Go Back
      </button>
  )
}