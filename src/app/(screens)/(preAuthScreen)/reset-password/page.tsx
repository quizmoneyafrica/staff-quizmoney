'use client';
import { Container, Flex, Grid, Heading, Text } from '@radix-ui/themes';
import React, { useState } from 'react';
import LeftSide from '../forgot-password/leftSide';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomTextField from '@/app/utils/CustomTextField';
import { EyeIcon, EyeSlash } from '@/app/icons/icons';
import CustomButton from '@/app/utils/CustomBtn';
import { toastPosition } from '@/app/utils/utils';
import UserAPI from '@/app/api/userApi';
import { toast } from 'sonner';
import { PasswordChip } from '@/app/utils/passwordChip';

const initialForm = {
  password: '',
  confirmPassword: '',
  showPassword: false,
  showConfirmPassword: false,
};
function Page() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const router = useRouter();
  if (!email) {
    router.replace('/forgot-password');
  }
  //
  const [loading, setLoading] = useState(false);
  const [resetForm, setResetForm] = useState(initialForm);

  const handleResetFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setResetForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const toggleResetFieldVisibility = (
    field: 'showPassword' | 'showConfirmPassword',
  ) => {
    setResetForm((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const isPasswordValid =
    resetForm.password.length >= 8 &&
    /[A-Z]/.test(resetForm.password) &&
    /[!@#$%^&*]/.test(resetForm.password) &&
    /[0-9]/.test(resetForm.password);

  const isFormValid =
    isPasswordValid && resetForm.password === resetForm.confirmPassword;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const newValues = {
      email: email?.toLowerCase().trim() || '',
      password: resetForm.password,
    };

    try {
      const response = await UserAPI.resetPasswordAuth(newValues);
      if (response.status === 200) {
        router.push(
          `/password-changed?email=${encodeURIComponent(email || '')}`,
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(`${err.response.data.error}`, {
        position: toastPosition,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Grid columns={{ initial: '1', md: '2' }} className="h-screen">
        <LeftSide />
        <Container className="flex items-center px-4 pt-8 lg:justify-center lg:px-28 ">
          <form onSubmit={handleResetPassword}>
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
              {/* <div>
								<Flex
									align="center"
									gap="2"
									onClick={() => router.back()}
									className="cursor-pointer">
									<CircleArrowLeft /> Back
								</Flex>
							</div> */}
              <Flex direction="column" gap="1">
                <Heading as="h2">Create New Password </Heading>
                <Text className="text-neutral-600 ">
                  Go ahead and change your password
                </Text>
              </Flex>
              <Flex direction="column" gap="8">
                <Container>
                  <CustomTextField
                    label="Password"
                    name="password"
                    value={resetForm.password}
                    type={resetForm.showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    onChange={handleResetFormChange}
                    icon={
                      resetForm.showPassword ? (
                        <EyeIcon
                          className="text-[#A6ABC4]"
                          onClick={() =>
                            toggleResetFieldVisibility('showPassword')
                          }
                        />
                      ) : (
                        <EyeSlash
                          className="text-[#A6ABC4]"
                          onClick={() =>
                            toggleResetFieldVisibility('showPassword')
                          }
                        />
                      )
                    }
                    disabled={loading}
                  />
                  <Flex mt="2" gap="2" wrap="wrap">
                    <PasswordChip
                      text="At least 8 characters"
                      valid={resetForm.password.length >= 8}
                    />
                    <PasswordChip
                      text="One uppercase letter"
                      valid={/[A-Z]/.test(resetForm.password)}
                    />
                    <PasswordChip
                      text="One special character"
                      valid={/[!@#$%^&*]/.test(resetForm.password)}
                    />
                    <PasswordChip
                      text="One digit"
                      valid={/[0-9]/.test(resetForm.password)}
                    />
                  </Flex>
                </Container>
                <Container>
                  <CustomTextField
                    label="Confirm Password"
                    name="confirmPassword"
                    value={resetForm.confirmPassword}
                    type={resetForm.showConfirmPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    onChange={handleResetFormChange}
                    icon={
                      resetForm.showConfirmPassword ? (
                        <EyeIcon
                          className="text-[#A6ABC4]"
                          onClick={() =>
                            toggleResetFieldVisibility('showConfirmPassword')
                          }
                        />
                      ) : (
                        <EyeSlash
                          className="text-[#A6ABC4]"
                          onClick={() =>
                            toggleResetFieldVisibility('showConfirmPassword')
                          }
                        />
                      )
                    }
                    disabled={loading}
                  />
                  <Flex mt="2" gap="2" wrap="wrap">
                    <PasswordChip
                      text={`${
                        resetForm.confirmPassword.length < 1
                          ? 'Password Match'
                          : resetForm.confirmPassword === resetForm.password
                          ? 'Password Match'
                          : 'Passwords do not match'
                      }`}
                      valid={resetForm.password === resetForm.confirmPassword}
                    />
                  </Flex>
                </Container>

                {!loading ? (
                  <CustomButton
                    type="submit"
                    width="full"
                    disabled={!isFormValid}
                  >
                    Reset Password
                  </CustomButton>
                ) : (
                  <CustomButton type="button" width="full" loader disabled />
                )}
              </Flex>
            </div>
          </form>
        </Container>
      </Grid>
    </>
  );
}

export default Page;
