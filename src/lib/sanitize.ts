/**
 * Strip HTML tags and dangerous characters from user input.
 * Prevents XSS and injection attacks without requiring external libraries.
 */
export function sanitizeInput(input: string): string {
    if (!input) return input;

    return input
        // Strip HTML tags
        .replace(/<[^>]*>/g, "")
        // Strip common script injection patterns
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=/gi, "")
        // Normalize whitespace
        .trim();
}

/**
 * Sanitize specific string fields in an object.
 * Returns a new object with sanitized values.
 */
export function sanitizeObject<T extends Record<string, unknown>>(
    obj: T,
    fields: (keyof T)[]
): T {
    const sanitized = { ...obj };
    for (const field of fields) {
        const value = sanitized[field];
        if (typeof value === "string") {
            (sanitized as Record<string, unknown>)[field as string] = sanitizeInput(value);
        }
    }
    return sanitized;
}
