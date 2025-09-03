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
import { BuildingIcon } from '@/app/icons/icons';

import { useAppSelector } from '../hooks/useAuth';
import { DropdownMenu } from 'radix-ui';
import LogoutDialog from '../components/logout/logout';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import NotificationApi from '../api/notification';
import { setNotifications } from '../store/notificationSlice';
import { bottomNav, navs } from './nav';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { NavDropdown } from '../components/ui/NavDropdown';

interface NotificationError {
  message: string;
}

const HamburgerIcon = ({
  isOpen,
  isWhite = false,
}: {
  isOpen: boolean;
  isWhite?: boolean;
}) => {
  const colorClass = isWhite ? 'bg-white' : 'bg-gray-700';

  return (
    <div className="flex h-6 w-6 cursor-pointer flex-col items-center justify-center">
      <span
        className={`block h-0.5 w-6 rounded-sm ${colorClass} transition-all duration-300 ease-out ${
          isOpen ? 'translate-y-1 rotate-45' : '-translate-y-0.5'
        }`}
      />
      <span
        className={`my-0.5 block h-0.5 w-6 rounded-sm ${colorClass} transition-all duration-300 ease-out ${
          isOpen ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <span
        className={`block h-0.5 w-6 rounded-sm ${colorClass} transition-all duration-300 ease-out ${
          isOpen ? '-translate-y-1 -rotate-45' : 'translate-y-0.5'
        }`}
      />
    </div>
  );
};

function AppHeader() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const excludedPaths = ['/practice-game'];

  const router = useRouter();
  const [openLogout, setOpenLogout] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const user = useAppSelector((s) => s.auth.userEncryptedData);
  const currentGame = useAppSelector((s) => s.game.currentGame);
  const unreadCount = useSelector((state: RootState) => {
    const list = state.notifications.notifications;
    return Array.isArray(list) ? list.filter((n) => !n.read).length : 0;
  });

  const isDashboard = pathname === '/' || pathname === '/dashboard';

  //   const fetchNotifications = useCallback(async () => {
  //     try {
  //       const res = await NotificationApi.fetchNotifications();
  //       dispatch(setNotifications(res.data.result.notifications));
  //     } catch (err) {
  //       console.error('err: ', err);
  //     }
  //   }, [dispatch]);
  //
  //   useEffect(() => {
  //     fetchNotifications();
  //   }, [fetchNotifications]);

  //   useEffect(() => {
  //     let subscription: ParseSubscription | null = null;
  //
  //     const NotificationLiveQuery = async () => {
  //       const userPointer = {
  //         __type: 'Pointer',
  //         className: '_User',
  //         objectId: user?.user?.objectId,
  //       };
  //
  //       const query = new Parse.Query('Notification');
  //       query.equalTo('user', userPointer);
  //       subscription = (await liveQueryClient.subscribe(
  //         query,
  //       )) as ParseSubscription;
  //
  //       subscription?.on('create', () => {
  //         fetchNotifications();
  //       });
  //       subscription?.on('update', () => {
  //         fetchNotifications();
  //       });
  //       subscription?.on('delete', () => {
  //         fetchNotifications();
  //       });
  //     };
  //
  //     if (user?.user?.objectId) {
  //       NotificationLiveQuery();
  //     }
  //
  //     return () => {
  //       if (subscription) subscription.unsubscribe();
  //     };
  //   }, [fetchNotifications, user?.user?.objectId]);

  const handleTabRoute = (path: string) => {
    if (pathname !== path) {
      router.push(path);
      window.scrollTo(0, 0);
    }

    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setOpenLogout(true);
    setIsMobileMenuOpen(false);
  };

  const renderMobileNavItems = () => (
    <>
      {navs.map((nav, index) => {
        if (
          [
            'Sales',
            'Products',
            'Game Zone',
            'Wallet',
            'QM Coins',
            'Admin Management',
            'Support',
          ].includes(nav?.name) &&
          !['SUPER_ADMIN', 'MANAGER'].includes(user?.role)
        ) {
          return null;
        }

        if (nav.isDropdown && nav.items) {
          return (
            <NavDropdown
              key={index}
              icon={nav.icon}
              title={nav.name}
              items={nav.items}
            />
          );
        }

        const isActive =
          pathname === nav.path || pathname.startsWith(nav.path + '/');
        return (
          <button
            key={index}
            onClick={() => handleTabRoute(`${nav.path}`)}
            className={`relative w-full cursor-pointer py-4 text-sm transition ${
              isActive
                ? 'bg-primary-500 rounded-[8px] font-semibold text-white'
                : 'text-primary-300 hover:text-white'
            }`}
          >
            <Flex
              align="center"
              gap="3"
              mx="4"
              className={`relative z-10 ${
                isActive ? 'font-semibold text-white' : 'text-primary-300'
              }`}
            >
              {nav.icon}
              <Text>{nav.name}</Text>
            </Flex>
          </button>
        );
      })}
    </>
  );

  // Render bottom navigation items for mobile menu
  const renderMobileBottomNavItems = () => (
    <>
      {bottomNav.map((nav, index) => {
        if (
          [
            'Sales',
            'Products',
            'Game Zone',
            'Wallet',
            'QM Coins',
            'Admin Management',
            'Support',
          ].includes(nav?.name) &&
          !['SUPER_ADMIN', 'MANAGER'].includes(user?.role)
        ) {
          return null;
        }

        const isActive = pathname === nav.path;
        const isLogout = nav.name === 'Logout';
        const buttonContent = (
          <Flex
            key={index.toString()}
            align="center"
            gap="3"
            mx="4"
            className={`relative z-10 ${
              isActive ? 'font-semibold text-white' : 'text-primary-300'
            } ${isLogout && 'text-white'}`}
          >
            {nav.icon}
            <Text>{nav.name}</Text>
          </Flex>
        );

        return isLogout ? (
          <button
            key={index.toString()}
            onClick={handleLogout}
            className="hover:bg-error-900 relative w-full cursor-pointer rounded-[8px] py-4 text-sm opacity-70 transition"
          >
            {buttonContent}
          </button>
        ) : (
          <button
            key={index}
            onClick={() => handleTabRoute(`${nav.path}`)}
            className={`relative w-full cursor-pointer py-4 text-sm transition ${
              isActive
                ? 'font-semibold text-white'
                : 'text-primary-300 hover:text-white'
            }`}
          >
            {buttonContent}
          </button>
        );
      })}
    </>
  );

  if (excludedPaths.includes(pathname)) return null;

  const getPageTitle = () => {
    if (pathname.includes('/view-game/') && currentGame?.name) {
      return currentGame.name;
    }

    if (pathname.includes('/edit-game/') && currentGame?.name) {
      return currentGame.name;
    }

    const lastSegment =
      pathname
        .split('/')
        .filter(Boolean)
        .pop()
        ?.replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase()) || '';

    return lastSegment;
  };

  const pageTitle = getPageTitle();

  const ProfileAndNotification = () => (
    <div className="flex items-center gap-3 lg:gap-6">
      {isDashboard && (
        <div className="flex items-center gap-2 rounded-lg px-3 py-2">
          <div className="bg-primary-100 rounded-full p-2">
            <BuildingIcon className="text-blue-800" />
          </div>
          <span className="text-sm font-semibold text-[#17478B]">
            Total DVA
          </span>
          <span className="text-primary-900 rounded-full border p-2 text-sm">
            12000
          </span>
        </div>
      )}

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
          <div className="border-primary-50 flex-none cursor-pointer rounded-full border bg-white p-1 lg:border-none lg:px-2 lg:py-1">
            <Flex align="center" gap="2">
              <Avatar
                src={user?.user?.avatar}
                fallback={user?.user?.firstName?.charAt(0).toUpperCase()}
                radius="full"
                className="bg-primary-50"
              />
              <p className="hidden font-medium capitalize text-[#1B212D] lg:flex">
                {user?.user?.firstName} {user?.user?.lastName}
              </p>
              <ArrowDownFillIcon className="hidden text-neutral-500 lg:flex" />
            </Flex>
          </div>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content className="DropdownMenuContent" sideOffset={5}>
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
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 backdrop-blur-[4px] lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="bg-primary-900 fixed left-0 top-0 z-50 h-full w-80 overflow-y-auto lg:hidden"
            >
              <div className="border-primary-800 flex items-center justify-between border-b p-4">
                <Image
                  src="/icons/quizmoney-logo-white.svg"
                  alt="Quiz Money"
                  width={86}
                  height={47.38}
                  priority
                  quality={100}
                />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-white focus:outline-none"
                  aria-label="Close menu"
                >
                  <HamburgerIcon isOpen={true} isWhite={true} />
                </button>
              </div>

              <Flex direction="column" px="2" className="flex-1 py-4">
                {renderMobileNavItems()}
              </Flex>

              <Flex
                direction="column"
                px="2"
                pb="4"
                gap="2"
                className="border-primary-800 mt-4 border-t pt-4"
              >
                {renderMobileBottomNavItems()}
              </Flex>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="pb-4">
        <div
          className={`flex w-full items-center justify-between pb-4 lg:hidden ${
            isMobileMenuOpen ? 'hidden' : 'flex'
          }`}
        >
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-700 focus:outline-none"
            aria-label="Toggle menu"
          >
            <HamburgerIcon isOpen={isMobileMenuOpen} />
          </button>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <div className="flex flex-1 justify-center">
                <Container className="border-primary-50 max-w-xs flex-1 cursor-pointer rounded-full border bg-white px-4 py-2">
                  <Flex
                    align="center"
                    justify="center"
                    gap="2"
                    className="w-full"
                  >
                    <Avatar
                      src={user?.user?.avatar}
                      fallback={user?.user?.firstName?.charAt(0).toUpperCase()}
                      radius="full"
                      className="bg-primary-50 h-8 w-8"
                    />
                    <p className="flex-1 text-center text-sm font-medium capitalize text-[#1B212D]">
                      {user?.user?.firstName}
                    </p>
                    <ArrowDownFillIcon className="h-4 w-4 text-neutral-500" />
                  </Flex>
                </Container>
              </div>
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

          <div className="flex items-center gap-2">
            <Link
              href="/notification"
              className="hover:text-primary-900 relative p-2 text-neutral-600"
            >
              <BellIcon />
              {unreadCount > 0 && (
                <div className="bg-primary-900 absolute -top-1 right-0 flex h-4 w-4 items-center justify-center rounded-full text-xs text-white">
                  {unreadCount}
                </div>
              )}
            </Link>
          </div>
        </div>

        <div className={`${isMobileMenuOpen ? 'flex' : 'block'} lg:block`}>
          <div
            className={`flex items-center justify-between ${
              isMobileMenuOpen ? 'lg:block' : ''
            }`}
          >
            <div className="flex-1">
              <Heading
                size={{ initial: '4', lg: '5' }}
                className="flex max-w-[200px] flex-wrap items-center justify-between gap-2 overflow-hidden text-ellipsis whitespace-nowrap capitalize sm:max-w-none md:hidden lg:flex"
              >
                <div className="flex flex-row items-center gap-2">
                  {((pathname.split('/').length > 2 &&
                    !pathname.includes('player-profile')) ||
                    pathname.includes('notification')) && (
                    <button
                      onClick={() => router?.back()}
                      className="cursor-pointer"
                    >
                      <CircleArrowLeft />
                    </button>
                  )}
                  {!pathname.includes('player-profile') && (
                    <span className="lg:flex">
                      {pageTitle === 'Home'
                        ? `Welcome, ${user?.user?.firstName} 👋`
                        : pageTitle}
                    </span>
                  )}
                  {pathname.includes('player-profile') && (
                    <span className="text-[#1B212D] lg:flex">User Profile</span>
                  )}
                </div>
              </Heading>
            </div>

            <div
              className={`${
                isMobileMenuOpen ? 'flex lg:hidden' : 'hidden lg:flex'
              }`}
            >
              <ProfileAndNotification />
            </div>
          </div>

          {pageTitle === 'Home' && (
            <Text className="mt-2 text-sm lg:text-base">
              Let&apos;s see what you&apos;ve got
            </Text>
          )}
        </div>

        <LogoutDialog open={openLogout} onOpenChange={setOpenLogout} />
      </div>
    </>
  );
}

export default AppHeader;
