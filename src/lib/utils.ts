// src/lib/utils.ts
import { format, formatDistanceToNow, isAfter, parseISO } from 'date-fns';

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}




export function formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'MMM dd, yyyy');
}

export function formatDateTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'MMM dd, yyyy hh:mm a');
}

export function formatRelativeTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function isOverdue(dueDate: string | Date | null): boolean {
    if (!dueDate) return false;
    const dateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
    return isAfter(new Date(), dateObj);
}

export function getStatusColor(status: string): string {
    const colors = {
        // Project statuses
        ACTIVE: 'bg-green-100 text-green-800 border-green-200',
        COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200',
        ON_HOLD: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        CANCELLED: 'bg-red-100 text-red-800 border-red-200',

        // Task statuses
        TODO: 'bg-gray-100 text-gray-800 border-gray-200',
        IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
        DONE: 'bg-green-100 text-green-800 border-green-200',
        BLOCKED: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
}

export function getPriorityColor(priority: string): string {
    const colors = {
        LOW: 'bg-gray-100 text-gray-600 border-gray-200',
        MEDIUM: 'bg-blue-100 text-blue-600 border-blue-200',
        HIGH: 'bg-orange-100 text-orange-600 border-orange-200',
        URGENT: 'bg-red-100 text-red-600 border-red-200',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-600 border-gray-200';
}