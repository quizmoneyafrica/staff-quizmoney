'use client';
import React from 'react';
import CustomImage from '../components/CustomImage';
import { useRouter } from 'next/navigation';

export default function BackButton() {
  const route = useRouter();

  return (
    <button
      onClick={() => route.back()}
      className=" flex w-fit cursor-pointer items-center gap-2"
    >
      <CustomImage src={'/icons/arrLeft.svg'} alt="" />
      Go Back
    </button>
  );
}
