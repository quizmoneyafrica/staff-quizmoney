'use client';

import { Toaster as Sonner } from 'sonner';
import type { ComponentProps } from 'react';

type ToasterProps = ComponentProps<typeof Sonner> & {
  appearance?: 'light' | 'dark' | 'system';
};

const Toaster = ({ appearance = 'light', ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={appearance}
      className="toaster group"
      toastOptions={{
        classNames: {
          icon: [
            'text-primary-500 ',
            'group-data-[type=success]:!text-positive-700',
            'group-data-[type=error]:!text-error-600',
            'group-data-[type=info]:!text-primary-500',
          ].join(' '),
          toast: [
            'group toast group-[.toaster]:shadow-lg group-[.toaster]:border',
            'group-[.toaster]:text-foreground',
            'group-[.toaster]:bg-background',

            // ✅ Success
            'data-[type=success]:!bg-positive-50 data-[type=success]:!border-positive-200',

            // ✅ Error
            'data-[type=error]:!bg-error-50 data-[type=error]:!border-error-200',

            // ✅ Info
            'data-[type=info]:!bg-primary-50 data-[type=info]:!border-primary-200',

            // ✅ Default
            'data-[type=default]:bg-primary-50 data-[type=default]:border-primary-200',
          ].join(' '),
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:!bg-primary-500 group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
