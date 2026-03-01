import { Variants } from "framer-motion"

export const pageTransition: Variants = {
    initial: { opacity: 0, y: 15 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 1, 0.5, 1] // Apple-like easing
        }
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: {
            duration: 0.2,
            ease: "easeIn"
        }
    }
}

export const staggerContainer: Variants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.05
        }
    }
}

export const staggerItem: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24
        }
    }
}

export const hoverLift = {
    whileHover: { y: -2, scale: 1.01 },
    whileTap: { scale: 0.99 },
    transition: { type: "spring", stiffness: 400, damping: 20 }
}
