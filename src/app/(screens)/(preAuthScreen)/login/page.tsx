'use client';

import { Flex, Heading, Text } from '@radix-ui/themes';
import Image from 'next/image';
import { useState } from 'react';
import LoginForm from '@/app/(screens)/(preAuthScreen)/login/loginForm';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);

  return (
    <>
      <div className="bg-primary-50 flex min-h-screen w-full px-4 pt-8 lg:justify-center lg:px-28">
        <div className="w-full max-w-xl space-y-8">
          <div>
            <Image
              src="/icons/quizmoney-logo-blue.svg"
              alt="Quiz Money"
              width={100}
              height={55}
              priority
            />
          </div>
          <Flex direction="column" gap="1">
            <Heading as="h2">Welcome Back!</Heading>
            <Text className="text-neutral-600 ">
              QM Technologies Staff Only
            </Text>
          </Flex>
          <LoginForm loading={loading} setLoading={setLoading} />
        </div>
      </div>
    </>
  );
};
export default LoginPage;
