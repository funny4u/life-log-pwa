"use client";

import React, { useEffect, useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { FieldDefinition, FieldType, Category } from '@/lib/types';
import { getFieldDefinitions, createFieldDefinition, updateFieldDefinition, deleteFieldDefinition, getCategories, createCategory, updateCategory, deleteCategory, setDefaultCategory } from '@/app/actions';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical, Check, Pencil, Type, Hash, Clock, CheckSquare, ChevronsUpDown, Calendar, Link, Mail, Phone, Percent, DollarSign, Timer, Star, ScanBarcode, Users, File, Search } from 'lucide-react';
// ... existing code ...
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const STANDARD_FIELDS = [
    { id: 'date', label: 'Date', icon: '📅' },
    { id: 'end_date', label: 'End Date', icon: '🔚' },
    { id: 'time', label: 'Time', icon: '⏰' },
    { id: 'amount', label: 'Amount ($)', icon: '💰' },
    { id: 'memo', label: 'Memo', icon: '📝' },
    { id: 'image_url', label: 'Image', icon: '📷' },
    { id: 'share', label: 'Share', icon: '📤' },
    { id: 'status', label: 'Status', icon: '🔖' },
];

const PRESET_COLORS = [
    '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4',
    '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#64748B',
    '#71717A', '#000000'
];

const FIELD_TYPES = [
    { value: 'text', label: 'Single line text', icon: Type, description: 'Short text for titles or names' },
    { value: 'number', label: 'Number', icon: Hash, description: 'Count, price, or score' },
    { value: 'currency', label: 'Currency', icon: DollarSign, description: 'Monetary value' },
    { value: 'percent', label: 'Percent', icon: Percent, description: 'Percentage value' },
    { value: 'time', label: 'Time', icon: Clock, description: 'Specific time of day (HH:MM)' },
    { value: 'date', label: 'Date', icon: Calendar, description: 'Calendar date' },
    { value: 'duration', label: 'Duration', icon: Timer, description: 'Length of time' },
    { value: 'boolean', label: 'Checkbox', icon: CheckSquare, description: 'Yes/No toggle' },
    { value: 'select', label: 'Single select', icon: GripVertical, description: 'Choose one from a list' },
    // { value: 'multiselect', label: 'Multiple select', icon: Menu, description: 'Choose multiple from a list' },
    { value: 'url', label: 'URL', icon: Link, description: 'Web link' },
    { value: 'email', label: 'Email', icon: Mail, description: 'Email address' },
    { value: 'phone', label: 'Phone number', icon: Phone, description: 'Telephone number' },
    { value: 'rating', label: 'Rating', icon: Star, description: 'Star rating (1-5)' },
    { value: 'user', label: 'User', icon: Users, description: 'Collaborator or person' },
    { value: 'attachment', label: 'Attachment', icon: File, description: 'File or image' },
    { value: 'barcode', label: 'Barcode', icon: ScanBarcode, description: 'Scan or enter barcode' },
];

interface SortableFieldRowProps {
    id: string;
    field: {
        label?: string;
        icon: string | React.ReactNode;
        type?: string;
    };
    isCustom: boolean;
    toggleVisible: (id: string) => void;
}

function SortableFieldRow({ id, field, isCustom, toggleVisible }: SortableFieldRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: 'none' // Essential for mobile drag
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2 bg-card border rounded-lg shadow-sm">
            <div {...attributes} {...listeners} className="cursor-move p-2 -ml-1 text-muted-foreground/30 hover:text-foreground touch-none">
                <GripVertical className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                <span className="text-xl flex-shrink-0">{field.icon}</span>
                <span className="text-base font-medium truncate">{field.label}</span>
                {isCustom && <span className="text-[10px] uppercase bg-muted px-1 rounded text-muted-foreground flex-shrink-0">{field.type}</span>}
            </div>
            <Switch
                checked={true}
                onCheckedChange={() => toggleVisible(id)}
                className="flex-shrink-0 ml-auto"
            />
        </div>
    );
}

export default function SettingsPage() {
    const { t, language, setLanguage } = useLanguage();
    const [fields, setFields] = useState<FieldDefinition[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    // Sheet State
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [sheetMode, setSheetMode] = useState<'create_category' | 'edit_category' | 'create_field' | 'edit_field'>('create_category');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
    const [openTypeSelect, setOpenTypeSelect] = useState(false);

    // Confirm Delete State
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'category' | 'field', id: string } | null>(null);

    // Form State
    const [newLabel, setNewLabel] = useState('');
    const [newType, setNewType] = useState<FieldType>('text');
    const [catName, setCatName] = useState('');
    const [catColor, setCatColor] = useState('#EF4444');
    const [catIcon, setCatIcon] = useState('🏷️');
    const [catTransactionType, setCatTransactionType] = useState<'expense' | 'income' | 'none'>('none');
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);

    // Filter State
    const [fieldSearch, setFieldSearch] = useState('');

    const [isSaving, setIsSaving] = useState(false);

    // Journal Settings State
    const [tempThumbnailSize, setTempThumbnailSize] = useState('150');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setTempThumbnailSize(localStorage.getItem('journal_thumbnail_size') || '150');
        }
    }, []);

    useEffect(() => {
        loadData();
    }, []);

    const [visibleFields, setVisibleFields] = useState<string[]>([]);

    // Reset form when sheet opens/closes or mode changes
    useEffect(() => {
        if (!isSheetOpen) {
            // Reset delay to avoid flicker
            setTimeout(() => {
                setNewLabel('');
                setNewType('text');
                setEditingFieldId(null);
                setCatName('');
                setCatColor('#EF4444');
                setCatIcon('🏷️');
                setEditingId(null);
                setIsNotificationEnabled(false);
                setVisibleFields(STANDARD_FIELDS.map(f => f.id)); // Default all standard enabled
            }, 300);
        }
    }, [isSheetOpen]);

    const loadData = async () => {
        try {
            const [fieldsData, catsData] = await Promise.all([
                getFieldDefinitions(),
                getCategories()
            ]);
            setFields(fieldsData);
            setCategories(catsData);
        } catch (e) {
            console.error(e);
        }
    };

    // Standard fields with translations
    const translatedStandardFields = STANDARD_FIELDS.map(f => ({
        ...f,
        label: t(`fields.${f.id}` as any)
    }));

    const handleCreateField = async () => {
        if (!newLabel) return;
        setIsSaving(true);
        try {
            // Robust key generation
            let key_name = newLabel.trim().toLowerCase()
                .replace(/[^a-z0-9]+/g, '_') // Replace sequences of non-alphanumeric with single underscore
                .replace(/^_+|_+$/g, '');   // Trim leading/trailing underscores

            // Fallback if empty or too short default to a random uuid-like string
            if (!key_name || key_name.length < 2) {
                key_name = `field_${crypto.randomUUID().split('-')[0]}`;
            }

            // Ensure uniqueness against existing fields
            const existingKeys = new Set(fields.map(f => f.key_name));
            let finalKey = key_name;
            let counter = 1;
            while (existingKeys.has(finalKey)) {
                finalKey = `${key_name}_${counter}`;
                counter++;
            }
            key_name = finalKey;

            // Only create the field definition on server
            // Note: We don't get the ID back from createFieldDefinition currently without refactoring actions,
            // but we can reload the data and find it.
            // Ideally core action should return the new object.
            // For now, I'll rely on reloading data.

            await createFieldDefinition({
                label: newLabel,
                key_name,
                type: newType,
                is_active: true,
                options: null,
                enable_notification: isNotificationEnabled
            });

            // Reload to get the new field including its ID
            const [newFieldsData] = await Promise.all([
                getFieldDefinitions(),
                // We don't strictly need to reload categories here usually, but safe to keep sync
                getCategories()
            ]);
            setFields(newFieldsData);

            // Find the newly created field to get its ID
            // We match by key_name since we just established it's unique
            const newField = newFieldsData.find(f => f.key_name === key_name);

            if (newField) {
                // Automatically enable the new field for the current category being edited
                setVisibleFields(prev => {
                    // Add the ID, not the key_name (unless it's a standard field, but this is custom)
                    if (prev.includes(newField.id)) return prev;
                    return [...prev, newField.id];
                });
            }

            setSheetMode('edit_category'); // Go back to category edit
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateField = async () => {
        if (!newLabel || !editingFieldId) return;
        setIsSaving(true);
        try {
            await updateFieldDefinition(editingFieldId, {
                label: newLabel,
                type: newType,
                enable_notification: isNotificationEnabled
            });
            await loadData();
            setSheetMode('edit_category'); // Go back to category edit
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveCategory = async () => {
        if (!catName) return;
        setIsSaving(true);
        try {
            const settings = {
                visible_fields: visibleFields
            };

            if (sheetMode === 'edit_category' && editingId) {
                await updateCategory(editingId, {
                    name: catName,
                    color: catColor,
                    icon: catIcon,
                    default_transaction_type: catTransactionType,
                    settings
                });
            } else {
                await createCategory({
                    name: catName,
                    color: catColor,
                    icon: catIcon,
                    default_transaction_type: catTransactionType,
                    settings
                });
            }
            await loadData();
            setIsSheetOpen(false);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const startEditCategory = (cat: Category) => {
        setCatName(cat.name);
        setCatColor(cat.color || '#EF4444');
        setCatIcon(cat.icon || '🏷️');
        setCatTransactionType(cat.default_transaction_type || 'none');
        setEditingId(cat.id);

        // Load visible fields from settings, or default to all standard if clean
        if (cat.settings?.visible_fields) {
            // Deduplicate just in case saved data is bad
            const savedFields = new Set(cat.settings.visible_fields);
            // Mandate 'date' field if missing
            if (!savedFields.has('date')) {
                savedFields.add('date');
            }
            setVisibleFields(Array.from(savedFields));
        } else {
            // If no settings (legacy), default to all standard + all active custom
            // For legacy support, we map custom fields to their IDs if possible, or keep key_name if needed
            // But ideally we migrate to IDs.
            const allFields = [
                ...STANDARD_FIELDS.map(f => f.id),
                ...fields.filter(f => f.is_active).map(f => f.id) // Prefer ID for custom fields
            ];
            // Ensure date is there
            if (!allFields.includes('date')) allFields.unshift('date');

            setVisibleFields(Array.from(new Set(allFields)));
        }

        setSheetMode('edit_category');
        setIsSheetOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setIsSaving(true);
        try {
            if (deleteConfirm.type === 'category') {
                setCategories(categories.filter(c => c.id !== deleteConfirm.id));
                await deleteCategory(deleteConfirm.id);
            } else {
                setFields(fields.filter(f => f.id !== deleteConfirm.id));
                await deleteFieldDefinition(deleteConfirm.id);
            }
            setDeleteConfirm(null);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const toggleVisible = (id: string) => {
        setVisibleFields(prev => {
            if (prev.includes(id)) {
                return prev.filter(f => f !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px movement before drag starts prevents accidental clicks
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setVisibleFields((items) => {
                const oldIndex = items.indexOf(active.id as string);
                const newIndex = items.indexOf(over?.id as string);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }

    return (
        <div className="flex flex-col h-full w-full bg-muted/10">
            <TopBar title={t('settings.title')} />

            <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-8">
                {/* Language Selection */}
                <div className="space-y-4">
                    <div className="px-1">
                        <h3 className="font-semibold text-lg">{t('settings.language')}</h3>
                    </div>
                    <div className="flex gap-2 p-1 bg-muted/50 rounded-lg max-w-[200px]">
                        <Button
                            variant={language === 'ko' ? 'default' : 'ghost'}
                            className="flex-1 h-9"
                            onClick={() => setLanguage('ko')}
                        >
                            한국어
                        </Button>
                        <Button
                            variant={language === 'en' ? 'default' : 'ghost'}
                            className="flex-1 h-9"
                            onClick={() => setLanguage('en')}
                        >
                            English
                        </Button>
                    </div>
                </div>
                <div className="border-b border-dashed border-border" />

                {/* Categories Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <div>
                            <h3 className="font-semibold text-lg">{t('settings.categories.title')}</h3>
                            <p className="text-sm text-muted-foreground">{t('settings.categories.description')}</p>
                        </div>
                        <Button size="sm" onClick={() => {
                            setSheetMode('create_category');
                            setIsSheetOpen(true);
                            // Default to common system fields
                            setVisibleFields(['time', 'amount', 'memo', 'image_url', 'share']);
                        }}>
                            <Plus className="w-4 h-4 mr-1" /> {t('actions.add')}
                        </Button>
                    </div>

                    <div className="grid gap-3">
                        {categories.map(cat => (
                            <div key={cat.id} className="flex items-center gap-3 p-3 rounded-xl border bg-card shadow-sm cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => startEditCategory(cat)}>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm border border-border/50 flex-shrink-0" style={{ backgroundColor: cat.color }}>
                                    {cat.icon || '🏷️'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-base">{cat.name}</h4>
                                        {cat.is_default && (
                                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">{t('common.default')}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn("h-8 w-8 hover:bg-transparent", cat.is_default ? "text-yellow-400 hover:text-yellow-500" : "text-muted-foreground/30 hover:text-yellow-400")}
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            if (cat.is_default) return; // Already default
                                            try {
                                                await setDefaultCategory(cat.id);
                                                // Optimistic update
                                                setCategories(prev => prev.map(c => ({
                                                    ...c,
                                                    is_default: c.id === cat.id
                                                })));
                                            } catch (err) {
                                                console.error(err);
                                            }
                                        }}
                                    >
                                        <Star className={cn("w-4 h-4", cat.is_default && "fill-current")} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'category', id: cat.id }); }}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-b border-dashed border-border" />

                {/* Journal Settings Section */}
                <div className="space-y-4">
                    <div className="px-1">
                        <h3 className="font-semibold text-lg">Journal Settings</h3>
                        <p className="text-sm text-muted-foreground">Customize the appearance of the Journal View.</p>
                    </div>
                    <div className="p-4 bg-card border rounded-xl space-y-3">
                        <label className="text-sm font-medium">Max Thumbnail Size (px)</label>
                        <div className="flex items-center gap-3">

                            <Input
                                type="number"
                                value={tempThumbnailSize}
                                onChange={(e) => setTempThumbnailSize(e.target.value)}
                                className="max-w-[120px]"
                            />
                            <span className="text-sm text-muted-foreground mr-auto">px</span>

                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                    localStorage.setItem('journal_thumbnail_size', tempThumbnailSize);
                                    window.dispatchEvent(new Event('storage'));
                                }}
                            >
                                {t ? t('actions.apply') || 'Apply' : 'Apply'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>


            {/* Create/Edit Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="bottom" className="rounded-t-[20px] pb-safe pt-6 h-[90vh] w-full max-w-[100vw] flex flex-col gap-0 overflow-hidden">
                    <div className="flex-1 min-h-0 overflow-y-auto px-1 pb-32" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
                        {(sheetMode === 'create_field' || sheetMode === 'edit_field') ? (
                            <div className="grid gap-6">
                                <SheetHeader className="text-left">
                                    <SheetTitle>{sheetMode === 'edit_field' ? t('settings.fields.edit') : t('settings.fields.newCustom')}</SheetTitle>
                                    <SheetDescription>{t('settings.fields.description')}</SheetDescription>
                                </SheetHeader>
                                <div className="space-y-3">
                                    <Label>{t('settings.fields.label')}</Label>
                                    <Input
                                        placeholder={t('settings.fields.placeholder')}
                                        value={newLabel}
                                        onChange={(e) => setNewLabel(e.target.value)}
                                        className="text-lg"
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label>{t('settings.fields.type')}</Label>
                                    <Popover open={openTypeSelect} onOpenChange={setOpenTypeSelect}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openTypeSelect}
                                                className="w-full justify-between h-14 px-4 text-base font-normal bg-background"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {newType ? (
                                                        <>
                                                            {(() => {
                                                                const type = FIELD_TYPES.find(f => f.value === newType);
                                                                const Icon = type?.icon || Type;
                                                                return <Icon className="w-5 h-5 text-muted-foreground" />;
                                                            })()}
                                                            <span>{FIELD_TYPES.find(f => f.value === newType)?.label}</span>
                                                        </>
                                                    ) : "Select field type..."}
                                                </div>
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start" side="bottom">
                                            <Command>
                                                <CommandInput placeholder="Find a field type..." />
                                                <CommandList className="max-h-[40vh] overflow-y-auto">
                                                    <CommandEmpty>No field type found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {FIELD_TYPES.map((type) => (
                                                            <CommandItem
                                                                key={type.value}
                                                                value={type.label} // Search by label
                                                                onSelect={() => {
                                                                    setNewType(type.value as FieldType);
                                                                    setOpenTypeSelect(false);
                                                                }}
                                                                className="flex items-center gap-3 py-3 px-4 cursor-pointer"
                                                            >
                                                                <type.icon className="w-5 h-5 text-muted-foreground" />
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium text-base">{type.label}</span>
                                                                </div>
                                                                <Check
                                                                    className={cn(
                                                                        "ml-auto h-4 w-4",
                                                                        newType === type.value ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {(newType === 'time' || newType === 'date') && (
                                    <div className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Enable Notification</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Receive an alert at the specified {newType}.
                                            </p>
                                        </div>
                                        <Switch
                                            checked={isNotificationEnabled}
                                            onCheckedChange={setIsNotificationEnabled}
                                        />
                                    </div>
                                )}

                                {sheetMode === 'edit_field' && (() => {
                                    const original = fields.find(f => f.id === editingFieldId);
                                    if (original && original.type !== newType) {
                                        return (
                                            <div className="p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-200">
                                                <strong>Warning:</strong> Changing field type from <b>{FIELD_TYPES.find(f => f.value === original.type)?.label}</b> to <b>{FIELD_TYPES.find(f => f.value === newType)?.label}</b> may cause existing data to display incorrectly.
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}

                                <div className="flex gap-3">
                                    <Button variant="outline" className="flex-1" onClick={() => setSheetMode('edit_category')}>{t('actions.back')}</Button>
                                    <Button
                                        className="flex-1"
                                        onClick={sheetMode === 'edit_field' ? handleUpdateField : handleCreateField}
                                        disabled={isSaving}
                                    >
                                        {sheetMode === 'edit_field' ? t('settings.fields.update') : t('settings.fields.create')}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6 w-full overflow-x-hidden px-4">
                                <SheetHeader className="text-left px-0">
                                    <SheetTitle>
                                        {sheetMode === 'create_category' ? t('settings.categories.new') : t('settings.categories.edit')}
                                    </SheetTitle>
                                    <SheetDescription>
                                        {t('settings.categories.description')}
                                    </SheetDescription>
                                </SheetHeader>

                                {/* Basic Info */}
                                <div className="space-y-3">
                                    <Label>{t('settings.appearance.nameAndIcon')}</Label>
                                    <div className="flex gap-3">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button className="w-14 h-14 flex-shrink-0 rounded-xl border flex items-center justify-center text-3xl bg-muted/30 hover:bg-muted/50 transition-colors">
                                                    {catIcon}
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="p-0 border-none shadow-none w-auto" align="start">
                                                <EmojiPicker
                                                    onEmojiClick={(data) => setCatIcon(data.emoji)}
                                                    theme={Theme.AUTO}
                                                    lazyLoadEmojis={true}
                                                    width={320}
                                                    height={400}
                                                    previewConfig={{ showPreview: false }}
                                                />
                                            </PopoverContent>
                                        </Popover>

                                        <Input
                                            placeholder={t('settings.categories.namePlaceholder')}
                                            value={catName}
                                            onChange={e => setCatName(e.target.value)}
                                            className="text-lg h-14 flex-1"
                                        />
                                    </div>
                                </div>

                                {/* Appearance */}
                                <div className="space-y-4 w-full">
                                    <Label>{t('settings.appearance.color')}</Label>
                                    <div className="flex flex-wrap gap-3 w-full">
                                        {PRESET_COLORS.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setCatColor(color)}
                                                className={cn(
                                                    "w-10 h-10 rounded-full flex-shrink-0 border-2 transition-all",
                                                    catColor === color ? "border-foreground scale-110" : "border-transparent opacity-50"
                                                )}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                {/* Log Page Configuration */}
                                <div className="space-y-3 w-full">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-base font-semibold">{t('settings.fields.title')}</Label>
                                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setSheetMode('create_field')}>
                                            <Plus className="w-3 h-3 mr-1" /> {t('settings.fields.addCustom')}
                                        </Button>
                                        <span className="text-xs text-muted-foreground ml-auto pr-2">
                                            {visibleFields.length} {language === 'ko' ? '활성' : 'active'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{t('settings.fields.description')}</p>

                                    <div className="space-y-4">
                                        {/* Active Fields (Ordered) */}
                                        <div>
                                            <Label className="text-sm font-medium mb-2 block">{t('settings.fields.active')}</Label>
                                            <div className="flex flex-col gap-2 border rounded-xl p-2 bg-muted/5 w-full">
                                                <DndContext
                                                    sensors={sensors}
                                                    collisionDetection={closestCenter}
                                                    onDragEnd={handleDragEnd}
                                                    // Mobile drag fix
                                                    modifiers={[]}
                                                >
                                                    <SortableContext
                                                        items={visibleFields}
                                                        strategy={verticalListSortingStrategy}
                                                    >
                                                        {visibleFields.map((fieldId) => {
                                                            const standardField = translatedStandardFields.find(f => f.id === fieldId);
                                                            // Check by ID first, then key_name for legacy
                                                            const customField = fields.find(f => f.id === fieldId || f.key_name === fieldId);
                                                            const field = standardField || customField;

                                                            if (!field) return null;

                                                            const isCustom = !!customField;
                                                            // Use the correct ID for the row (preserve what's in visibleFields)
                                                            const rowId = fieldId;

                                                            const fieldProp = {
                                                                label: standardField ? standardField.label : customField?.label,
                                                                icon: standardField ? standardField.icon : '📋',
                                                                type: isCustom && customField ? customField.type : undefined
                                                            };

                                                            return (
                                                                <SortableFieldRow
                                                                    key={rowId}
                                                                    id={rowId}
                                                                    field={fieldProp}
                                                                    isCustom={isCustom}
                                                                    toggleVisible={toggleVisible}
                                                                />
                                                            );
                                                        })}
                                                    </SortableContext>
                                                </DndContext>

                                                {visibleFields.length === 0 && (
                                                    <div className="text-center py-4 text-sm text-muted-foreground">
                                                        {t('settings.fields.noActive')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Inactive Fields */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <Label className="text-sm font-medium">{t('settings.fields.available')}</Label>
                                            </div>

                                            {/* Search Input */}
                                            <div className="relative mb-3">
                                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder={t('actions.search') || "Search fields..."}
                                                    value={fieldSearch}
                                                    onChange={(e) => setFieldSearch(e.target.value)}
                                                    className="pl-9 h-9 text-base"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2 border rounded-xl p-2 bg-muted/5 w-full max-h-[300px] overflow-y-auto">
                                                {(() => {
                                                    const filteredAvailable = [...translatedStandardFields, ...fields.map(f => ({ ...f, id: f.id, originalId: f.id, icon: '📋' }))]
                                                        .filter(f => !visibleFields.includes(f.id) && !visibleFields.includes((f as any).key_name))
                                                        .filter(f => {
                                                            if (!fieldSearch) return true;
                                                            const searchLower = fieldSearch.toLowerCase();
                                                            return f.label?.toLowerCase().includes(searchLower) || (f as any).key_name?.toLowerCase().includes(searchLower);
                                                        });

                                                    if (filteredAvailable.length === 0) {
                                                        return (
                                                            <div className="text-center py-8 text-muted-foreground text-sm">
                                                                {fieldSearch ? (
                                                                    <span>No fields found matching "{fieldSearch}"</span>
                                                                ) : (
                                                                    <span>All available fields are active</span>
                                                                )}
                                                            </div>
                                                        );
                                                    }

                                                    return filteredAvailable.map(field => {
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        const customField = field as any;
                                                        const isCustom = !!customField.originalId;

                                                        return (
                                                            <div key={isCustom ? customField.originalId : field.id} className="flex items-center gap-3 p-2 bg-card/50 border border-dashed rounded-lg">
                                                                <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden opacity-70">
                                                                    <span className="text-xl flex-shrink-0">{field.icon}</span>
                                                                    <div className="flex flex-col min-w-0">
                                                                        <span className="text-base font-medium truncate">{field.label}</span>
                                                                    </div>

                                                                    {isCustom ? (
                                                                        <span className="text-[10px] uppercase bg-muted px-1 rounded text-muted-foreground flex-shrink-0 ml-auto">{customField.type}</span>
                                                                    ) : (
                                                                        <span className="text-[10px] uppercase bg-primary/5 px-1 rounded text-primary/70 flex-shrink-0 border border-primary/10 font-semibold tracking-wider ml-auto">{t('fields.system')}</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {isCustom && (
                                                                        <>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    if (customField.originalId) {
                                                                                        setEditingFieldId(customField.originalId);
                                                                                        setNewLabel(customField.label);
                                                                                        setNewType(customField.type);
                                                                                        setSheetMode('edit_field');
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <Pencil className="w-4 h-4" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    if (customField.originalId) setDeleteConfirm({ type: 'field', id: customField.originalId });
                                                                                }}
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </Button>
                                                                        </>
                                                                    )}
                                                                    <Switch
                                                                        checked={false}
                                                                        onCheckedChange={() => toggleVisible(field.id)} // id is now robust (UUID for custom, string for standard)
                                                                        className="flex-shrink-0"
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Transaction Type */}
                                    <div className="space-y-4 w-full">
                                        <Label>{t('settings.categories.transactionType')}</Label>
                                        <div className="flex bg-muted/30 p-1 rounded-lg">
                                            {(['none', 'expense', 'income'] as const).map((type) => (
                                                <Button
                                                    key={type}
                                                    variant={catTransactionType === type ? 'default' : 'ghost'}
                                                    size="sm"
                                                    className={cn(
                                                        "flex-1 capitalize",
                                                        catTransactionType === type && type === 'expense' && "bg-red-500 hover:bg-red-600",
                                                        catTransactionType === type && type === 'income' && "bg-blue-500 hover:bg-blue-600",
                                                        catTransactionType === 'none' && type === 'none' && "bg-secondary text-secondary-foreground"
                                                    )}
                                                    onClick={() => setCatTransactionType(type)}
                                                >
                                                    {type === 'none' && t('settings.categories.typeNone')}
                                                    {type === 'expense' && t('settings.categories.typeExpense')}
                                                    {type === 'income' && t('settings.categories.typeIncome')}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-12 text-base mt-2"
                                    onClick={handleSaveCategory}
                                    disabled={isSaving}
                                >
                                    {isSaving ? t('actions.saving') : t('settings.categories.saveConfig')}
                                </Button>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Confirm Delete Sheet */}
            <Sheet open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                <SheetContent side="bottom" className="pb-safe pt-6">
                    <SheetHeader className="mb-4 text-left">
                        <SheetTitle className="text-destructive flex items-center gap-2">
                            <Trash2 className="w-5 h-5" />
                            {t('settings.confirmDelete.title', { type: deleteConfirm?.type === 'category' ? t('settings.confirmDelete.category') : t('settings.confirmDelete.field') })}
                        </SheetTitle>
                    </SheetHeader>
                    <div className="flex gap-3 mt-6">
                        <Button variant="outline" className="flex-1 h-12" onClick={() => setDeleteConfirm(null)}>{t('actions.cancel')}</Button>
                        <Button variant="destructive" className="flex-1 h-12" onClick={handleDelete} disabled={isSaving}>
                            {isSaving ? t('actions.deleting') : t('actions.delete')}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div >
    );
}
