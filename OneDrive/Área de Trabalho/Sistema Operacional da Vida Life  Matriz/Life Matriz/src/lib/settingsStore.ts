import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Settings {
    // Profile
    userName: string;
    userEmail: string;

    // Notifications
    enableNotifications: boolean;
    enableEmailNotifications: boolean;
    enablePushNotifications: boolean;
    enableSoundNotifications: boolean;

    // Proactive Assistant
    enableProactiveAssistant: boolean;
    enableVoiceAssistant: boolean;
    enableAIChat: boolean;
    enableAutoSearch: boolean;

    // Appearance
    theme: 'dark' | 'light' | 'system';
    accentColor: 'teal' | 'purple' | 'blue' | 'green' | 'orange';
    compactMode: boolean;

    // Privacy
    enableAnalytics: boolean;
    shareUsageData: boolean;

    // Integrations
    googleCalendarConnected: boolean;
    notionConnected: boolean;
    spotifyConnected: boolean;
}

interface SettingsState extends Settings {
    updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
    resetSettings: () => void;
}

const defaultSettings: Settings = {
    // Profile
    userName: '',
    userEmail: '',

    // Notifications
    enableNotifications: true,
    enableEmailNotifications: false,
    enablePushNotifications: true,
    enableSoundNotifications: true,

    // Proactive Assistant
    enableProactiveAssistant: true,
    enableVoiceAssistant: true,
    enableAIChat: true,
    enableAutoSearch: true,

    // Appearance
    theme: 'dark',
    accentColor: 'teal',
    compactMode: false,

    // Privacy
    enableAnalytics: true,
    shareUsageData: false,

    // Integrations
    googleCalendarConnected: false,
    notionConnected: false,
    spotifyConnected: false,
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            ...defaultSettings,

            updateSetting: (key, value) => set({ [key]: value }),

            resetSettings: () => set(defaultSettings),
        }),
        {
            name: 'lifeos-settings',
        }
    )
);
