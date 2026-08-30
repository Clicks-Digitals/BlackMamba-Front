"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
}

function PasswordInput({ className, label, error, icon: Icon, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[#EDEFF0]/70">{label}</label>}
      <div className="relative w-full">
        {Icon && (
          <Icon className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
        )}
        <input
          type={showPassword ? "text" : "password"}
          className={cn(
            "w-full rounded-md border border-white/10 bg-white/4 px-3.5 py-2.5 pe-12 text-sm text-[#EDEFF0]",
            "placeholder:text-white/35",
            "transition-colors duration-200 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20",
            Icon && "ps-11",
            error && "border-[#d12f27] focus:border-[#d12f27]",
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute top-1/2 end-4 -translate-y-1/2 cursor-pointer text-white/35 transition-colors hover:text-[#EDEFF0] focus:outline-none"
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs font-medium text-[#FF8A8E]">{error}</p>}
    </div>
  );
}

export { PasswordInput };
