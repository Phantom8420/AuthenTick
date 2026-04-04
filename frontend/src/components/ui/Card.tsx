import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverEffect = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden",
          hoverEffect && "transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-slate-700 hover:shadow-electric-blue/10",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";
