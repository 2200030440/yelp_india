import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-500",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-red-600 text-white shadow-sm",
        secondary:
          "border border-transparent bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
        outline: "border border-zinc-200 text-zinc-700 bg-white",
        success:
          "border border-emerald-200 bg-emerald-50 text-emerald-700",
        warning:
          "border border-amber-200 bg-amber-50 text-amber-700",
        destructive:
          "border border-red-200 bg-red-50 text-red-700",
        brand:
          "border border-red-200 bg-red-50 text-red-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
