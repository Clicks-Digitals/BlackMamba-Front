"use client";

import { Checkbox as CheckboxPrimitive } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive> {
  label?: string;
  error?: string;
  name?: string;
}

function Checkbox({ label, error, name, className, ...props }: CheckboxProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="group flex cursor-pointer items-center gap-2.5">
        <CheckboxPrimitive
          id={name}
          name={name}
          className={cn(
            "transition-all duration-200 hover:border-[#9e1d20]",
            error && "border-red-500 data-checked:bg-red-500",
            className
          )}
          {...props}
        />
        {label && (
          <label
            htmlFor={name}
            className="cursor-pointer text-sm font-medium text-[#EDEFF0]/70 transition-colors select-none group-hover:text-[#EDEFF0]"
          >
            {label}
          </label>
        )}
      </div>
      {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

export { Checkbox };
