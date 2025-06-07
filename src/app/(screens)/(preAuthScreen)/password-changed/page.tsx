'use client';

import { Container, Flex, Grid, Heading, Text } from '@radix-ui/themes';
import LeftSide from '../forgot-password/leftSide';
import CustomButton from '@/app/utils/CustomBtn';
import { SuccessIcon } from '@/app/utils/successIcon';
import { useRouter } from 'next/navigation';

function Page() {
  const router = useRouter();

  return (
    <>
      <Grid columns={{ initial: '1', md: '2' }} className="h-screen">
        <LeftSide />
        <Container className="flex items-center px-4 pt-8 lg:justify-center lg:px-28 ">
          <div className="space-y-10">
            <Flex
              align="center"
              direction="column"
              gap="3"
              className="text-center"
            >
              <SuccessIcon size="lg" />
              <Heading as="h2">Successful</Heading>
              <Text className="text-neutral-600 ">
                Your password has been changed successfully
              </Text>
            </Flex>
            <CustomButton
              type="button"
              width="full"
              onClick={() => router.replace('/login')}
            >
              Login
            </CustomButton>
          </div>
        </Container>
      </Grid>
    </>
  );
}

export default Page;
