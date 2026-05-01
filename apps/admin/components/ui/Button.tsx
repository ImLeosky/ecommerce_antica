import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'danger'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"
    
    const variants = {
      default: "bg-(--accent-gold) text-white hover:bg-(--accent-gold-hover) shadow-sm",
      outline: "border border-(--card-border) hover:bg-(--background) dark:border-gray-700 dark:hover:bg-gray-800 text-(--foreground)",
      ghost: "hover:bg-(--background) hover:text-(--foreground) text-(--foreground)/70",
      danger: "bg-red-600 text-white hover:bg-red-500 shadow-sm"
    }

    return (
      <button
        className={`${baseStyles} ${variants[variant]} h-10 py-2 px-4 ${className || ''}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
