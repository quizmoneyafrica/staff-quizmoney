"use client";

import React from "react";
import { cn } from "./utils";

type Option = {
  label: string;
  value: string;
};

type CustomSelectProps = {
  label?: string;
  name?: string;
  value?: string;
  options: Option[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
  disabledOption: string;
  readOnly?: boolean;
};

export default function CustomSelect({
  label,
  name,
  value,
  options,
  onChange,
  className,
  disabled = false,
  required = false,
  icon,
  disabledOption = "Select an option",
  readOnly = false,
}: CustomSelectProps) {
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
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled || readOnly}
          required={required}
          aria-readonly={readOnly}
          className={cn(
            "w-full appearance-none rounded-[6px] caret-primary-500 border border-neutral-300 px-4 py-3 pr-12 text-base focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-100  disabled:cursor-not-allowed",
            readOnly && "cursor-not-allowed",
            className
          )}
        >
          <option value="" disabled>
            {disabledOption}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {icon && (
          <div className="absolute z-10 inset-y-0 right-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
