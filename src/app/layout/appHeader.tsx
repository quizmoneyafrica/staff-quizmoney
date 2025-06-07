'use client';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { Avatar, Container, Flex, Heading, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowDownFillIcon,
  BellIcon,
  CircleArrowLeft,
  LogoutIcon,
  PersonIcon,
  SupportIcon,
} from '../icons/icons';
import { useAppSelector } from '../hooks/useAuth';
import { decryptData } from '../utils/crypto';
import { DropdownMenu } from 'radix-ui';
import LogoutDialog from '../components/logout/logout';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import NotificationApi from '../api/notification';
import Parse, { liveQueryClient } from '@/app/api/parse/parseClient';
import { setNotifications } from '../store/notificationSlice';

function AppHeader() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const excludedPaths = ['/practice-game'];
  const encrypted = useAppSelector((s) => s.auth.userEncryptedData);
  const router = useRouter();
  const [openLogout, setOpenLogout] = useState(false);
  const unreadCount = useSelector((state: RootState) => {
    const list = state.notifications.notifications;
    return Array.isArray(list) ? list.filter((n) => !n.read).length : 0;
  });
  const user = encrypted ? decryptData(encrypted) : null;

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await NotificationApi.fetchNotifications();
      dispatch(setNotifications(res.data.result.notifications));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err.message);
    }
  }, [dispatch]);
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let subscription: any;
    const NotificationLiveQuery = async () => {
      const userPointer = {
        __type: 'Pointer',
        className: '_User',
        objectId: user?.objectId,
      };

      const query = new Parse.Query('Notification');
      query.equalTo('user', userPointer);
      subscription = await liveQueryClient.subscribe(query);

      subscription?.on('create', () => {
        fetchNotifications();
      });
      subscription?.on('update', () => {
        fetchNotifications();
      });
      subscription?.on('delete', () => {
        fetchNotifications();
      });
    };

    NotificationLiveQuery();
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [fetchNotifications, user?.objectId]);
  if (excludedPaths.includes(pathname)) return null;

  const lastSegment =
    pathname
      .split('/')
      .filter(Boolean)
      .pop()
      ?.replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase()) || '';

  return (
    <div className="pb-4">
      <Flex align="center" justify="between" gap="2">
        <Heading
          size={{ initial: '4', lg: '5' }}
          className="flex max-w-[200px] flex-wrap items-center overflow-hidden text-ellipsis whitespace-nowrap capitalize sm:max-w-none"
        >
          <div className=" flex flex-row items-center gap-2">
            {((pathname.split('/').length > 2 &&
              !pathname.includes('player-profile')) ||
              pathname.includes('notification')) && (
              <button
                onClick={() => router?.back()}
                className=" cursor-pointer "
              >
                <CircleArrowLeft />
              </button>
            )}
            {!pathname.includes('player-profile') && (
              <span className=" lg:flex">
                {lastSegment === 'Home'
                  ? `Welcome, ${user?.firstName} 👋`
                  : lastSegment}
              </span>
            )}
            {pathname.includes('player-profile') && (
              <span className=" text-[#1B212D] lg:flex">User Profile</span>
            )}
          </div>

          {/* <span className="lg:hidden">{lastSegment}</span> */}
        </Heading>
        <Flex align="center" gap={{ initial: '3', lg: '6' }}>
          <Link
            href="/notification"
            className="hover:text-primary-900 relative text-neutral-600"
          >
            <BellIcon />
            {unreadCount > 0 && (
              <div className="bg-primary-900 absolute -top-1 right-0 flex h-4 w-4 items-center justify-center rounded-full text-xs text-white">
                {unreadCount}
              </div>
            )}
          </Link>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Container className="border-primary-50 cursor-pointer rounded-full border bg-white p-1 lg:border-none lg:px-2 lg:py-1">
                <Flex align="center" gap="2">
                  <Avatar
                    src={user?.avatar}
                    fallback={user?.firstName?.charAt(0).toUpperCase()}
                    radius="full"
                    className="bg-primary-50"
                  />
                  <p className="hidden font-medium capitalize text-[#1B212D] lg:flex">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <ArrowDownFillIcon className="hidden text-neutral-500 lg:flex" />
                </Flex>
              </Container>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="DropdownMenuContent"
                sideOffset={5}
              >
                <DropdownMenu.Item
                  className="DropdownMenuItem"
                  onClick={() => router.push('/settings/profile')}
                >
                  My Profile{' '}
                  <span className="RightSlot">
                    <PersonIcon />
                  </span>
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  className="DropdownMenuItem"
                  onClick={() => router.push('/support')}
                >
                  Support{' '}
                  <span className="RightSlot">
                    <SupportIcon />
                  </span>
                </DropdownMenu.Item>

                <Link href="https://quizmoney.ng/how-it-works" target="_blank">
                  <DropdownMenu.Item className="DropdownMenuItem">
                    How It Works{' '}
                    <span className="RightSlot">
                      <QuestionMarkCircledIcon />
                    </span>
                  </DropdownMenu.Item>
                </Link>
                <DropdownMenu.Item
                  onSelect={() => {
                    setOpenLogout(true);
                  }}
                  className="DropdownMenuItem hover:!bg-error-900"
                >
                  Logout{' '}
                  <span className="RightSlot">
                    <LogoutIcon />
                  </span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </Flex>
      </Flex>
      {lastSegment === 'Home' && (
        <>
          {/* <Heading size={{ initial: "4", lg: "5" }} className="lg:hidden">
						Hello <span className="capitalize">{user?.firstName}</span> 👋
					</Heading> */}
          <Text className="text-sm lg:text-base">
            Let&apos;s see what you&apos;ve got
          </Text>
        </>
      )}
      <LogoutDialog open={openLogout} onOpenChange={setOpenLogout} />
    </div>
  );
}

export default AppHeader;
