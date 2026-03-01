"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { AlertTriangle, RefreshCcw } from "lucide-react"

interface ErrorStateProps {
    title?: string
    message: string
    onRetry?: () => void
}

export function ErrorState({
    title = "Something went wrong",
    message,
    onRetry,
}: ErrorStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center p-8 text-center glass-card bg-red-50/10 dark:bg-red-950/10 border border-red-200/50 dark:border-red-900/50 rounded-2xl my-4"
        >
            <div className="h-12 w-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mb-4 ring-4 ring-red-50 dark:ring-red-950/30">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-red-100 mb-2">{title}</h3>
            <p className="text-sm text-red-600/80 dark:text-red-400/80 max-w-md mb-6">{message}</p>

            {onRetry && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-700 bg-red-100/50 hover:bg-red-200/70 dark:text-red-300 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg transition-colors border border-red-200 dark:border-red-800"
                >
                    <RefreshCcw className="h-4 w-4" />
                    Try Again
                </motion.button>
            )}
        </motion.div>
    )
}
