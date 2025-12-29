/**
 * Generates a unique ID using timestamp + random string + counter
 * This prevents duplicate keys in React lists
 */
let counter = 0;

export function generateUniqueId(prefix: string = ''): string {
    counter++;
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    const uniqueCounter = counter.toString(36);
    return `${prefix}${timestamp}-${random}-${uniqueCounter}`;
}

/**
 * Simple unique ID without prefix
 */
export function generateId(): string {
    return generateUniqueId();
}

/**
 * Clean up localStorage data with duplicate IDs
 * This should be called once on app initialization
 */
export function cleanupDuplicateIds(): void {
    if (typeof window === 'undefined') return;

    const cleanupKey = 'lifeos-ids-cleaned-v2';
    if (localStorage.getItem(cleanupKey)) return;

    const keysToClean = [
        'lifeos-access-logs',
        'lifeos-passwords',
        'lifeos-quick-goals',
        'lifeos-proactive-notifs',
    ];

    keysToClean.forEach(key => {
        try {
            const data = localStorage.getItem(key);
            if (data) {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) {
                    // Regenerate IDs to ensure uniqueness
                    const cleaned = parsed.map((item, index) => ({
                        ...item,
                        id: generateUniqueId(`${key}-${index}-`)
                    }));
                    localStorage.setItem(key, JSON.stringify(cleaned));
                } else if (parsed && parsed.goals && Array.isArray(parsed.goals)) {
                    // Handle quick-goals format
                    const cleaned = {
                        ...parsed,
                        goals: parsed.goals.map((item: { id?: string }, index: number) => ({
                            ...item,
                            id: generateUniqueId(`goal-${index}-`)
                        }))
                    };
                    localStorage.setItem(key, JSON.stringify(cleaned));
                }
            }
        } catch (e) {
            // If parsing fails, remove corrupted data
            localStorage.removeItem(key);
        }
    });

    localStorage.setItem(cleanupKey, 'true');
}

