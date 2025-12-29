import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
    id: string;
    title: string;
    body: string;
    icon?: string;
    type: 'info' | 'success' | 'warning' | 'reminder' | 'goal' | 'health';
    timestamp: Date;
    read: boolean;
    action?: {
        label: string;
        url: string;
    };
}

interface NotificationState {
    notifications: Notification[];
    permission: NotificationPermission;
    pushEnabled: boolean;

    // Actions
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;
    clearAll: () => void;
    requestPermission: () => Promise<boolean>;
    sendPushNotification: (title: string, body: string, options?: NotificationOptions) => void;
    setPushEnabled: (enabled: boolean) => void;

    // Scheduled notifications
    scheduleReminder: (title: string, body: string, delayMinutes: number) => void;
}

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set, get) => ({
            notifications: [],
            permission: typeof Notification !== 'undefined' ? Notification.permission : 'default',
            pushEnabled: true,

            addNotification: (notification) => {
                const newNotification: Notification = {
                    ...notification,
                    id: generateId(),
                    timestamp: new Date(),
                    read: false,
                };

                set((state) => ({
                    notifications: [newNotification, ...state.notifications].slice(0, 100),
                }));

                // Also send push notification if enabled
                if (get().pushEnabled && get().permission === 'granted') {
                    get().sendPushNotification(notification.title, notification.body);
                }
            },

            markAsRead: (id) => {
                set((state) => ({
                    notifications: state.notifications.map((n) =>
                        n.id === id ? { ...n, read: true } : n
                    ),
                }));
            },

            markAllAsRead: () => {
                set((state) => ({
                    notifications: state.notifications.map((n) => ({ ...n, read: true })),
                }));
            },

            deleteNotification: (id) => {
                set((state) => ({
                    notifications: state.notifications.filter((n) => n.id !== id),
                }));
            },

            clearAll: () => {
                set({ notifications: [] });
            },

            requestPermission: async () => {
                if (typeof Notification === 'undefined') {
                    return false;
                }

                const permission = await Notification.requestPermission();
                set({ permission });
                return permission === 'granted';
            },

            sendPushNotification: (title, body, options = {}) => {
                if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
                    return;
                }

                const notification = new Notification(title, {
                    body,
                    icon: '/icons/icon-192x192.png',
                    badge: '/icons/icon-72x72.png',
                    ...options,
                });

                notification.onclick = () => {
                    window.focus();
                    notification.close();
                };
            },

            setPushEnabled: (enabled) => {
                set({ pushEnabled: enabled });
            },

            scheduleReminder: (title, body, delayMinutes) => {
                setTimeout(() => {
                    get().addNotification({
                        title,
                        body,
                        type: 'reminder',
                    });
                }, delayMinutes * 60 * 1000);
            },
        }),
        {
            name: 'lifeos-notifications',
            partialize: (state) => ({
                notifications: state.notifications,
                pushEnabled: state.pushEnabled,
            }),
        }
    )
);

// Initialize smart notifications
if (typeof window !== 'undefined') {
    // Request permission after user interaction
    const requestOnInteraction = () => {
        useNotificationStore.getState().requestPermission();
        window.removeEventListener('click', requestOnInteraction);
    };

    // Wait for first click to request permission
    setTimeout(() => {
        if (Notification?.permission === 'default') {
            window.addEventListener('click', requestOnInteraction, { once: true });
        }
    }, 3000);

    // Example: Daily motivation notification
    const scheduleDailyMotivation = () => {
        const now = new Date();
        const nextMorning = new Date(now);
        nextMorning.setDate(nextMorning.getDate() + 1);
        nextMorning.setHours(8, 0, 0, 0);

        const delay = nextMorning.getTime() - now.getTime();

        setTimeout(() => {
            useNotificationStore.getState().addNotification({
                title: '🌅 Bom dia, Edson!',
                body: 'Lembre-se de revisar seus objetivos e começar o dia com foco!',
                type: 'reminder',
            });
            scheduleDailyMotivation(); // Reschedule
        }, delay);
    };

    // Start daily motivation (only in production)
    if (process.env.NODE_ENV === 'production') {
        scheduleDailyMotivation();
    }
}
