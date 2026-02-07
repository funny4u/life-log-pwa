'use server';

import { createClient } from '@/lib/supabase/server';
import { Log, FieldDefinition, Category } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// ... existing code ...

// --- Categories ---

export async function getCategories() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
    return data as Category[];
}

export async function createCategory(data: Omit<Category, 'id' | 'created_at' | 'sort_order' | 'is_active'>) {
    const supabase = await createClient();

    // Get max sort order
    const { data: maxData } = await supabase.from('categories').select('sort_order').order('sort_order', { ascending: false }).limit(1).single();
    const nextOrder = (maxData?.sort_order || 0) + 10;

    const { error } = await supabase
        .from('categories')
        .insert([{ ...data, sort_order: nextOrder, is_active: true }]);

    if (error) throw error;
    revalidatePath('/settings');
    revalidatePath('/'); // Revalidate home as categories are used there
}

export async function updateCategory(id: string, data: Partial<Category>) {
    const supabase = await createClient();

    // If setting as default, we might need to handle it, but the DB trigger (if applied) handles mutual exclusion.
    // However, if we don't have the trigger applied yet, we should probably handle it here too for safety or just rely on the user running the migration.
    // Let's assume the migration will be run.

    const { error } = await supabase
        .from('categories')
        .update(data)
        .eq('id', id);

    if (error) throw error;
    revalidatePath('/settings');
    revalidatePath('/');
}

export async function setDefaultCategory(id: string) {
    const supabase = await createClient();

    // 1. Reset all others (Manual fallback if trigger missing)
    await supabase.from('categories').update({ is_default: false }).neq('id', id);

    // 2. Set target
    const { error } = await supabase.from('categories').update({ is_default: true }).eq('id', id);

    if (error) throw error;
    revalidatePath('/settings');
    revalidatePath('/');
}

export async function deleteCategory(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

    if (error) throw error;
    revalidatePath('/settings');
    revalidatePath('/');
}

export async function reorderCategories(items: { id: string; sort_order: number }[]) {
    const supabase = await createClient();
    for (const item of items) {
        await supabase.from('categories').update({ sort_order: item.sort_order }).eq('id', item.id);
    }
    revalidatePath('/settings');
    revalidatePath('/');
}

// --- Field Definitions ---

const NOTIFICATION_OPTION = 'ENABLE_NOTIFICATION';

export async function getFieldDefinitions() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('field_definitions')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) {
        if (error.code === '42P01') return [];
        console.error('Error fetching fields:', error);
        return [];
    }

    // Map existing DB options to include virtual property
    return (data || []).map((field: any) => ({
        ...field,
        enable_notification: Array.isArray(field.options) && field.options.includes(NOTIFICATION_OPTION)
    })) as FieldDefinition[];
}

export async function createFieldDefinition(data: Omit<FieldDefinition, 'id' | 'created_at' | 'sort_order'>) {
    const supabase = await createClient();
    // Get max sort order
    const { data: maxOrderData } = await supabase
        .from('field_definitions')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1);

    const nextOrder = (maxOrderData?.[0]?.sort_order ?? 0) + 1;

    // Handle virtual enable_notification property
    const { enable_notification, options, ...rest } = data;
    let finalOptions = options;
    if (enable_notification) {
        finalOptions = Array.isArray(options) ? [...options, NOTIFICATION_OPTION] : [NOTIFICATION_OPTION];
    }

    const { error } = await supabase.from('field_definitions').insert({
        ...rest,
        options: finalOptions,
        sort_order: nextOrder
    });

    if (error) throw new Error('Failed to create field');
    revalidatePath('/settings');
}


export async function updateFieldDefinition(id: string, data: Partial<Pick<FieldDefinition, 'label' | 'type' | 'enable_notification' | 'options'>>) {
    const supabase = await createClient();

    // 1. Fetch current options to know existing state (especially notification flag)
    const { data: current } = await supabase.from('field_definitions').select('options').eq('id', id).single();
    const currentOptions = Array.isArray(current?.options) ? current.options : [];
    const hasNotification = currentOptions.includes(NOTIFICATION_OPTION);

    // 2. Determine base user options
    let newOptions: string[] = [];

    if (data.options !== undefined) {
        // If explicitly provided (including null/empty), use it (filtering out system flag)
        newOptions = data.options ? data.options.filter(o => o !== NOTIFICATION_OPTION) : [];
    } else {
        // If not provided, keep current user options
        newOptions = currentOptions.filter(o => o !== NOTIFICATION_OPTION);
    }

    // 3. Determine target notification state
    const shouldEnableNotification = data.enable_notification !== undefined
        ? data.enable_notification
        : hasNotification;

    // 4. Re-append system flag if needed
    if (shouldEnableNotification) {
        newOptions.push(NOTIFICATION_OPTION);
    }

    // 5. Update
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { enable_notification, options, ...rest } = data;

    const { error } = await supabase
        .from('field_definitions')
        .update({ ...rest, options: newOptions })
        .eq('id', id);

    if (error) throw new Error('Failed to update field');
    revalidatePath('/settings');
}

export async function toggleFieldVisibility(id: string, is_active: boolean) {
    const supabase = await createClient();
    const { error } = await supabase.from('field_definitions').update({ is_active }).eq('id', id);
    if (error) throw new Error('Failed to update field');
    revalidatePath('/settings');
}

export async function deleteFieldDefinition(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('field_definitions').delete().eq('id', id);
    if (error) throw new Error('Failed to delete field');
    revalidatePath('/settings');
}

export async function reorderFields(items: { id: string; sort_order: number }[]) {
    const supabase = await createClient();
    for (const item of items) {
        await supabase.from('field_definitions').update({ sort_order: item.sort_order }).eq('id', item.id);
    }
    revalidatePath('/settings');
}

// --- Logs ---

export async function getLogs() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching logs:', error);
        return [];
    }

    return data as Log[];
}

export async function createLog(log: Omit<Log, 'id' | 'created_at'>) {
    const supabase = await createClient();

    // TEMPORARY FIX: Remove emoji to bypass schema error
    // const { emoji: _emoji, ...safeLog } = log;
    const { error } = await supabase.from('logs').insert(log);

    if (error) {
        console.error('Error creating log:', error);
        throw new Error(error.message);
    }

    revalidatePath('/');
    revalidatePath('/calendar');
    revalidatePath('/stats');
}

// Update existing log
export async function updateLog(id: string, data: Partial<Omit<Log, 'id' | 'created_at'>>) {
    const supabase = await createClient();

    // TEMPORARY FIX: Remove emoji to bypass schema error
    // const { emoji: _emoji, ...safeData } = data;
    const { error } = await supabase
        .from('logs')
        .update(data)
        .eq('id', id);

    if (error) {
        console.error('Error updating log:', error);
        throw new Error(error.message);
    }

    revalidatePath('/');
    revalidatePath('/calendar');
    revalidatePath('/stats');
}

// Delete log
export async function deleteLog(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('logs')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting log:', error);
        throw new Error('Failed to delete log');
    }

    revalidatePath('/');
    revalidatePath('/calendar');
    revalidatePath('/stats');
}

// Bulk delete logs
export async function bulkDeleteLogs(ids: string[]) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('logs')
        .delete()
        .in('id', ids);

    if (error) {
        console.error('Error deleting logs:', error);
        throw new Error('Failed to delete logs');
    }

    revalidatePath('/');
    revalidatePath('/calendar');
    revalidatePath('/stats');
}

export async function getUpcomingNotifications() {
    const supabase = await createClient();
    const now = new Date().toISOString();

    // Fetch logs with notification_time > now
    // Limit to reasonable amount
    const { data, error } = await supabase
        .from('logs')
        .select('*')
        .gt('notification_time', now)
        .order('notification_time', { ascending: true })
        .limit(20);

    if (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }

    return data as Log[];
}

export async function updateProfile(data: { app_title?: string; app_tagline?: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

    if (error) throw error;
    revalidatePath('/', 'layout'); // Revalidate everything
}

export async function generateSampleData(language: 'en' | 'ko' = 'ko') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Not authenticated');
    }

    const userId = user.id;

    // 1. Define Categories based on Language
    const data = language === 'ko' ? {
        categories: [
            { name: '일상', icon: '📅', color: '#3b82f6', sort_order: 0 },
            { name: '업무', icon: '💼', color: '#10b981', sort_order: 1 },
            { name: '운동', icon: '💪', color: '#ef4444', sort_order: 2 }
        ],
        fields: {
            '일상': [
                { label: '기분', key_name: 'mood', type: 'select', options: ['행복', '보통', '우울', '피곤'], sort_order: 0 },
                { label: '날씨', key_name: 'weather', type: 'select', options: ['맑음', '흐림', '비', '눈'], sort_order: 1 }
            ],
            '업무': [
                { label: '우선순위', key_name: 'priority', type: 'select', options: ['상', '중', '하'], sort_order: 0 },
                { label: '진행상태', key_name: 'status', type: 'select', options: ['시작전', '진행중', '완료'], sort_order: 1 }
            ],
            '운동': [
                { label: '종목', key_name: 'type', type: 'text', sort_order: 0 },
                { label: '시간(분)', key_name: 'duration', type: 'number', sort_order: 1 }
            ]
        },
        logs: {
            '일상': [
                { title: '오늘의 일기', memo: '오랜만에 친구를 만나서 즐거운 시간을 보냈다.', custom_data: { mood: '행복', weather: '맑음' } },
            ],
            '업무': [
                { title: '주간 회의', memo: '다음 주 스프린트 계획 논의.', custom_data: { priority: '상', status: '완료' } },
            ],
            '운동': [
                { title: '저녁 조깅', memo: '한강 공원 달리기.', custom_data: { type: '러닝', duration: 45 } }
            ]
        }
    } : {
        categories: [
            { name: 'General', icon: '📅', color: '#3b82f6', sort_order: 0 },
            { name: 'Work', icon: '💼', color: '#10b981', sort_order: 1 },
            { name: 'Health', icon: '💪', color: '#ef4444', sort_order: 2 }
        ],
        fields: {
            'General': [
                { label: 'Mood', key_name: 'mood', type: 'select', options: ['Happy', 'Neutral', 'Sad', 'Tired'], sort_order: 0 },
                { label: 'Weather', key_name: 'weather', type: 'select', options: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'], sort_order: 1 }
            ],
            'Work': [
                { label: 'Priority', key_name: 'priority', type: 'select', options: ['High', 'Medium', 'Low'], sort_order: 0 },
                { label: 'Status', key_name: 'status', type: 'select', options: ['To Do', 'In Progress', 'Done'], sort_order: 1 }
            ],
            'Health': [
                { label: 'Activity', key_name: 'type', type: 'text', sort_order: 0 },
                { label: 'Duration (min)', key_name: 'duration', type: 'number', sort_order: 1 }
            ]
        },
        logs: {
            'General': [
                { title: 'Daily Journal', memo: 'Met a friend and had a great time.', custom_data: { mood: 'Happy', weather: 'Sunny' } },
            ],
            'Work': [
                { title: 'Weekly Meeting', memo: 'Discussed next sprint plan.', custom_data: { priority: 'High', status: 'Done' } },
            ],
            'Health': [
                { title: 'Evening Jog', memo: 'Run at the park.', custom_data: { type: 'Running', duration: 45 } }
            ]
        }
    };

    try {
        const categoryMap: Record<string, string> = {}; // Name -> ID

        // 2. Insert Categories
        for (const cat of data.categories) {
            const { data: newCat, error } = await supabase
                .from('categories')
                .insert({
                    name: cat.name,
                    icon: cat.icon,
                    color: cat.color,
                    sort_order: cat.sort_order,
                    user_id: userId,
                    is_active: true
                })
                .select()
                .single();

            if (error) throw error;
            if (newCat) categoryMap[cat.name] = newCat.id;
        }

        // 3. Insert and Link Fields
        for (const [catName, fields] of Object.entries(data.fields)) {
            const catId = categoryMap[catName];
            if (!catId) continue;

            const fieldIds: string[] = [];

            for (const field of fields) {
                const { data: newField, error } = await supabase
                    .from('field_definitions')
                    .insert({
                        label: field.label,
                        key_name: field.key_name,
                        type: field.type,
                        options: field.options,
                        sort_order: field.sort_order,
                        user_id: userId,
                        is_active: true
                    })
                    .select()
                    .single();

                if (newField) fieldIds.push(newField.id);
            }

            if (fieldIds.length > 0) {
                // Prepend standard fields to ensure they are visible
                const standardFields = ['date', 'amount', 'memo', 'image_url'];
                // Note: 'status' is omitted to avoid conflict if custom field is named 'status'

                await supabase
                    .from('categories')
                    .update({
                        settings: { visible_fields: [...standardFields, ...fieldIds] }
                    })
                    .eq('id', catId);
            }
        }

        // 4. Insert Sample Logs
        const today = new Date().toISOString().split('T')[0];

        for (const [catName, logs] of Object.entries(data.logs)) {
            const catId = categoryMap[catName];
            if (!catId) continue;

            for (const log of logs) {
                await supabase.from('logs').insert({
                    date: today,
                    title: log.title,
                    memo: log.memo,
                    category: catName, // Use Name, not ID
                    custom_data: log.custom_data,
                    user_id: userId
                });
            }
        }

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Error generating sample data:', error);
        return { success: false, error };
    }
}

export async function resetUserData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    try {
        // Delete logs
        await supabase.from('logs').delete().eq('user_id', user.id);

        // Delete field definitions
        await supabase.from('field_definitions').delete().eq('user_id', user.id);

        // Delete categories
        await supabase.from('categories').delete().eq('user_id', user.id);

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Error resetting user data:', error);
        return { success: false, error };
    }
}
