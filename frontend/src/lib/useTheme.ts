'use client';
import { useEffect } from 'react';
import { useUIStore } from '@/src/stores/ui.store';
import type { Theme } from '@/src/stores/ui.store';

export const useTheme = () => {
    const { currentTheme, setTheme } = useUIStore();

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        const themeToApply = savedTheme || 'dark';
        
        setTheme(themeToApply);
        applyTheme(themeToApply);
    }, []);

    useEffect(() => {
        applyTheme(currentTheme); 
        localStorage.setItem('theme', currentTheme);
    }, [currentTheme]);

    const applyTheme = (theme: Theme) => {
        const htmlElement = document.documentElement;
        htmlElement.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            htmlElement.classList.add('dark');
        } else {
            htmlElement.classList.remove('dark');
        }
    };

    const cycleTheme = () => {
        const themes: Theme[] = ['dark', 'light'];
        const currentIndex = themes.indexOf(currentTheme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        setTheme(nextTheme);
    };

    return { currentTheme, setTheme, cycleTheme };
};