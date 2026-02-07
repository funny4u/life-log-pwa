"use client";

import React, { useState } from 'react';
import { generateSampleData } from '@/app/actions';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus } from 'lucide-react';

interface OnboardingGuideProps {
    onComplete?: () => void;
}

export function OnboardingGuide({ onComplete }: OnboardingGuideProps) {
    const { t, language } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateSample = async () => {
        try {
            setIsLoading(true);
            await generateSampleData(language);
            // Refresh logic is handled by server action revalidatePath
            if (onComplete) onComplete();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 space-y-6 max-w-md mx-auto mt-10">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">
                    {language === 'ko' ? '환영합니다! 👋' : 'Welcome! 👋'}
                </h2>
                <p className="text-muted-foreground">
                    {language === 'ko'
                        ? '아직 기록이 없네요. 어떻게 시작할지 막막하신가요?'
                        : 'No logs yet. Not sure where to start?'}
                </p>
            </div>

            <Card className="w-full border-dashed border-2 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">
                        {language === 'ko' ? '샘플 데이터로 시작하기' : 'Start with Sample Data'}
                    </CardTitle>
                    <CardDescription>
                        {language === 'ko'
                            ? '기본 카테고리와 예시 기록들을 자동으로 만들어 드립니다. 앱의 사용법을 쉽게 익힐 수 있어요.'
                            : 'We will create default categories and sample logs for you. It helps you understand how to use the app.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground bg-muted/30 p-4 rounded-md mx-6 mb-2">
                    <ul className="list-disc pl-4 space-y-1">
                        <li>{language === 'ko' ? '일상, 업무, 운동 카테고리' : 'General, Work, Health categories'}</li>
                        <li>{language === 'ko' ? '기분, 날씨, 우선순위 등 커스텀 필드' : 'Custom fields like Mood, Weather, Priority'}</li>
                        <li>{language === 'ko' ? '예시 기록 3개' : '3 Sample logs'}</li>
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full"
                        onClick={handleCreateSample}
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {language === 'ko' ? '샘플 데이터 생성하기' : 'Generate Sample Data'}
                    </Button>
                </CardFooter>
            </Card>

            <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        {language === 'ko' ? '또는' : 'OR'}
                    </span>
                </div>
            </div>

            <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                    {language === 'ko'
                        ? '직접 처음부터 만들고 싶으신가요?'
                        : 'Want to start from scratch?'}
                </p>
                <Button variant="outline" className="gap-2" onClick={onComplete}>
                    <Plus className="w-4 h-4" />
                    {language === 'ko' ? '새 기록 추가하기' : 'Add New Log'}
                </Button>
            </div>
        </div>
    );
}
