import { InputHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
}

function Input({ label, error, icon: Icon, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[#EDEFF0]/70">{label}</label>}
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
        )}
        <input
          className={cn(
            "w-full rounded-md border border-white/10 bg-white/4 px-3.5 py-2.5 text-sm text-[#EDEFF0]",
            "placeholder:text-white/35",
            "transition-colors duration-200 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20",
            Icon && "ps-11",
            error && "border-[#d12f27] focus:border-[#d12f27]",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs font-medium text-[#FF8A8E]">{error}</p>}
    </div>
  );
}

export { Input };
