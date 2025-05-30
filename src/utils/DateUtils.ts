import { format } from 'date-fns';

export class DateUtils {
    /**
     * Format a timestamp into a human-readable date string
     * @param timestamp - Unix timestamp in milliseconds
     * @param dateFormat - Date format string (date-fns format)
     * @returns Formatted date string
     */
    static formatDate(timestamp: number, dateFormat: string): string {
        const date = new Date(timestamp);
        try {
            return format(date, dateFormat);
        } catch (e) {
            // If invalid format string, fall back to default
            return format(date, 'MMM d, yyyy');
        }
    }

    /**
     * Get a date group label for grouping files by date
     * @param timestamp - Unix timestamp in milliseconds
     * @returns Date group label (e.g. "Today", "Yesterday", "Previous 7 Days", etc.)
     */
    static getDateGroup(timestamp: number): string {
        const now = new Date();
        const date = new Date(timestamp);
        
        // Reset times to start of day for comparison
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 30);
        
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        if (dateOnly.getTime() === today.getTime()) {
            return 'Today';
        } else if (dateOnly.getTime() === yesterday.getTime()) {
            return 'Yesterday';
        } else if (dateOnly > weekAgo) {
            return 'Previous 7 Days';
        } else if (dateOnly > monthAgo) {
            return 'Previous 30 Days';
        } else if (date.getFullYear() === now.getFullYear()) {
            // Same year - show month name
            return format(date, 'MMMM');
        } else {
            // Previous years - show year
            return date.getFullYear().toString();
        }
    }
}