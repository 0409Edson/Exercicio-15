import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BackupData {
    id: string;
    timestamp: Date;
    size: number;
    data: string;
    type: 'manual' | 'auto';
}

interface SyncState {
    // Cloud sync status
    isOnline: boolean;
    lastSync: Date | null;
    isSyncing: boolean;
    syncError: string | null;

    // Backup data
    backups: BackupData[];
    autoBackupEnabled: boolean;
    autoBackupInterval: number; // in hours
    maxBackups: number;

    // Actions
    setOnline: (status: boolean) => void;
    startSync: () => void;
    completeSync: () => void;
    setSyncError: (error: string | null) => void;

    // Backup actions
    createBackup: (type: 'manual' | 'auto') => void;
    restoreBackup: (id: string) => boolean;
    deleteBackup: (id: string) => void;
    setAutoBackup: (enabled: boolean) => void;

    // Export/Import
    exportAllData: () => string;
    importAllData: (data: string) => boolean;
}

// Get all localStorage data
function getAllLocalStorageData(): Record<string, string> {
    const data: Record<string, string> = {};
    const lifeosKeys = [
        'lifeos-auth',
        'lifeos-settings',
        'lifeos-ai-store',
        'lifeos-passwords',
        'lifeos-access-logs',
        'lifeos-face-data',
        'lifeos-fingerprint',
    ];

    lifeosKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            data[key] = value;
        }
    });

    return data;
}

// Restore localStorage data
function restoreLocalStorageData(data: Record<string, string>): void {
    Object.entries(data).forEach(([key, value]) => {
        localStorage.setItem(key, value);
    });
}

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useSyncStore = create<SyncState>()(
    persist(
        (set, get) => ({
            // Initial state
            isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
            lastSync: null,
            isSyncing: false,
            syncError: null,
            backups: [],
            autoBackupEnabled: true,
            autoBackupInterval: 24, // Daily
            maxBackups: 10,

            setOnline: (status) => set({ isOnline: status }),

            startSync: () => set({ isSyncing: true, syncError: null }),

            completeSync: () => set({
                isSyncing: false,
                lastSync: new Date(),
                syncError: null
            }),

            setSyncError: (error) => set({
                isSyncing: false,
                syncError: error
            }),

            createBackup: (type) => {
                const data = getAllLocalStorageData();
                const jsonData = JSON.stringify(data);

                const backup: BackupData = {
                    id: generateId(),
                    timestamp: new Date(),
                    size: new Blob([jsonData]).size,
                    data: jsonData,
                    type,
                };

                set((state) => {
                    let backups = [backup, ...state.backups];

                    // Keep only maxBackups
                    if (backups.length > state.maxBackups) {
                        backups = backups.slice(0, state.maxBackups);
                    }

                    return { backups };
                });
            },

            restoreBackup: (id) => {
                const backup = get().backups.find(b => b.id === id);
                if (!backup) return false;

                try {
                    const data = JSON.parse(backup.data);
                    restoreLocalStorageData(data);
                    window.location.reload();
                    return true;
                } catch (error) {
                    console.error('Restore error:', error);
                    return false;
                }
            },

            deleteBackup: (id) => {
                set((state) => ({
                    backups: state.backups.filter(b => b.id !== id),
                }));
            },

            setAutoBackup: (enabled) => set({ autoBackupEnabled: enabled }),

            exportAllData: () => {
                const data = getAllLocalStorageData();
                const exportData = {
                    version: '1.0',
                    exportedAt: new Date().toISOString(),
                    data,
                };
                return JSON.stringify(exportData, null, 2);
            },

            importAllData: (jsonString) => {
                try {
                    const imported = JSON.parse(jsonString);
                    if (imported.data) {
                        restoreLocalStorageData(imported.data);
                        window.location.reload();
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.error('Import error:', error);
                    return false;
                }
            },
        }),
        {
            name: 'lifeos-sync',
            partialize: (state) => ({
                backups: state.backups,
                autoBackupEnabled: state.autoBackupEnabled,
                autoBackupInterval: state.autoBackupInterval,
                lastSync: state.lastSync,
            }),
        }
    )
);

// Auto-backup scheduler
if (typeof window !== 'undefined') {
    // Check for auto-backup on load
    const checkAutoBackup = () => {
        const state = useSyncStore.getState();
        if (!state.autoBackupEnabled) return;

        const lastBackup = state.backups.find(b => b.type === 'auto');
        if (!lastBackup) {
            state.createBackup('auto');
            return;
        }

        const hoursSinceBackup = (Date.now() - new Date(lastBackup.timestamp).getTime()) / (1000 * 60 * 60);
        if (hoursSinceBackup >= state.autoBackupInterval) {
            state.createBackup('auto');
        }
    };

    // Run after a short delay to ensure store is ready
    setTimeout(checkAutoBackup, 5000);

    // Check every hour
    setInterval(checkAutoBackup, 60 * 60 * 1000);

    // Online/offline detection
    window.addEventListener('online', () => {
        useSyncStore.getState().setOnline(true);
    });

    window.addEventListener('offline', () => {
        useSyncStore.getState().setOnline(false);
    });
}
