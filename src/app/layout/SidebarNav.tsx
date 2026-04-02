'use client';

import { Flex, Text } from '@radix-ui/themes';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { bottomNav, navs } from './nav';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { X } from 'lucide-react';
import LogoutDialog from '../components/logout/logout';
import { useAuthStore } from '../lib/auth-store';
import { hasPermission } from '../lib/permissions';
import { Button } from '../components/ui/button';

function SidebarNav({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isOpen,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [openLogout, setOpenLogout] = useState(false);
  const user = useAuthStore((s) => s.user);

  const handleTabRoute = (path: string) => {
    if (pathname !== path) {
      router.push(path);
      window.scrollTo(0, 0);
      if (onClose) onClose();
    }
  };

  // Filter navs based on role permissions
  const visibleNavs = navs.filter((nav) => {
    if (!user) return false;
    const permissionMap: Record<string, string> = {
      '/dashboard': 'dashboard.basic',
      '/game-zone': 'games.read',
      '/players': 'players.read',
      '/withdrawal-request': 'withdrawals.read',
      '/sales': 'sales.read',
      '/qm-coins': 'qmcoins.read',
      '/leaderboard': 'leaderboard.read',
      '/referral-management': 'referrals.read',
      '/push-notification': 'push.write',
      '/admin-management': 'admins.read',
      '/platform-settings': 'settings.read',
    };
    const permission = permissionMap[nav.path];
    if (!permission) return true;
    return hasPermission(user.role, permission);
  });

  return (
    <>
      <motion.div
        layout
        className="bg-primary-900 relative hidden h-screen w-full overflow-y-auto lg:inline-block"
      >
        <div className="absolute right-4 top-4 z-20 lg:hidden">
          <Button variant="ghost" onClick={onClose}>
            <X size={24} />
          </Button>
        </div>

        <div className="grid place-items-center py-4">
          <Image
            src="/icons/quizmoney-logo-white.svg"
            alt="Quiz Money"
            width={86}
            height={47.38}
            priority
            quality={100}
          />
        </div>

        <Flex direction="column" px="2" className="relative flex-1">
          {visibleNavs.map((nav, index) => {
            const isActive =
              pathname === nav.path || pathname.startsWith(nav.path + '/');
            return (
              <motion.button
                layout
                key={index}
                onClick={() => handleTabRoute(nav.path)}
                className={`relative w-full cursor-pointer py-4 text-sm transition ${
                  isActive
                    ? 'bg-primary-500 rounded-sm font-semibold text-white'
                    : 'text-primary-300 hover:bg-primary-800 rounded-xl'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active-indicator"
                    className="bg-primary-500 absolute inset-0 z-0 rounded-xl"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Flex
                  align="center"
                  mx="4"
                  className={`relative z-10 gap-4 px-4 ${
                    isActive ? 'font-semibold text-white' : 'text-primary-300'
                  }`}
                >
                  {nav.icon}
                  <Text>{nav.name}</Text>
                </Flex>
              </motion.button>
            );
          })}
        </Flex>

        <Flex
          direction="column"
          px="2"
          pb="4"
          gap="2"
          className="border-primary-800 relative mt-4 w-full border-t pt-4"
        >
          {bottomNav.map((nav, index) => {
            const isLogout = nav.name === 'Logout';
            const isActive = nav.path && pathname === nav.path;

            return isLogout ? (
              <button
                key={index}
                onClick={() => setOpenLogout(true)}
                className="hover:bg-error-900 relative cursor-pointer rounded-xl py-4 text-sm opacity-70 transition"
              >
                <Flex align="center" mx="4" className="gap-4 px-4 text-white">
                  {nav.icon}
                  <Text>{nav.name}</Text>
                </Flex>
              </button>
            ) : (
              <button
                key={index}
                onClick={() => nav.path && handleTabRoute(nav.path)}
                className={`relative cursor-pointer py-4 text-sm transition ${
                  isActive ? 'font-semibold text-white' : 'text-primary-300'
                }`}
              >
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-indicator"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-primary-500 absolute inset-0 z-0 rounded-xl"
                    />
                  )}
                </AnimatePresence>
                <Flex
                  align="center"
                  mx="4"
                  className={`relative z-10 gap-4 px-4 ${
                    isActive ? 'font-semibold text-white' : 'text-primary-300'
                  }`}
                >
                  {nav.icon}
                  <Text>{nav.name}</Text>
                </Flex>
              </button>
            );
          })}
        </Flex>
      </motion.div>

      <LogoutDialog open={openLogout} onOpenChange={setOpenLogout} />
    </>
  );
}

export default SidebarNav;
