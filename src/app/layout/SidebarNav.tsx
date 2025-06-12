'use client';
import { Flex, Text } from '@radix-ui/themes';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { bottomNav, navs } from './nav';
import { AnimatePresence, motion } from 'framer-motion';
import LogoutDialog from '../components/logout/logout';
import { useState } from 'react';

function SidebarNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [openLogout, setOpenLogout] = useState(false);

  const handleTabRoute = (path: string) => {
    if (pathname !== path) {
      router.push(path);
      window.scrollTo(0, 0);
    }
  };

  return (
    <>
      <motion.div
        layout
        className="bg-primary-900 relative hidden h-screen w-full overflow-y-auto lg:inline-block"
      >
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
          {navs.map((nav, index) => {
            const isActive =
              pathname === nav.path || pathname.startsWith(nav.path + '/');
            return (
              <motion.button
                layout
                key={index}
                onClick={() => handleTabRoute(`${nav.path}`)}
                className={`relative cursor-pointer py-4 text-sm transition ${
                  isActive
                    ? 'bg-primary-500 rounded-[8px] font-semibold text-white'
                    : 'text-primary-300'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active-indicator"
                    className="bg-primary-500 absolute inset-0 z-0 rounded-[8px]"
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}

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
                onClick={() => setOpenLogout(true)}
                className="hover:bg-error-900  relative cursor-pointer rounded-[8px] py-4 text-sm opacity-70 transition"
              >
                {buttonContent}
              </button>
            ) : (
              <button
                key={index}
                onClick={() => handleTabRoute(`${nav.path}`)}
                className={`relative cursor-pointer py-4 text-sm transition ${
                  isActive ? 'font-semibold text-white' : 'text-primary-300'
                }`}
              >
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-indicator"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-primary-500 absolute inset-0 z-0 rounded-[8px]"
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 20,
                      }}
                    />
                  )}
                </AnimatePresence>
                {buttonContent}
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
