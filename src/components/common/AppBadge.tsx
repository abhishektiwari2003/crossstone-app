"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type BaseBadgeProps = React.ComponentProps<typeof Badge>

export interface AppBadgeProps extends Omit<HTMLMotionProps<"div">, "children"> {
    theme?: "primary" | "success" | "warning" | "danger" | "neutral"
    badgeClassName?: string
    children?: React.ReactNode
}

export const AppBadge = React.forwardRef<HTMLDivElement, AppBadgeProps>(
    ({ className, badgeClassName, theme = "neutral", children, ...props }, ref) => {

        const themeStyles = {
            primary: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
            success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
            warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
            danger: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800",
            neutral: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
        }

        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="inline-block"
                {...props}
            >
                <Badge
                    className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border border-border/50 shadow-sm",
                        themeStyles[theme],
                        badgeClassName
                    )}
                >
                    {children}
                </Badge>
            </motion.div>
        )
    }
)
AppBadge.displayName = "AppBadge"
