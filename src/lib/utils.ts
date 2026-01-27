import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currencyCode: string = 'PHP') {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
    }).format(amount)
}

export function formatDate(dateStr: string) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(new Date(dateStr))
}
