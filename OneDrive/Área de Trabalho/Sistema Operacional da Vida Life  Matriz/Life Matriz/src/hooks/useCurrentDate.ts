'use client';

import { useState, useEffect } from 'react';

interface DateInfo {
    date: Date;
    day: number;
    month: number;
    year: number;
    weekday: string;
    weekdayShort: string;
    monthName: string;
    monthNameShort: string;
    formatted: string;
    formattedLong: string;
    formattedShort: string;
    time: string;
    timeShort: string;
    greeting: string;
    isWeekend: boolean;
    dayOfYear: number;
}

const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const weekdaysShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const monthsShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function getGreeting(hour: number): string {
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
}

function getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

function getDateInfo(date: Date): DateInfo {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const dayOfWeek = date.getDay();
    const hour = date.getHours();
    const minutes = date.getMinutes();

    return {
        date,
        day,
        month: month + 1,
        year,
        weekday: weekdays[dayOfWeek],
        weekdayShort: weekdaysShort[dayOfWeek],
        monthName: months[month],
        monthNameShort: monthsShort[month],
        formatted: `${weekdays[dayOfWeek]}, ${day} de ${months[month]}`,
        formattedLong: `${weekdays[dayOfWeek]}, ${day} de ${months[month]} de ${year}`,
        formattedShort: `${day}/${month + 1}/${year}`,
        time: `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
        timeShort: `${hour}:${minutes.toString().padStart(2, '0')}`,
        greeting: getGreeting(hour),
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        dayOfYear: getDayOfYear(date),
    };
}

// Hook for real-time date/time
export function useCurrentDate(updateInterval: number = 60000): DateInfo {
    const [dateInfo, setDateInfo] = useState<DateInfo>(getDateInfo(new Date()));

    useEffect(() => {
        // Update immediately
        setDateInfo(getDateInfo(new Date()));

        // Update at the specified interval
        const interval = setInterval(() => {
            setDateInfo(getDateInfo(new Date()));
        }, updateInterval);

        // Also update at midnight
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const msUntilMidnight = tomorrow.getTime() - now.getTime();

        const midnightTimeout = setTimeout(() => {
            setDateInfo(getDateInfo(new Date()));
        }, msUntilMidnight);

        return () => {
            clearInterval(interval);
            clearTimeout(midnightTimeout);
        };
    }, [updateInterval]);

    return dateInfo;
}

// Hook for relative time (e.g., "há 5 minutos")
export function useRelativeTime(date: Date | string): string {
    const [relative, setRelative] = useState('');

    useEffect(() => {
        const updateRelative = () => {
            const target = typeof date === 'string' ? new Date(date) : date;
            const now = new Date();
            const diff = now.getTime() - target.getTime();
            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            const weeks = Math.floor(days / 7);
            const months = Math.floor(days / 30);

            if (seconds < 60) {
                setRelative('agora mesmo');
            } else if (minutes < 60) {
                setRelative(`há ${minutes} minuto${minutes > 1 ? 's' : ''}`);
            } else if (hours < 24) {
                setRelative(`há ${hours} hora${hours > 1 ? 's' : ''}`);
            } else if (days < 7) {
                setRelative(`há ${days} dia${days > 1 ? 's' : ''}`);
            } else if (weeks < 4) {
                setRelative(`há ${weeks} semana${weeks > 1 ? 's' : ''}`);
            } else {
                setRelative(`há ${months} mês${months > 1 ? 'es' : ''}`);
            }
        };

        updateRelative();
        const interval = setInterval(updateRelative, 60000);

        return () => clearInterval(interval);
    }, [date]);

    return relative;
}

// Simple function for static date formatting
export function formatDate(date: Date | string, format: 'short' | 'long' | 'full' = 'long'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const info = getDateInfo(d);

    switch (format) {
        case 'short':
            return info.formattedShort;
        case 'full':
            return info.formattedLong;
        default:
            return info.formatted;
    }
}

export default useCurrentDate;
