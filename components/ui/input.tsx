import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ElementType;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon: Icon, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border bg-white px-4 py-2.5 text-sm transition-all focus-within:ring-2",
            error
              ? "border-red-300 focus-within:ring-red-200"
              : "border-zinc-200 focus-within:border-zinc-400 focus-within:ring-zinc-100",
          )}
        >
          {Icon && <Icon className="h-4 w-4 shrink-0 text-zinc-400" />}
          <input
            type={type}
            className={cn(
              "flex-1 text-sm text-zinc-900 placeholder-zinc-400 outline-none bg-transparent disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs font-medium text-red-600">{error}</p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
