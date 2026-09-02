import { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange"> {
  label?: string;
  error?: string;
  placeholder?: string;
  options: readonly { readonly label: string; readonly value: string }[];
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string | null) => void;
}

function Select({
  label,
  error,
  className,
  options,
  name,
  value,
  placeholder,
  defaultValue,
  onValueChange,
}: SelectProps) {
  // Radix only injects a blank <option> when value is undefined; defaultValue/value ""
  // skips that and the native select can submit the first listed option instead of empty.
  const radixValue = value === "" ? undefined : value;
  const radixDefaultValue = defaultValue === "" ? undefined : defaultValue;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
      )}
      <ShadcnSelect
        name={name}
        value={radixValue}
        defaultValue={radixDefaultValue}
        onValueChange={onValueChange}
      >
        <SelectTrigger
          className={cn(
            "h-11 w-full rounded-md border border-border bg-muted/40 px-3.5 py-2.5 text-sm text-foreground",
            "transition-colors duration-200 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:outline-none",
            "data-placeholder:text-muted-foreground",
            error && "border-destructive focus:border-destructive",
            className
          )}
        >
          <SelectValue placeholder={placeholder || "Select an option"} />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-border bg-popover text-popover-foreground shadow-lg">
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="cursor-pointer py-2.5 focus:bg-primary/15 focus:text-foreground"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </ShadcnSelect>
      {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

export { Select };
