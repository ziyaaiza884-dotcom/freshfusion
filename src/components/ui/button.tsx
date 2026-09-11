import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary-strong hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-6px_var(--glow)]",
        accent:
          "bg-accent text-accent-foreground shadow-sm hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-6px_color-mix(in_srgb,var(--accent)_55%,transparent)]",
        outline:
          "border border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/70",
        ghost: "text-foreground hover:bg-surface-muted",
        subtle: "bg-surface-muted text-foreground hover:bg-border/70",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export interface ButtonLinkProps
  extends React.ComponentProps<typeof Link>,
    VariantProps<typeof buttonVariants> {}

export function ButtonLink({
  className,
  variant,
  size,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
