"use client";

import { Flex, Heading, Text } from "@radix-ui/themes";
import Image from "next/image";
import { useState } from "react";
import LoginForm from "./loginForm";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);

  return (
    <>
      <div className="flex lg:justify-center px-4 lg:px-28 pt-8 bg-primary-50 min-h-screen w-full">
        <div className="space-y-8 w-full max-w-xl">
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
