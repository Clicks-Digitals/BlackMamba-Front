import * as React from "react";
import { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  beforeIcon?: LucideIcon;
  afterIcon?: LucideIcon;
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type, beforeIcon: BeforeIcon, afterIcon: AfterIcon, label: Label, ...props },
  ref
) {
  return (
    <div className={cn("w-full", className)}>
      {Label && <h1 className="text-text-muted-foreground pb-2">{Label}</h1>}
      <div className="relative">
        {BeforeIcon && (
          <div className="text-muted-foreground absolute top-1/2 left-[13px] -translate-y-1/2">
            <BeforeIcon size={20} />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          data-slot="input"
          className={cn(
            "border-muted-foreground input_shadow selection:bg-primary-500 selection:text-primary-25 placeholder:text-muted-foreground w-full min-w-0 border bg-transparent shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            "h-11 rounded-md py-2.5 text-sm leading-6 tracking-[0px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            BeforeIcon ? "pl-[42px]" : "pl-5",
            AfterIcon ? "pr-12" : "pr-5",
            className
          )}
          {...props}
        />
        {AfterIcon && (
          <div className="text-muted-foreground absolute top-1/2 right-[13px] -translate-y-1/2">
            <AfterIcon size={20} />
          </div>
        )}
      </div>
    </div>
  );
});

export { Input };
