export type LogCategory = string; // Now dynamic, was union type

export interface Category {
    id: string;
    name: string;
    color?: string;
    icon?: string;
    sort_order: number;
    is_active: boolean;
    is_default?: boolean;
    settings?: {
        visible_fields?: string[];
    } | null;
    default_transaction_type?: 'expense' | 'income' | 'none';
}

export interface Log {
    id: string;
    created_at: string;
    date: string;
    end_date?: string | null;
    title: string;
    category: LogCategory;
    amount?: number | null;
    image_url?: string | null;
    memo?: string | null;
    status?: 'Pending' | 'Planned' | 'Completed' | null;
    emoji?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    custom_data?: Record<string, any> | null;
}

export type FieldType = 'text' | 'number' | 'select' | 'multiselect' | 'time' | 'date' | 'boolean' | 'url' | 'email' | 'phone' | 'percent' | 'currency' | 'duration' | 'rating' | 'barcode' | 'user' | 'attachment';

export type AppMode = 'all' | 'financial' | 'journal' | 'planner' | 'maintenance';

export interface ViewConfiguration {
    viewMode: 'list' | 'gallery' | 'calendar' | 'board' | 'table' | 'feed';
    filter?: {
        categories?: string[];
        type?: string[];
    };
    sort?: {
        key: string;
        direction: 'asc' | 'desc';
    };
}

export interface FieldDefinition {
    id: string;
    label: string;
    key_name: string;
    type: FieldType;
    options?: string[] | null;
    is_active: boolean;
    sort_order: number;
    enable_notification?: boolean;
}
