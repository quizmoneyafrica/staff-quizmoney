import { Flex } from '@radix-ui/themes';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

function LeftSide() {
  return (
    <>
      <div className="hidden lg:inline-block">
        <div className="bg-primary-50 grid h-screen w-full grid-cols-1 p-4 lg:h-full lg:px-10 ">
          <Link href="/">
            <Flex align="center" justify="between">
              <Image
                src="/icons/quizmoney-logo-blue.svg"
                alt="Quiz Money"
                width={100}
                height={55}
                priority
              />
            </Flex>
          </Link>

          <div>
            <div className="flex-col items-center justify-between px-4 pt-4 text-center">
              <div className="flex items-center justify-center">
                <Image
                  src="/assets/images/reset-password.png"
                  alt="Quiz Money Verify Email"
                  width={300}
                  height={300}
                  className="mb-6"
                />
              </div>
              <h2 className="font-heading mb-2 text-xl font-semibold">
                Reset Your Password
              </h2>
              <p className="font-text mx-auto text-gray-600 md:max-w-[70%]">
                Don&apos;t worry you can reset your password with ease
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LeftSide;
