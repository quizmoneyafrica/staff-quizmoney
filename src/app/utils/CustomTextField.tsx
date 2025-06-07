'use client';

import React from 'react';
import { cn } from './utils';

type CustomTextFieldProps = {
  label?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
  autoComplete?: string;
  readOnly?: boolean;
};

export default function CustomTextField({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  className,
  disabled = false,
  required = false,
  icon,
  autoComplete = 'off',
  readOnly = false,
}: CustomTextFieldProps) {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-neutral-800"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled || readOnly}
          required={required}
          autoComplete={autoComplete}
          readOnly={readOnly}
          className={cn(
            'caret-primary-500 focus:ring-primary-500 focus:border-primary-500 w-full min-w-0 appearance-none rounded-[6px] border border-neutral-300 px-4 py-3 pr-12 text-base focus:outline-none focus:ring-1 disabled:cursor-not-allowed  disabled:bg-neutral-100',
            className,
          )}
        />

        {icon && (
          <div className="absolute inset-y-0 right-3 z-10 flex cursor-pointer items-center ">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
