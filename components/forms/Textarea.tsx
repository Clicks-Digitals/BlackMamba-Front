import { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
      )}
      <textarea
        className={cn(
          "min-h-[100px] resize-none rounded-md border border-border bg-muted/40 px-3.5 py-2.5 text-sm text-foreground",
          "placeholder:text-muted-foreground",
          "transition-colors duration-200 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20",
          error && "border-destructive focus:border-destructive",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

export { Textarea };
