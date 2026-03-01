"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface AppCardProps extends HTMLMotionProps<"div"> {
    hoverLift?: boolean
    glassmorphism?: boolean
}

export const AppCard = React.forwardRef<HTMLDivElement, AppCardProps>(
    ({ className, hoverLift = false, glassmorphism = true, children, ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                whileHover={hoverLift ? { y: -2, scale: 1.01 } : undefined}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={cn(
                    "rounded-2xl border border-border/50",
                    glassmorphism ? "glass-card backdrop-blur-md shadow-card" : "bg-card shadow-sm",
                    className
                )}
                {...props}
            >
                {children}
            </motion.div>
        )
    }
)
AppCard.displayName = "AppCard"
