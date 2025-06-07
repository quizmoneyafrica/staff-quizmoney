'use client';

import { XIcon } from 'lucide-react';
import * as React from 'react';
import { Drawer } from 'vaul';

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
  heightClass = 'h-auto md:min-h-[70%]',
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
          className={`fixed bottom-0 left-0 right-0 flex flex-col rounded-t-[10px] bg-white outline-none md:bg-transparent ${heightClass} max-h-[90dvh] md:left-1/2 
          md:top-1/2 md:max-h-screen md:max-w-xl md:translate-x-[-50%] 
          md:translate-y-[-50%] md:rounded-[10px] 
          ${!open ? 'md:translate-y-[70%]' : ''}`}
        >
          <div className="flex flex-1 flex-col overflow-hidden rounded-t-[10px] md:rounded-[10px] md:bg-white">
            {/* Scrollable content wrapper */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mx-auto mb-4 h-1.5 w-12 flex-shrink-0 rounded-full bg-gray-300 " />

              {title && (
                <Drawer.Title
                  className={`mb-4 flex-1 text-center text-lg font-semibold text-gray-900 ${
                    titleLeft ? 'text-left' : 'text-center md:text-left'
                  }`}
                >
                  {title}
                </Drawer.Title>
              )}
              <Drawer.Close asChild>
                <button className="absolute right-6 top-7 hidden h-10 w-10 place-items-center rounded-full hover:bg-neutral-50 md:grid">
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
