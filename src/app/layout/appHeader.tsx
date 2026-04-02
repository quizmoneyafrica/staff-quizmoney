'use client';

import { Flex, Heading, Text } from '@radix-ui/themes';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { X, Bell, LogOut, Settings, ChevronDown } from 'lucide-react';
import { DropdownMenu } from 'radix-ui';
import { navs } from './nav';
import LogoutDialog from '../components/logout/logout';
import { CircleArrowLeft } from '../icons/icons';
import { useAuthStore } from '../lib/auth-store';
import { hasPermission, ROLE_LABELS } from '../lib/permissions';
import { Button } from '../components/ui/button';

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
        className={`block h-0.5 w-6 rounded-sm ${colorClass} transition-all duration-300 ${
          isOpen ? 'translate-y-1 rotate-45' : '-translate-y-0.5'
        }`}
      />
      <span
        className={`my-0.5 block h-0.5 w-6 rounded-sm ${colorClass} transition-all duration-300 ${
          isOpen ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <span
        className={`block h-0.5 w-6 rounded-sm ${colorClass} transition-all duration-300 ${
          isOpen ? '-translate-y-1 -rotate-45' : 'translate-y-0.5'
        }`}
      />
    </div>
  );
};

function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [openLogout, setOpenLogout] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const user = useAuthStore((s) => s.user);

  const getPageTitle = () => {
    if (pathname === '/dashboard') return `Welcome, ${user?.username} 👋`;
    return (
      pathname
        .split('/')
        .filter(Boolean)
        .pop()
        ?.replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()) || ''
    );
  };

  const pageTitle = getPageTitle();
  const showBackButton =
    pathname.split('/').filter(Boolean).length > 1 &&
    !pathname.includes('player-profile');

  const visibleNavs = navs.filter((nav) => {
    if (!user) return false;
    const permissionMap: Record<string, string> = {
      '/dashboard': 'dashboard.basic',
      '/game-zone': 'games.read',
      '/players': 'players.read',
      '/withdrawal-request': 'withdrawals.read',
      '/sales': 'sales.read',
      '/qm-coins': 'qmcoins.read',
      '/push-notification': 'push.write',
      '/admin-management': 'admins.read',
      '/platform-settings': 'settings.read',
    };
    const permission = permissionMap[nav.path];
    if (!permission) return true;
    return hasPermission(user.role, permission);
  });

  const handleTabRoute = (path: string) => {
    router.push(path);
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="backdrop-blur-xs fixed inset-0 z-40 lg:hidden"
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
                  height={47}
                  priority
                />
                <Button
                  variant="ghost"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white"
                >
                  <X size={20} />
                </Button>
              </div>

              <Flex direction="column" px="2" className="flex-1 py-4">
                {visibleNavs.map((nav, index) => {
                  const isActive =
                    pathname === nav.path ||
                    pathname.startsWith(nav.path + '/');
                  return (
                    <button
                      key={index}
                      onClick={() => handleTabRoute(nav.path)}
                      className={`relative w-full cursor-pointer rounded-sm py-4 text-sm transition ${
                        isActive
                          ? 'bg-primary-500 font-semibold text-white'
                          : 'text-primary-300 hover:text-white'
                      }`}
                    >
                      <Flex align="center" mx="4" className="gap-4 px-4">
                        {nav.icon}
                        <Text>{nav.name}</Text>
                      </Flex>
                    </button>
                  );
                })}
              </Flex>

              <Flex
                direction="column"
                px="2"
                pb="4"
                gap="2"
                className="border-primary-800 mt-4 border-t pt-4"
              >
                <button
                  onClick={() => {
                    setOpenLogout(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="hover:bg-error-900 relative w-full cursor-pointer rounded-xl py-4 text-sm opacity-70 transition"
                >
                  <Flex align="center" mx="4" className="gap-4 px-4 text-white">
                    <LogOut size={18} />
                    <Text>Logout</Text>
                  </Flex>
                </button>
              </Flex>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="pb-4">
        {/* Mobile top bar */}
        <div
          className={`flex w-full items-center justify-between pb-4 lg:hidden ${
            isMobileMenuOpen ? 'hidden' : 'flex'
          }`}
        >
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-700"
          >
            <HamburgerIcon isOpen={isMobileMenuOpen} />
          </button>

          <div className="flex items-center gap-2">
            <Bell size={20} className="text-neutral-600" />
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <div className="border-primary-50 flex cursor-pointer items-center gap-2 rounded-full border bg-white px-3 py-1">
                  <div className="bg-linear-to-br flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full from-blue-400 to-blue-600 text-xs font-bold text-white">
                    {(user?.username?.[0] ?? '?').toUpperCase()}
                  </div>
                  <ChevronDown size={14} className="text-neutral-500" />
                </div>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="DropdownMenuContent"
                  sideOffset={5}
                >
                  <DropdownMenu.Item
                    className="DropdownMenuItem"
                    onClick={() => router.push('/settings')}
                  >
                    Settings{' '}
                    <span className="RightSlot">
                      <Settings size={16} />
                    </span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="DropdownMenuItem hover:bg-error-900!"
                    onSelect={() => setOpenLogout(true)}
                  >
                    Logout{' '}
                    <span className="RightSlot">
                      <LogOut size={16} />
                    </span>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden items-center justify-between lg:flex">
          <div className="flex items-center gap-2">
            {showBackButton && (
              <button onClick={() => router.back()} className="cursor-pointer">
                <CircleArrowLeft />
              </button>
            )}
            <Heading size="5" className="capitalize">
              {pathname.includes('player-profile') ? 'User Profile' : pageTitle}
            </Heading>
          </div>

          <div className="flex items-center gap-4">
            <Bell size={20} className="cursor-pointer text-neutral-600" />

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <div className="border-primary-50 flex cursor-pointer items-center gap-2 rounded-full border bg-white px-3 py-2">
                  <div className="bg-primary-50 flex h-10 w-10 items-center justify-center rounded-full">
                    <div className="bg-linear-to-br flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full from-blue-400 to-blue-600 text-xs font-bold text-white">
                      {(user?.username?.[0] ?? '?').toUpperCase()}
                    </div>
                  </div>
                  <div className="hidden flex-col lg:flex">
                    <p className="text-sm font-medium capitalize text-[#1B212D]">
                      {user?.username}
                    </p>
                    <p className="text-primary-700 text-xs">
                      {user ? ROLE_LABELS[user.role] : ''}
                    </p>
                  </div>
                  <ChevronDown size={14} className="text-neutral-500" />
                </div>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="DropdownMenuContent"
                  sideOffset={5}
                >
                  <DropdownMenu.Item
                    className="DropdownMenuItem"
                    onClick={() => router.push('/settings')}
                  >
                    Settings{' '}
                    <span className="RightSlot">
                      <Settings size={16} />
                    </span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="DropdownMenuItem hover:bg-error-900!"
                    onSelect={() => setOpenLogout(true)}
                  >
                    Logout{' '}
                    <span className="RightSlot">
                      <LogOut size={16} />
                    </span>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>

        {pathname === '/dashboard' && (
          <Text className="mt-1 text-sm text-neutral-500">
            Let&apos;s see what&apos;s happening today
          </Text>
        )}
      </div>

      <LogoutDialog open={openLogout} onOpenChange={setOpenLogout} />
    </>
  );
}

export default AppHeader;
