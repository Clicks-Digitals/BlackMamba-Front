import { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[#EDEFF0]/70">{label}</label>}
      <textarea
        className={cn(
          "rounded-md border border-white/10 bg-white/4 px-3.5 py-2.5 text-sm text-[#EDEFF0]",
          "min-h-[100px] resize-none placeholder:text-white/35",
          "transition-colors duration-200 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20",
          error && "border-[#d12f27] focus:border-[#d12f27]",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs font-medium text-[#FF8A8E]">{error}</p>}
    </div>
  );
}

export { Textarea };
