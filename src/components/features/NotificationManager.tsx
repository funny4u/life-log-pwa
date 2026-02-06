"use client";

import { useEffect, useRef } from 'react';
import { getUpcomingNotifications } from '@/app/actions';
import { Log } from '@/lib/types';

export function NotificationManager() {
    const processedRef = useRef<Set<string>>(new Set());
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Request permission on mount
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }

        const checkNotifications = async () => {
            if (Notification.permission !== 'granted') return;

            try {
                const logs = await getUpcomingNotifications();
                const now = new Date();

                logs.forEach((log: Log) => {
                    if (!log.notification_time) return;
                    const notifyTime = new Date(log.notification_time);
                    const timeDiff = notifyTime.getTime() - now.getTime();

                    // If time is within the next 30 seconds, or slightly passed (within last 30 seconds)
                    // We check a 1 minute window around the time to catch it
                    // But we rely on processedRef to avoid duplicates
                    if (timeDiff <= 30000 && timeDiff >= -30000) {
                        if (!processedRef.current.has(log.id)) {
                            // Trigger Notification
                            new Notification(log.title, {
                                body: log.memo || `Reminder for ${log.title}`,
                                icon: '/icon-192x192.png', // Assuming pwa icon exists
                                data: { url: `/?date=${log.date}` }
                            });
                            processedRef.current.add(log.id);
                        }
                    }
                });

                // Cleanup processed IDs for old logs?
                // Optional: clear set periodically if it grows too large, 
                // but logs are unique IDs and page refresh clears it.
            } catch (e) {
                console.error("Failed to check notifications", e);
            }
        };

        // Check initially
        checkNotifications();

        // Check every 30 seconds
        intervalRef.current = setInterval(checkNotifications, 15000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    return null; // Invisible component
}
