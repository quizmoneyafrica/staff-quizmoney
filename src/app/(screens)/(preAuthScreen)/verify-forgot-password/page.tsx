'use client';
import { Container, Flex, Grid, Heading, Text } from '@radix-ui/themes';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CircleArrowLeft } from '@/app/icons/icons';
import { useSearchParams } from 'next/navigation';
import CustomButton from '@/app/utils/CustomBtn';
import { unstable_OneTimePasswordField as OneTimePasswordField } from 'radix-ui';
import { formatCountDown, resendTimer, toastPosition } from '@/app/utils/utils';
import UserAPI from '@/app/api/userApi';
import { toast } from 'sonner';
import LeftSide from '../forgot-password/leftSide';
import Link from 'next/link';

function Page() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const router = useRouter();
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(resendTimer);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!email) {
    router.replace('/forgot-password');
  }
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newValues = {
      email: email?.toLowerCase().trim() || '',
      otp: otpCode,
    };
    try {
      const response = await UserAPI.verifyForgotPasswordOtp(newValues);
      if (response.status === 200) {
        router.push(`/reset-password?email=${encodeURIComponent(email || '')}`);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setLoading(false);
      toast.error(`${err.response.data.error}`, {
        position: toastPosition,
      });
    }
  };
  const handleResendOTP = async () => {
    setCountdown(resendTimer);
    setCanResend(false);
    try {
      const response = await UserAPI.forgotPassword(email || '');
      console.log('response: ', response);
      toast.success('OTP Reset Successfully', {
        position: toastPosition,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.log('ERROR Forgot Password', err);
      toast.error(`${err.response.data.error}`, {
        position: toastPosition,
      });
    }
  };
  return (
    <>
      <Grid columns={{ initial: '1', md: '2' }} className="h-screen">
        <LeftSide />
        <Container className="flex items-center px-4 pt-8 lg:justify-center lg:px-28 ">
          <form onSubmit={handleVerify}>
            <div className="space-y-8">
              <Link href="/" className="lg:hidden ">
                <Image
                  src="/icons/quizmoney-logo-blue.svg"
                  alt="Quiz Money"
                  width={100}
                  height={55}
                  priority
                />
              </Link>
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
                <Heading as="h2">Enter Reset Code</Heading>
                <Text className="text-neutral-600 ">
                  We&apos;ve sent you an email with a reset code
                </Text>
              </Flex>
              <div>
                <Text className="text-neutral-600 ">
                  Please enter the 6-digit code sent to your email{' '}
                  <span className="text-secondary-900 underline underline-offset-2">
                    {email}
                  </span>{' '}
                  to reset your password
                </Text>
              </div>
              <div>
                <Flex direction="column" gap="4">
                  <Heading as="h3" size="4" weight="medium">
                    Enter OTP Code
                  </Heading>
                  <div className="w-full md:max-w-[50%] lg:max-w-[80%]">
                    <OneTimePasswordField.Root
                      className="OTPRoot"
                      name="otp"
                      value={otpCode}
                      autoComplete="one-time-code"
                      onValueChange={setOtpCode}
                      disabled={loading}
                    >
                      <OneTimePasswordField.Input className="OTPInput" />
                      <OneTimePasswordField.Input className="OTPInput" />
                      <OneTimePasswordField.Input className="OTPInput" />
                      <OneTimePasswordField.Input className="OTPInput" />
                      <OneTimePasswordField.Input className="OTPInput" />
                      <OneTimePasswordField.Input className="OTPInput" />
                      <OneTimePasswordField.HiddenInput />
                    </OneTimePasswordField.Root>
                    {/* <p className="text-error-500 mt-4">
											Incorrect OTP provided
										</p> */}
                  </div>
                </Flex>
              </div>
              <div>
                <Text className="text-neutral-600 ">
                  Didn&apos;t get code?{' '}
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className={`font-medium underline underline-offset-2 ${
                      canResend
                        ? 'text-primary-900 cursor-pointer'
                        : 'cursor-not-allowed text-gray-400'
                    }`}
                  >
                    Resend Code
                  </button>
                  <span> • </span>
                  <span>{formatCountDown(countdown)}</span>
                </Text>
              </div>

              <div className="pt-10 lg:pt-4">
                {!loading ? (
                  <CustomButton
                    type="submit"
                    width="full"
                    disabled={otpCode.length !== 6}
                  >
                    Verify Account
                  </CustomButton>
                ) : (
                  <CustomButton type="button" width="full" loader disabled />
                )}
              </div>
            </div>
          </form>
        </Container>
      </Grid>
    </>
  );
}

export default Page;
