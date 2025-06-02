"use client";
import React from "react";
import { Flex, Grid, Text } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { navs } from "./nav";

function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const handleTabRoute = (path: string) => {
    if (!pathname.startsWith(path)) {
      router.push(path);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <div className="lg:hidden fixed z-50 bottom-0 pb-6 left-0 w-full bg-primary-900 py-4 flex items-center">
      <div className="w-full">
        <Grid columns="5" align="center" justify="between">
          {navs.map((nav, index) => {
            const isActive =
              pathname === nav.path || pathname.startsWith(nav.path + "/");

            return (
              <div key={index}>
                <Flex
                  direction="column"
                  gap="1"
                  align="center"
                  className={`cursor-pointer transition text-xs relative ${
                    isActive
                      ? "text-[#00D4FC] font-semibold"
                      : "text-neutral-400"
                  }`}
                  onClick={() => handleTabRoute(`${nav.path}`)}
                >
                  {nav.icon}
                  <Text>{nav.name}</Text>

                  {isActive && (
                    <motion.div
                      layoutId="nav-active-indicator"
                      className="absolute -top-4 w-full h-1 bg-[#00D4FC] rounded-lg"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </Flex>
              </div>
            );
          })}
        </Grid>
      </div>
    </div>
  );
}

export default BottomNavigation;
