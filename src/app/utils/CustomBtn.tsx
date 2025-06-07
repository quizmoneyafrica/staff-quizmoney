'use client';

import * as React from 'react';
import { Spinner } from '@radix-ui/themes';
import { cn } from './utils';

type ButtonProps = {
  children?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  width?: 'full' | 'medium' | 'inline';
  loader?: boolean;
};

const variantClasses = {
  primary: 'bg-primary-900 text-white hover:bg-primary-900',
  secondary: 'bg-primary-500 text-white hover:bg-primary-600',
  outline: 'border border-neutral-300 text-black hover:bg-neutral-100',
};

const sizeClasses = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2',
  lg: 'text-base px-5 py-4',
};
const widthClasses = {
  full: 'w-full',
  medium: 'w-[50%]',
  inline: '',
};

export default function CustomButton({
  children,
  type = 'button',
  variant = 'primary',
  size = 'lg',
  className = '',
  disabled = false,
  onClick,
  width = 'inline',
  loader,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'disabled:bg-primary-230 cursor-pointer rounded-full font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:text-neutral-50',
        `${loader && 'flex items-center justify-center'}`,
        variantClasses[variant],
        sizeClasses[size],
        widthClasses[width],
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      {loader && <Spinner />}
      {children}
    </button>
  );
}
