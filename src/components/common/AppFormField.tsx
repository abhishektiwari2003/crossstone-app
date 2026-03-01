"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface AppFormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
    error?: string
    icon?: React.ReactNode
}

export const AppFormField = React.forwardRef<HTMLInputElement, AppFormFieldProps>(
    ({ className, label, error, icon, id, disabled, ...props }, ref) => {
        const inputId = id || `input-${label.replace(/\s+/g, '-').toLowerCase()}`

        return (
            <div className={cn("space-y-2 w-full", className)}>
                <Label
                    htmlFor={inputId}
                    className={cn(
                        "text-sm font-semibold tracking-wide flex items-center gap-2",
                        error ? "text-destructive" : "text-foreground/80"
                    )}
                >
                    {label}
                </Label>
                <div className="relative group">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        disabled={disabled}
                        className={cn(
                            "flex h-11 w-full rounded-xl border bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 shadow-sm",
                            icon && "pl-10",
                            error ? "border-destructive ring-destructive/20 focus-visible:ring-destructive" : "border-border hover:border-border/80 focus-visible:border-primary",
                        )}
                        {...props}
                    />
                </div>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-xs font-medium text-destructive mt-1.5"
                    >
                        {error}
                    </motion.p>
                )}
            </div>
        )
    }
)
AppFormField.displayName = "AppFormField"
