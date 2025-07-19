'use client';

import * as React from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Calendar } from '@/app/components/ui/calendar';
import { Label } from '@/app/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import { cn } from '@/app/lib/utils';

export function DatePicker({ label, value, onChange, className = '' }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col">
      <Label
        htmlFor="date"
        className="block text-sm font-medium text-neutral-800"
      >
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className={cn(
              'caret-primary-500 focus:ring-primary-500 focus:border-primary-500 h-full w-full min-w-0 appearance-none justify-between rounded-[6px] border border-neutral-300 px-4 py-3 pr-12 text-base font-normal  focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-neutral-100',
              className,
            )}
          >
            {value ? value.toLocaleDateString() : 'Select date'}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            captionLayout="dropdown"
            onSelect={(date) => {
              onChange(date);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
