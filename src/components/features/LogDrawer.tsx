"use client";

import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Copy, X, Trash2, Save, Circle, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { createLog, updateLog, deleteLog, getFieldDefinitions, getCategories } from '@/app/actions';
import { LogCategory, FieldDefinition, Category } from '@/lib/types';
import { createClient } from '@/lib/supabase';
import { useLogContext } from '@/components/providers/LogProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface LogDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LogDrawer({ open, onOpenChange }: LogDrawerProps) {
    const { t } = useLanguage();
    const { selectedLog, closeDrawer } = useLogContext();

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [title, setTitle] = useState('');
    const [amountStr, setAmountStr] = useState('');
    const [sign, setSign] = useState(1);
    const [category, setCategory] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [memo, setMemo] = useState('');
    const [emoji, setEmoji] = useState('📅'); // Default emoji
    const [status, setStatus] = useState<string>('Pending');
    const [imageUrlInput, setImageUrlInput] = useState('');
    const [notificationTime, setNotificationTime] = useState<Date | undefined>(undefined);

    // Dynamic Fields & Categories State
    const [customFields, setCustomFields] = useState<FieldDefinition[]>([]);
    const [categoriesList, setCategoriesList] = useState<Category[]>([]);
    const [customData, setCustomData] = useState<Record<string, any>>({}); // eslint-disable-line @typescript-eslint/no-explicit-any

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
            // Fix: Parse dates as local components to avoid timezone shifts
            const parseLocal = (s: string) => {
                const [y, m, d] = s.split('-').map(Number);
                return new Date(y, m - 1, d);
            };

            setDate(parseLocal(selectedLog.date));
            setTitle(selectedLog.title);
            const val = selectedLog.amount;
            setAmountStr(val ? Math.abs(val).toString() : '');
            setSign(val && val < 0 ? -1 : 1);
            setCategory(selectedLog.category);
            setStartTime(selectedLog.start_time || '');
            setEndTime(selectedLog.end_time || '');
            setEndDate(selectedLog.end_date ? parseLocal(selectedLog.end_date) : undefined);
            setMemo(selectedLog.memo || '');
            setEmoji(selectedLog.emoji || '📅');
            setStatus(selectedLog.status || 'Planned'); // Default to Planned if missing in valid log
            setImageUrlInput(selectedLog.image_url || '');
            setNotificationTime(selectedLog.notification_time ? new Date(selectedLog.notification_time) : undefined);
            setCustomData(selectedLog.custom_data || {});
        } else {
            // Reset if adding new
            setDate(new Date());
            setTitle('');
            setAmountStr('');

            // Auto-select default category
            const defaultCat = categoriesList.find(c => c.is_default);
            setCategory(defaultCat?.name || '');

            setStartTime('');
            setEndTime('');
            setEndDate(undefined);
            setMemo('');
            setEmoji('📅');
            setStatus('Pending'); // Default for new log
            setCustomData({});
            setImageUrlInput('');
            setNotificationTime(undefined);
        }
    }, [selectedLog, open, categoriesList]);

    // Apply Default Transaction Type on Category Change
    React.useEffect(() => {
        if (selectedLog && selectedLog.category === category) return; // Don't override existing log's original sign

        const catDef = categoriesList.find(c => c.name === category);
        if (catDef?.default_transaction_type === 'expense') {
            setSign(-1);
        } else if (catDef?.default_transaction_type === 'income') {
            setSign(1);
        }
    }, [category]);

    const handleDelete = async () => {
        if (!selectedLog) return;
        if (!confirm(t('actions.confirmDelete'))) return;

        try {
            await deleteLog(selectedLog.id);
            closeDrawer();
        } catch (error) {
            console.error('Failed to delete log', error);
        }
    };

    const handleDuplicate = async () => {
        if (!date || !title || !category) {
            alert(t('actions.fillRequired'));
            return;
        }

        try {
            const imageUrl = imageUrlInput || null;

            // Determine status logic based on visibility
            const currentCatDef = categoriesList.find(c => c.name === category);
            const visibleFields = currentCatDef?.settings?.visible_fields || [];
            const isStatusVisible = visibleFields.includes('status');
            const isEndDateVisible = visibleFields.includes('end_date');

            const finalStatus = isStatusVisible ? status : (endDate ? 'Completed' : 'Planned');
            const finalEndDate = (isEndDateVisible && endDate) ? format(endDate, 'yyyy-MM-dd') : null;

            // Create new log with current form data
            await createLog({
                date: format(date, 'yyyy-MM-dd'),
                title,
                category: category as LogCategory,
                amount: amountStr ? parseFloat(amountStr) * sign : null,
                memo: memo || null,
                status: finalStatus as any,
                image_url: imageUrl,
                emoji,
                start_time: startTime || null,
                end_time: endTime || null,
                end_date: finalEndDate,
                notification_time: notificationTime ? notificationTime.toISOString() : null,
                custom_data: customData,
            });

            // Reset form & Close
            setTitle('');
            setAmountStr('');
            setSign(1);
            setMemo('');
            setCategory('');
            setEmoji('📅');
            setStartTime('');
            setEndTime('');
            setImageUrlInput('');
            setDate(new Date());
            setNotificationTime(undefined);

            onOpenChange(false);
        } catch (error) {
            console.error('Failed to duplicate log', error);
        }
    };

    const handleSave = async () => {
        console.log('handleSave called', { date, title, category });
        if (!date || !title || !category) {
            alert(t('actions.fillRequired'));
            return;
        }

        try {
            const imageUrl = imageUrlInput || null;

            // Determine status logic based on visibility
            const currentCatDef = categoriesList.find(c => c.name === category);
            const visibleFields = currentCatDef?.settings?.visible_fields || [];
            const isStatusVisible = visibleFields.includes('status');
            const isEndDateVisible = visibleFields.includes('end_date');

            const finalStatus = isStatusVisible ? status : (endDate ? 'Completed' : 'Planned');
            const finalEndDate = (isEndDateVisible && endDate) ? format(endDate, 'yyyy-MM-dd') : null;

            const payload = {
                date: format(date, 'yyyy-MM-dd'),
                title,
                category: category as LogCategory,
                amount: amountStr ? parseFloat(amountStr) * sign : null,
                memo: memo || null,
                status: finalStatus as any,
                image_url: imageUrl,
                emoji,
                start_time: startTime || null,
                end_time: endTime || null,
                end_date: finalEndDate,
                notification_time: notificationTime ? notificationTime.toISOString() : null,
                custom_data: customData,
            };

            if (selectedLog) {
                // Update
                await updateLog(selectedLog.id, payload);
            } else {
                // Create
                await createLog(payload);
            }

            // Share Logic
            const shouldShare = customData['share'] === true;

            if (shouldShare && typeof navigator !== 'undefined' && navigator.share) {
                try {
                    const shareText = `${title}\n${memo ? '\n' + memo : ''}\n\nVia LifeLog`;
                    let shareData: ShareData = {
                        title: title,
                        text: shareText,
                    };

                    if (imageUrlInput) {
                        try {
                            // Try to fetch the image to share as a file
                            const response = await fetch(imageUrlInput);
                            const blob = await response.blob();
                            const file = new File([blob], "log-image.jpg", { type: blob.type });

                            // Check if sharing files is supported
                            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                // Clipboard Strategy for Instagram Stories
                                try {
                                    await navigator.clipboard.writeText(shareText);
                                    // Optional: specific message for the user
                                    alert("Text copied! Paste it in Instagram.");
                                } catch (clipboardError) {
                                    console.warn('Clipboard write failed', clipboardError);
                                }

                                shareData = {
                                    files: [file],
                                    title: title,
                                    // Intentionally omit text/url to force image-only share (better for Stories)
                                };
                            } else {
                                // Fallback to URL if file sharing not supported
                                shareData.url = imageUrlInput;
                            }
                        } catch (e) {
                            console.warn('Image fetch for share failed (likely CORS), falling back to URL', e);
                            shareData.url = imageUrlInput;
                        }
                    }

                    await navigator.share(shareData);
                } catch (shareError) {
                    console.log('Share cancelled or failed', shareError);
                }
            }

            // Reset form
            setTitle('');
            setAmountStr('');
            setSign(1);
            setMemo('');
            setCategory('');
            setEmoji('📅');
            setStartTime('');
            setEndTime('');
            setImageUrlInput('');
            setDate(new Date());

            onOpenChange(false);
        } catch (error) {
            console.error('Failed to save log', error);
            // Ideally show toast error here
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="h-[90vh] sm:max-w-md rounded-t-[10px] pb-safe overflow-hidden">
                <SheetHeader className="mb-2 text-left">
                    <SheetTitle>{selectedLog ? t('actions.editLog') : t('actions.newLog')}</SheetTitle>
                </SheetHeader>

                <div className="flex-1 grid gap-4 py-0 pt-2 overflow-y-auto px-1 pb-24" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
                    <div className="grid gap-2">
                        <Label htmlFor="title">{t('fields.title')}</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('fields.titlePlaceholder')}
                            className="text-lg"
                        />
                    </div>

                    {/* Logic moved to dynamic loop for Sort Order support */}

                    <div className="grid gap-2">
                        <Label htmlFor="category">{t('fields.category')}</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('fields.selectCategory')} />
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
                                    <div className="p-2 text-sm text-muted-foreground text-center">{t('common.loading')}</div>
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
                            if (fieldId === 'date') {
                                // Dynamic Label Logic: If end_date is present, call this "Start Date", else just "Date"
                                const hasEndDate = orderedIds.includes('end_date');
                                const dateLabel = hasEndDate ? t('fields.startDate') : t('fields.date');

                                return (
                                    <div key="date" className="grid gap-2">
                                        <Label htmlFor="date">{dateLabel}</Label>
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
                                                    {date ? format(date, "PPP") : <span>{t('fields.pickDate')}</span>}
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
                                );
                            }
                            if (fieldId === 'end_date') {
                                return (
                                    <div key="end_date" className="grid gap-2">
                                        <Label htmlFor="end_date">{t('fields.end_date')}</Label>
                                        <div className="flex gap-2">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "flex-1 justify-start text-left font-normal",
                                                            !endDate && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {endDate ? format(endDate, "PPP") : <span>{t('fields.pickDate')}</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={endDate}
                                                        onSelect={setEndDate}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            {endDate && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="shrink-0 text-muted-foreground hover:text-foreground"
                                                    onClick={() => setEndDate(undefined)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            }
                            if (fieldId === 'time') {
                                return (
                                    <div key="time" className="grid gap-2">
                                        <Label htmlFor="time">{t('fields.time')}</Label>
                                        <Input
                                            id="time"
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                        />
                                    </div>
                                );
                            }
                            if (fieldId === 'notification_time') {
                                return (
                                    <div key="notification_time" className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="notification_time" className="flex items-center gap-2">
                                                <span>{t('fields.notification_time')}</span>
                                                {notificationTime && (
                                                    <span className="text-xs text-muted-foreground font-normal">
                                                        {format(notificationTime, "MMM d, p")}
                                                    </span>
                                                )}
                                            </Label>
                                            {notificationTime && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                                    onClick={() => setNotificationTime(undefined)}
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            )}
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <Switch
                                                checked={!!notificationTime}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        const now = new Date();
                                                        // Default to next hour
                                                        now.setMinutes(0, 0, 0);
                                                        now.setHours(now.getHours() + 1);
                                                        setNotificationTime(now);
                                                    } else {
                                                        setNotificationTime(undefined);
                                                    }
                                                }}
                                            />
                                            {notificationTime && (
                                                <Input
                                                    type="datetime-local"
                                                    value={format(notificationTime, "yyyy-MM-dd'T'HH:mm")}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val) setNotificationTime(new Date(val));
                                                    }}
                                                    className="flex-1"
                                                />
                                            )}
                                        </div>
                                        {notificationTime && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full mt-2 gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                                                onClick={() => {
                                                    if (!notificationTime || !title) {
                                                        alert(t('actions.fillRequired'));
                                                        return;
                                                    }
                                                    const startDate = notificationTime;
                                                    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Default 1 hour
                                                    const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');

                                                    const details = encodeURIComponent(`${memo || ''}\n\nVia LifeLog`);
                                                    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${details}&dates=${formatDate(startDate)}/${formatDate(endDate)}`;
                                                    window.open(url, '_blank');
                                                }}
                                            >
                                                <CalendarIcon className="w-4 h-4" />
                                                <span>Add to Google Calendar</span>
                                            </Button>
                                        )}
                                    </div>
                                );
                            }
                            if (fieldId === 'share') {
                                return (
                                    <div key="share" className="flex items-center justify-between py-2 border rounded-md px-3 bg-muted/5">
                                        <Label htmlFor="share" className="flex-1 font-medium">{t('fields.share')}</Label>
                                        <Switch
                                            id="share"
                                            checked={!!customData['share']}
                                            onCheckedChange={(checked) => setCustomData({ ...customData, share: checked })}
                                        />
                                    </div>
                                );
                            }
                            if (fieldId === 'amount') {
                                return (
                                    <div key="amount" className="grid gap-2">
                                        <Label htmlFor="amount">{t('fields.amount')}</Label>
                                        <div className="flex gap-2">
                                            <div className="flex bg-muted rounded-md p-1 shrink-0">
                                                <Button
                                                    type="button"
                                                    variant={sign === 1 ? 'default' : 'ghost'}
                                                    size="sm"
                                                    className={cn("h-8 w-8 p-0 text-lg font-bold", sign === 1 && "bg-blue-500 hover:bg-blue-600")}
                                                    onClick={() => setSign(1)}
                                                >
                                                    +
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={sign === -1 ? 'default' : 'ghost'}
                                                    size="sm"
                                                    className={cn("h-8 w-8 p-0 text-lg font-bold", sign === -1 && "bg-red-500 hover:bg-red-600")}
                                                    onClick={() => setSign(-1)}
                                                >
                                                    -
                                                </Button>
                                            </div>
                                            <Input
                                                id="amount"
                                                type="number"
                                                value={amountStr}
                                                onChange={(e) => setAmountStr(e.target.value)}
                                                placeholder="0.00"
                                                inputMode="decimal"
                                                className="flex-1 text-lg font-medium"
                                            />
                                        </div>
                                    </div>
                                );
                            }
                            if (fieldId === 'memo') {
                                return (
                                    <div key="memo" className="grid gap-2">
                                        <Label htmlFor="memo">{t('fields.note')}</Label>
                                        <textarea
                                            id="memo"
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder={t('fields.notePlaceholder')}
                                            value={memo}
                                            onChange={(e) => setMemo(e.target.value)}
                                        />
                                    </div>
                                );
                            }
                            if (fieldId === 'image_url') {
                                return (
                                    <div key="image_url" className="grid gap-2">
                                        <Label htmlFor="image">{t('fields.image_url')}</Label>
                                        <Input
                                            id="image"
                                            type="url"
                                            placeholder="https://..."
                                            value={imageUrlInput}
                                            onChange={(e) => setImageUrlInput(e.target.value)}
                                        />
                                    </div>
                                );
                            }
                            if (fieldId === 'status') {
                                return (
                                    <div key="status" className="grid gap-2">
                                        <Label htmlFor="status">{t('common.status.label') || 'Status'}</Label>
                                        <Select value={status} onValueChange={setStatus}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pending">
                                                    <div className="flex items-center gap-2">
                                                        <Circle className="w-4 h-4 text-muted-foreground" />
                                                        <span>{t('common.status.pending')}</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="Planned">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-blue-500" />
                                                        <span>{t('common.status.planned')}</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="Completed">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                        <span>{t('common.status.completed')}</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                );
                            }

                            // Custom Fields
                            // Prioritize finding by ID (new way), then key_name (legacy)
                            const field = customFields.find(f => f.id === fieldId || f.key_name === fieldId);
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
                                        {field.type === 'date' && (
                                            <Input
                                                id={field.key_name}
                                                type="date"
                                                value={customData[field.key_name] || ''}
                                                onChange={e => setCustomData({ ...customData, [field.key_name]: e.target.value })}
                                            />
                                        )}
                                        {field.type === 'boolean' && (
                                            <div className="flex items-center justify-between py-2 border rounded-md px-3 bg-muted/5">
                                                <Label htmlFor={field.key_name} className="flex-1 font-medium">{field.label}</Label>
                                                <Switch
                                                    id={field.key_name}
                                                    checked={!!customData[field.key_name]}
                                                    onCheckedChange={(checked) => setCustomData({ ...customData, [field.key_name]: checked })}
                                                />
                                            </div>
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

                <SheetFooter className="absolute bottom-4 left-4 right-4 pb-safe">
                    {selectedLog ? (
                        <div className="flex w-full border rounded-xl overflow-hidden shadow-sm divide-x bg-background">
                            <Button
                                variant="ghost"
                                onClick={handleDelete}
                                className="flex-1 h-12 rounded-none hover:bg-destructive/10 text-destructive gap-1.5 text-sm"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>{t('actions.delete')}</span>
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={handleDuplicate}
                                className="flex-1 h-12 rounded-none hover:bg-muted gap-1.5 text-sm"
                            >
                                <Copy className="w-4 h-4" />
                                <span>{t('actions.saveAsCopy')}</span>
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={handleSave}
                                className="flex-1 h-12 rounded-none hover:bg-muted text-primary gap-1.5 text-sm font-medium"
                            >
                                <Save className="w-4 h-4" />
                                <span>{t('actions.updateLog')}</span>
                            </Button>
                        </div>
                    ) : (
                        <Button onClick={handleSave} className="w-full h-12 text-lg">
                            {t('actions.saveLog')}
                        </Button>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet >
    );
}
