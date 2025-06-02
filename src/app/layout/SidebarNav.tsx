"use client";
import { Flex, Text } from "@radix-ui/themes";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { bottomNav, navs } from "./nav";
import { AnimatePresence, motion } from "framer-motion";
import LogoutDialog from "../components/logout/logout";
import { useState } from "react";

function SidebarNav() {
  const router = useRouter();
  const pathname = usePathname();
  // const splitName = pathname.split("/");

  const [openLogout, setOpenLogout] = useState(false);

  const handleTabRoute = (path: string) => {
    console.log(path);
    if (pathname !== path) {
      router.push(path);
      window.scrollTo(0, 0);
    }
  };
  return (
    <>
      <motion.div
        layout
        className="hidden lg:inline-block relative w-full h-screen overflow-y-auto bg-primary-900"
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
            // const isActive = splitName.includes(nav.name.toLowerCase());
            const isActive =
              pathname === nav.path || pathname.startsWith(nav.path + "/");
            return (
              <motion.button
                layout
                key={index}
                onClick={() => handleTabRoute(`${nav.path}`)}
                // className={`relative cursor-pointer transition text-sm py-4 ${
                //   isActive ? "text-white font-semibold" : "text-primary-300"
                // }`}
                className={`relative cursor-pointer transition text-sm py-4 ${
                  isActive
                    ? "text-white font-semibold bg-primary-500 rounded-[8px]"
                    : "text-primary-300"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active-indicator"
                    className="absolute inset-0 bg-primary-500 rounded-[8px] z-0"
                    transition={{
                      type: "spring",
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
                    isActive ? "text-white font-semibold" : "text-primary-300"
                  }`}
                >
                  {nav.icon}
                  <Text>{nav.name}</Text>
                </Flex>
              </motion.button>
            );
          })}
        </Flex>
        {/* Bottom  */}
        <Flex
          direction="column"
          px="2"
          pb="4"
          gap="2"
          className="relative pt-4 mt-4 border-t border-primary-800 w-full"
        >
          {bottomNav.map((nav, index) => {
            const isActive = pathname === nav.path;
            const isLogout = nav.name === "Logout";
            const buttonContent = (
              <Flex
                key={index.toString()}
                align="center"
                gap="3"
                mx="4"
                className={`relative z-10 ${
                  isActive ? "text-white font-semibold" : "text-primary-300"
                } ${isLogout && "text-white"}`}
              >
                {nav.icon}
                <Text>{nav.name}</Text>
              </Flex>
            );
            return isLogout ? (
              <button
                key={index.toString()}
                onClick={() => setOpenLogout(true)}
                className="relative  hover:bg-error-900 opacity-70 rounded-[8px] cursor-pointer transition text-sm py-4"
              >
                {buttonContent}
              </button>
            ) : (
              <button
                key={index}
                onClick={() => handleTabRoute(`${nav.path}`)}
                className={`relative cursor-pointer transition text-sm py-4 ${
                  isActive ? "text-white font-semibold" : "text-primary-300"
                }`}
              >
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-indicator"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-primary-500 rounded-[8px] z-0"
                      transition={{
                        type: "spring",
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
