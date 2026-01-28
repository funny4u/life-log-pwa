'use server';

import { createClient } from '@/lib/supabase';
import { Log, FieldDefinition, Category } from '@/lib/types';

// ... existing code ...

// --- Categories ---

export async function getCategories() {
    const supabase = createClient();
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
    const supabase = createClient();

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
    const supabase = createClient();

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
    const supabase = createClient();

    // 1. Reset all others (Manual fallback if trigger missing)
    await supabase.from('categories').update({ is_default: false }).neq('id', id);

    // 2. Set target
    const { error } = await supabase.from('categories').update({ is_default: true }).eq('id', id);

    if (error) throw error;
    revalidatePath('/settings');
    revalidatePath('/');
}

export async function deleteCategory(id: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

    if (error) throw error;
    revalidatePath('/settings');
    revalidatePath('/');
}

import { revalidatePath } from 'next/cache';

// --- Field Definitions ---

export async function getFieldDefinitions() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('field_definitions')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) {
        // If table doesn't exist yet, return empty array to prevent crash
        if (error.code === '42P01') return [];
        console.error('Error fetching fields:', error);
        return [];
    }
    return data as FieldDefinition[];
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

    const { error } = await supabase.from('field_definitions').insert({ ...data, sort_order: nextOrder });
    if (error) throw new Error('Failed to create field');
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
    const supabase = createClient();
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
    const supabase = createClient();
    let { error } = await supabase.from('logs').insert(log);

    // Graceful Handling: Retry if emoji column missing
    if (error && (
        error.code === 'PGRST204' ||
        error.message?.includes("emoji") ||
        JSON.stringify(error).includes("emoji")
    )) {
        console.warn('⚠️ Schema Mismatch detected. Retrying without emoji...', error);
        const { emoji, ...logWithoutEmoji } = log;
        const retry = await supabase.from('logs').insert(logWithoutEmoji);
        error = retry.error;
    }

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

    let { error } = await supabase
        .from('logs')
        .update(data)
        .eq('id', id);

    // Graceful Handling
    if (error && error.message.includes("Could not find the 'emoji' column")) {
        console.warn('Emoji column missing in DB. Retrying update without emoji.');
        const { emoji, ...dataWithoutEmoji } = data;
        const retry = await supabase.from('logs').update(dataWithoutEmoji).eq('id', id);
        error = retry.error;
    }

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
