'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Flex, Text } from '@radix-ui/themes';
import { usePathname, useRouter } from 'next/navigation';
import { navs } from '@/app/layout/nav';

interface NavDropdownProps {
  icon: React.ReactNode;
  title: string;
  items: Array<(typeof navs)[number]>;
}

export function NavDropdown({ icon, title, items }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isActive = items.some(
    (item) => pathname === item.path || pathname.startsWith(item.path + '/'),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (path: string) => {
    router.push(path);
    window.scrollTo(0, 0);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-4 text-sm transition ${
          isActive || isOpen
            ? 'bg-primary-500 rounded-[8px] font-semibold text-white'
            : 'text-primary-300 hover:bg-primary-800 rounded-[8px]'
        }`}
      >
        <Flex align="center" justify="between" className="w-full">
          <Flex align="center" gap="3">
            <span
              className={isActive || isOpen ? 'text-white' : 'text-primary-300'}
            >
              {icon}
            </span>
            <Text
              className={isActive || isOpen ? 'text-white' : 'text-primary-300'}
            >
              {title}
            </Text>
          </Flex>
          {isOpen ? (
            <ChevronUp className="text-primary-300 h-4 w-4" />
          ) : (
            <ChevronDown className="text-primary-300 h-4 w-4" />
          )}
        </Flex>
      </button>

      {isOpen && (
        <div className="mt-1 w-full space-y-1 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
          {items.map((item) => {
            const isItemActive =
              pathname === item.path || pathname.startsWith(item.path + '/');
            return (
              <button
                key={item.path}
                onClick={() => handleItemClick(item.path!)}
                className={`flex w-full items-center gap-3 px-6 py-3 text-left text-sm transition ${
                  isItemActive
                    ? 'bg-[#F0F7FF] text-[#2A5EE8]'
                    : 'text-[#5D5D5D] hover:bg-gray-50'
                }`}
              >
                {item.icon && (
                  <span
                    className={
                      isItemActive ? 'text-[#2A5EE8]' : 'text-primary-500'
                    }
                  >
                    {item.icon}
                  </span>
                )}
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
