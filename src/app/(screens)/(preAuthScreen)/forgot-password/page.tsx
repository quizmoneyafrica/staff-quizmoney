'use client';
import { Container, Flex, Grid, Heading, Text } from '@radix-ui/themes';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/app/hooks/useAuth';
import AppLoader from '@/app/components/loader/loader';
import Image from 'next/image';
import { CircleArrowLeft, MailIcon } from '@/app/icons/icons';
import CustomButton from '@/app/utils/CustomBtn';
import { isValidEmail, toastPosition } from '@/app/utils/utils';
import CustomTextField from '@/app/utils/CustomTextField';
import Link from 'next/link';
import UserAPI from '@/app/api/userApi';
import { toast } from 'sonner';
import LeftSide from './leftSide';

function Page() {
  const [emailAddress, setEmailAddress] = useState('');
  const router = useRouter();
  const { isAuthenticated, rehydrated } = useAppSelector((s) => s.auth);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (rehydrated && isAuthenticated) {
      router.replace('/home');
    }
  }, [isAuthenticated, rehydrated, router]);

  if (!rehydrated) return <AppLoader />;

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await UserAPI.forgotPassword(emailAddress);

      router.push(
        `/verify-forgot-password?email=${encodeURIComponent(emailAddress)}`,
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(`${err.response.data.message}`, {
        position: toastPosition,
      });
      setLoading(false);
    }
  };
  return (
    <>
      <Grid columns={{ initial: '1', md: '2' }} className="h-screen">
        <LeftSide />
        <Container className="flex items-center px-4 pt-8 lg:justify-center lg:px-28 ">
          <form onSubmit={handleForgot}>
            <div className="space-y-8">
              <div className="lg:hidden ">
                <Image
                  src="/icons/quizmoney-logo-blue.svg"
                  alt="Quiz Money"
                  width={100}
                  height={55}
                  priority
                />
              </div>
              <div className="">
                <Flex
                  align="center"
                  gap="2"
                  onClick={() => router.back()}
                  className="cursor-pointer"
                >
                  <CircleArrowLeft /> Back
                </Flex>
              </div>
              <Flex direction="column" gap="1">
                <Heading as="h2">
                  Oops!
                  <br /> Forgot your Password?
                </Heading>
                <Text className="text-neutral-600 ">
                  No worries, let&apos;s get you back in the game. Enter your
                  email for password reset code.
                </Text>
              </Flex>
              <Flex direction="column" gap="8">
                <CustomTextField
                  label="Email"
                  name="email"
                  value={emailAddress}
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  onChange={(e) => setEmailAddress(e.target.value)}
                  icon={<MailIcon className="text-[#A6ABC4]" />}
                  disabled={loading}
                />

                {!loading ? (
                  <CustomButton
                    type="submit"
                    width="full"
                    disabled={!isValidEmail(emailAddress)}
                  >
                    Send Verification Code
                  </CustomButton>
                ) : (
                  <CustomButton type="button" width="full" loader disabled />
                )}

                <Flex align="center" justify="center">
                  <Link
                    href="/login"
                    className="text-primary-900 inline-block text-center font-medium underline underline-offset-2"
                  >
                    Login instead
                  </Link>
                </Flex>
              </Flex>
            </div>
          </form>
        </Container>
      </Grid>
    </>
  );
}

export default Page;
