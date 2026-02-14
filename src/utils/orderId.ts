/**
 * Formats a numeric Order ID into a professional string format.
 * Example: 14 -> ORD-0014 (Simple padding for now, can be upgraded to Hashids later if needed)
 * 
 * We use simple padding to ensure it's searchable and consistent. 
 * If we used a hash, we'd need to be able to decode it for search, or store it.
 * Simple padding is safest without DB changes.
 */
export function formatOrderId(id: number | string): string {
    const num = Number(id);
    if (isNaN(num)) return String(id);

    // Pad with zeros to at least 6 digits
    // e.g. 14 -> 000014 -> ORD-000014
    // Or we can use a random-looking math trick if preferred, but simple is best for now.
    // Let's do a simple hex string to make it look "generated" 
    // 14 -> E (too short). 

    // Let's stick to simple padding: ORD-{id}
    const padded = num.toString().padStart(6, '0');
    return `ORD-${padded}`;
}

/**
 * Parsing logic if we ever need to go back from ORD-000014 to 14
 * useful for search inputs
 */
export function parseOrderId(displayId: string): number | null {
    if (!displayId) return null;
    const clean = displayId.replace(/^ORD-/i, '');
    const num = parseInt(clean, 10);
    return isNaN(num) ? null : num;
}
