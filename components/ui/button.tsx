import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-full cursor-pointer transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] motion-reduce:active:scale-100";

    const variants = {
      primary: "bg-primary text-background hover:bg-primary-hover hover:shadow-sm",
      secondary: "bg-surface text-text hover:bg-border",
      accent: "bg-accent text-background hover:bg-accent-hover hover:shadow-sm",
      ghost: "text-text hover:bg-surface active:bg-border",
      outline: "border border-primary text-primary hover:bg-primary hover:text-background",
      danger: "bg-rose-700 text-white hover:bg-rose-800",
    };

    const sizes = {
      sm: "px-4 py-1.5 text-xs",
      md: "px-6 py-2.5 text-sm",
      lg: "px-8 py-3.5 text-base",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
