"use client";

import { useEffect, useRef } from 'react';
import { getLogs, getFieldDefinitions } from '@/app/actions';
import { Log, FieldDefinition } from '@/lib/types';

export function NotificationManager() {
    const processedLogs = useRef<Set<string>>(new Set());
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Request permission on mount
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const checkNotifications = async () => {
            if ('Notification' in window && Notification.permission !== 'granted') return;

            try {
                const [logs, fields] = await Promise.all([
                    getLogs(),
                    getFieldDefinitions()
                ]);

                // Filter fields that have notification enabled
                const notifyFields = fields.filter(f => f.enable_notification && (f.type === 'time' || f.type === 'date'));
                if (notifyFields.length === 0) return;

                const now = new Date();
                const currentMinutes = now.getHours() * 60 + now.getMinutes();

                logs.forEach(log => {
                    // Check if we already notified for this log recently (simple debounce/dedup)
                    // For a robust system, we'd need more complex state, but simple checking against "today's match" is a start.
                    // However, 'time' field is usually just HH:MM string. 'date' is YYYY-MM-DD.

                    if (!log.custom_data) return;

                    notifyFields.forEach(field => {
                        const value = log.custom_data?.[field.key_name];
                        if (!value) return;

                        const notificationKey = `${log.id}-${field.key_name}-${value}`;
                        if (processedLogs.current.has(notificationKey)) return;

                        let shouldNotify = false;

                        if (field.type === 'time') {
                            // Value format: "HH:MM"
                            const [h, m] = String(value).split(':').map(Number);
                            if (!isNaN(h) && !isNaN(m)) {
                                const logMinutes = h * 60 + m;
                                // Trigger if within last minute match
                                if (Math.abs(currentMinutes - logMinutes) <= 1) {
                                    // Check if date matches today (Log has a 'date' field)
                                    const logDate = new Date(log.date);
                                    if (logDate.toDateString() === now.toDateString()) {
                                        shouldNotify = true;
                                    }
                                }
                            }
                        } else if (field.type === 'date') {
                            // Value format: "YYYY-MM-DD"
                            // Notify at 9 AM on that date? Or just if it matches today? 
                            // Let's assume notify at start of day or checking time.
                            // For now, let's skip strict date notification logic as it's ambiguous when to trigger.
                            // Or simple: if date matches today and it's 9 AM?
                            // Leaving date triggers basic for now: triggers if *Log Date* matches today? 
                            // Actually, Custom Field "Date" value.
                            if (String(value) === now.toISOString().split('T')[0]) {
                                // Only notify once per day, perhaps at set time? 
                                // Let's trigger if it's 9:00 AM
                                if (now.getHours() === 9 && now.getMinutes() === 0) {
                                    shouldNotify = true;
                                }
                            }
                        }

                        if (shouldNotify) {
                            new Notification(log.title || 'Life Log Reminder', {
                                body: `${field.label}: ${value}`,
                                icon: '/icon.png'
                            });
                            processedLogs.current.add(notificationKey);
                        }
                    });
                });

            } catch (e) {
                console.error("Notification check failed", e);
            }
        };

        // Check every minute
        checkNotifications();
        intervalRef.current = setInterval(checkNotifications, 60000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    return null; // Headless component
}
