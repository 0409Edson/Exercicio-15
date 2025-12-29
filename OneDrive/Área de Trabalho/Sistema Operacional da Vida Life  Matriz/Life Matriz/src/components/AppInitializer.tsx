'use client';

import { useEffect } from 'react';
import { cleanupDuplicateIds } from '@/lib/generateId';

/**
 * Component that initializes the app and cleans up any corrupted data
 */
export default function AppInitializer() {
    useEffect(() => {
        // Clean up duplicate IDs in localStorage on app start
        cleanupDuplicateIds();
    }, []);

    return null; // This component doesn't render anything
}
