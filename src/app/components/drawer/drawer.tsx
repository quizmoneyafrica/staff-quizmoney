"use client";

import { XIcon } from "lucide-react";
import * as React from "react";
import { Drawer } from "vaul";

type VaulDrawerProps = {
  trigger?: React.ReactNode;
  children: React.ReactNode;
  title?: string;
  titleLeft?: boolean;
  heightClass?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function QmDrawer({
  trigger,
  children,
  title,
  heightClass = "h-auto md:min-h-[70%]",
  open,
  onOpenChange,
  titleLeft = false,
}: VaulDrawerProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content
          aria-describedby="Drawer Content"
          // className={`bg-white md:bg-transparent flex flex-col md: rounded-t-[10px] mt-24 fixed bottom-0 left-0 right-0 outline-none ${heightClass} max-h-[90dvh] md:max-h-screen md:top-1/2 md:bottom-auto md:translate-y-[-70%] md:rounded-[10px] md:max-w-xl md:mx-auto ${
          //   !open ? "md:translate-y-[100%]" : ""
          // }`}
          className={`bg-white md:bg-transparent flex flex-col rounded-t-[10px] fixed bottom-0 left-0 right-0 outline-none ${heightClass} max-h-[90dvh] md:max-h-screen 
          md:top-1/2 md:left-1/2 md:translate-x-[-50%] md:translate-y-[-50%] 
          md:rounded-[10px] md:max-w-xl 
          ${!open ? "md:translate-y-[70%]" : ""}`}
        >
          <div className="md:bg-white rounded-t-[10px] md:rounded-[10px] flex-1 flex flex-col overflow-hidden">
            {/* Scrollable content wrapper */}
            <div className="p-4 overflow-y-auto flex-1">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-4 " />

              {title && (
                <Drawer.Title
                  className={`flex-1 text-center text-lg font-semibold mb-4 text-gray-900 ${
                    titleLeft ? "text-left" : "text-center md:text-left"
                  }`}
                >
                  {title}
                </Drawer.Title>
              )}
              <Drawer.Close asChild>
                <button className="absolute top-7 right-6 h-10 w-10 hidden hover:bg-neutral-50 md:grid place-items-center rounded-full">
                  <XIcon />
                </button>
              </Drawer.Close>

              <div className="pb-6">{children}</div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
