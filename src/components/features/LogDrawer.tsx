"use client";

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { createLog, updateLog, deleteLog, getFieldDefinitions, getCategories } from '@/app/actions';
import { LogCategory, FieldDefinition, Category } from '@/lib/types';
import { createClient } from '@/lib/supabase';
import { useLogContext } from '@/components/providers/LogProvider';

interface LogDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LogDrawer({ open, onOpenChange }: LogDrawerProps) {
    const { selectedLog, closeDrawer } = useLogContext();

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [memo, setMemo] = useState('');
    const [emoji, setEmoji] = useState('📅'); // Default emoji
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Dynamic Fields & Categories State
    const [customFields, setCustomFields] = useState<FieldDefinition[]>([]);
    const [categoriesList, setCategoriesList] = useState<Category[]>([]);
    const [customData, setCustomData] = useState<Record<string, any>>({});

    // Fetch definitions on load and when drawer opens
    React.useEffect(() => {
        if (open) {
            getFieldDefinitions().then(setCustomFields);
            getCategories().then(setCategoriesList);
        }
    }, [open]);

    // Sync form when selectedLog changes
    React.useEffect(() => {
        if (selectedLog) {
            setDate(new Date(selectedLog.date));
            setTitle(selectedLog.title);
            setAmount(selectedLog.amount?.toString() || '');
            setCategory(selectedLog.category);
            setStartTime(selectedLog.start_time || '');
            setEndTime(selectedLog.end_time || '');
            setMemo(selectedLog.memo || '');
            setEmoji(selectedLog.emoji || '📅');
            setCustomData(selectedLog.custom_data || {});
        } else {
            // Reset if adding new
            setDate(new Date());
            setTitle('');
            setAmount('');

            // Auto-select default category
            const defaultCat = categoriesList.find(c => c.is_default);
            setCategory(defaultCat?.name || '');

            setStartTime('');
            setEndTime('');
            setMemo('');
            setEmoji('📅');
            setCustomData({});
            setImageFile(null);
        }
    }, [selectedLog, open, categoriesList]);

    const commonEmojis = ['🚗', '🍳', '🛒', '🏥', '📅', '🎉', '💼', '🏠', '🏋️', '📖'];

    const isFieldVisible = (fieldId: string) => {
        if (!category) return true;
        const currentCat = categoriesList.find(c => c.name === category);
        if (!currentCat?.settings?.visible_fields) return true;
        return currentCat.settings.visible_fields.includes(fieldId);
    };

    const handleDelete = async () => {
        if (!selectedLog) return;
        if (!confirm('Are you sure you want to delete this log?')) return;

        try {
            await deleteLog(selectedLog.id);
            closeDrawer();
        } catch (error) {
            console.error('Failed to delete log', error);
        }
    };

    const handleSave = async () => {
        if (!date || !title || !category) return;

        try {
            let imageUrl: string | null = null;

            if (imageFile) {
                setIsUploading(true);
                const supabase = createClient();
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(filePath, imageFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('images')
                    .getPublicUrl(filePath);

                imageUrl = publicUrl;
                setIsUploading(false);
            }

            if (selectedLog) {
                // Update
                await updateLog(selectedLog.id, {
                    date: format(date, 'yyyy-MM-dd'),
                    title,
                    category: category as LogCategory,
                    amount: amount ? parseFloat(amount) : null,
                    memo: memo || null,
                    image_url: imageUrl || selectedLog.image_url, // Keep old if not new
                    emoji,
                    start_time: startTime || null,
                    end_time: endTime || null,
                    custom_data: customData,
                });
            } else {
                // Create
                await createLog({
                    date: format(date, 'yyyy-MM-dd'),
                    title,
                    category: category as LogCategory,
                    amount: amount ? parseFloat(amount) : null,
                    memo: memo || null,
                    status: 'Completed',
                    image_url: imageUrl,
                    emoji,
                    start_time: startTime || null,
                    end_time: endTime || null,
                    custom_data: customData,
                });
            }

            // Instagram / Share Logic
            const instaField = customFields.find(f => f.label.toLowerCase() === 'instagram' && f.type === 'boolean');
            const shouldShare = instaField && customData[instaField.key_name];

            if (shouldShare && typeof navigator !== 'undefined' && navigator.share) {
                try {
                    const shareData: ShareData = {
                        title: title,
                        text: `${title}\n${memo ? '\n' + memo : ''}\n\nVia LifeLog`,
                    };

                    if (imageFile) {
                        try {
                            if (navigator.canShare && navigator.canShare({ files: [imageFile] })) {
                                shareData.files = [imageFile];
                            }
                        } catch (e) {
                            console.warn('File sharing check failed', e);
                        }
                    }

                    await navigator.share(shareData);
                } catch (shareError) {
                    console.log('Share cancelled or failed', shareError);
                }
            }

            // Reset form
            setTitle('');
            setAmount('');
            setMemo('');
            setCategory('');
            setEmoji('📅');
            setStartTime('');
            setEndTime('');
            setImageFile(null);
            setDate(new Date());

            onOpenChange(false);
        } catch (error) {
            console.error('Failed to save log', error);
            // Ideally show toast error here
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="h-[90vh] sm:max-w-md rounded-t-[10px] pb-safe">
                <SheetHeader className="mb-2 text-left">
                    <SheetTitle>{selectedLog ? 'Edit Log' : 'New Log'}</SheetTitle>
                </SheetHeader>

                <div className="grid gap-4 py-0 pt-2 overflow-y-auto max-h-[calc(100%-80px)] px-1">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Shopping at Costco"
                            className="text-lg"
                        />
                    </div>

                    {/* Date Picker */}
                    <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categoriesList.length > 0 ? (
                                    categoriesList.map(cat => (
                                        <SelectItem key={cat.id} value={cat.name}>
                                            <div className="flex items-center gap-2">
                                                <span>{cat.icon || '🏷️'}</span>
                                                <span>{cat.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className="p-2 text-sm text-muted-foreground text-center">Loading...</div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Dynamic Fields (Ordered) */}
                    {(() => {
                        const currentCat = categoriesList.find(c => c.name === category);
                        const orderedIds = currentCat?.settings?.visible_fields || [];

                        return orderedIds.map(fieldId => {
                            // Standard Fields
                            if (fieldId === 'start_time') {
                                return (
                                    <div key="start_time" className="grid gap-2">
                                        <Label htmlFor="start-time">Start Time</Label>
                                        <Input
                                            id="start-time"
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                        />
                                    </div>
                                );
                            }
                            if (fieldId === 'end_time') {
                                return (
                                    <div key="end_time" className="grid gap-2">
                                        <Label htmlFor="end-time">End Time</Label>
                                        <Input
                                            id="end-time"
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                        />
                                    </div>
                                );
                            }
                            if (fieldId === 'amount') {
                                return (
                                    <div key="amount" className="grid gap-2">
                                        <Label htmlFor="amount">Amount ($)</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            inputMode="decimal"
                                        />
                                    </div>
                                );
                            }
                            if (fieldId === 'memo') {
                                return (
                                    <div key="memo" className="grid gap-2">
                                        <Label htmlFor="memo">Memo</Label>
                                        <textarea
                                            id="memo"
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Additional details..."
                                            value={memo}
                                            onChange={(e) => setMemo(e.target.value)}
                                        />
                                    </div>
                                );
                            }
                            if (fieldId === 'image_url') {
                                return (
                                    <div key="image_url" className="grid gap-2">
                                        <Label htmlFor="image">Image</Label>
                                        <Input
                                            id="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                        />
                                    </div>
                                );
                            }

                            // Custom Fields
                            const field = customFields.find(f => f.key_name === fieldId);
                            if (field && field.is_active) {
                                return (
                                    <div key={field.id} className="grid gap-2">
                                        <Label htmlFor={field.key_name}>{field.label}</Label>
                                        {field.type === 'text' && (
                                            <Input
                                                id={field.key_name}
                                                value={customData[field.key_name] || ''}
                                                onChange={e => setCustomData({ ...customData, [field.key_name]: e.target.value })}
                                            />
                                        )}
                                        {field.type === 'number' && (
                                            <Input
                                                id={field.key_name}
                                                type="number"
                                                value={customData[field.key_name] || ''}
                                                onChange={e => setCustomData({ ...customData, [field.key_name]: e.target.value })}
                                            />
                                        )}
                                        {field.type === 'time' && (
                                            <Input
                                                id={field.key_name}
                                                type="time"
                                                value={customData[field.key_name] || ''}
                                                onChange={e => setCustomData({ ...customData, [field.key_name]: e.target.value })}
                                            />
                                        )}
                                        {/* Fallback for other types */}
                                        {['url', 'email', 'phone'].includes(field.type) && (
                                            <Input
                                                id={field.key_name}
                                                type={field.type === 'phone' ? 'tel' : field.type}
                                                value={customData[field.key_name] || ''}
                                                onChange={e => setCustomData({ ...customData, [field.key_name]: e.target.value })}
                                            />
                                        )}
                                    </div>
                                );
                            }
                            return null;
                        });
                    })()}
                </div>

                <SheetFooter className="absolute bottom-4 left-4 right-4 pb-safe flex gap-3">
                    {selectedLog && (
                        <Button variant="destructive" onClick={handleDelete} className="flex-1 h-12 text-lg">
                            Delete
                        </Button>
                    )}
                    <Button onClick={handleSave} disabled={isUploading} className="flex-1 h-12 text-lg">
                        {isUploading ? 'Uploading...' : (selectedLog ? 'Update Log' : 'Save Log')}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
