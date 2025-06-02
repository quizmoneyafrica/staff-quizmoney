"use client";

import React from "react";
import { cn } from "./utils";

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
  type = "text",
  placeholder,
  value,
  onChange,
  className,
  disabled = false,
  required = false,
  icon,
  autoComplete = "off",
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
            "appearance-none min-w-0 w-full rounded-[6px] caret-primary-500 border border-neutral-300 px-4 py-3 pr-12 text-base focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-100  disabled:cursor-not-allowed",
            className
          )}
        />

        {icon && (
          <div className="absolute z-10 inset-y-0 right-3 flex items-center cursor-pointer ">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
