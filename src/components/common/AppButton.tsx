"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AppButtonProps = React.ComponentProps<typeof Button> & Omit<HTMLMotionProps<"button">, "ref" | "style" | "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag" | "onViewportEnter" | "onViewportLeave">

export const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
    ({ className, variant, size, children, ...props }, ref) => {
        return (
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-block"
            >
                <Button
                    ref={ref}
                    variant={variant}
                    size={size}
                    className={cn(
                        "transition-shadow duration-300 font-semibold rounded-lg",
                        variant === "default" && "shadow-md hover:shadow-lg bg-primary text-primary-foreground hover:bg-primary/90",
                        className
                    )}
                    {...props}
                >
                    {children}
                </Button>
            </motion.div>
        )
    }
)
AppButton.displayName = "AppButton"
