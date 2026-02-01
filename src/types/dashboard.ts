export type DashboardType = "travel" | "household" | "event" | "other";

export interface Dashboard {
    id: string;
    title: string;
    coverImageUrl: string | null;
    coverImageSettings?: {
        offsetY: number; // 0-100 percentage
        zoom: number;    // 1-2 scale
    };
    currencySymbol: string;
    themeColor: string;
    dashboardType: DashboardType;
    createdAt: Date;
    order?: number;
}

export interface DashboardWithBalance extends Dashboard {
    netBalance: number;
    totalSpend: number;
    expenseCount: number;
}

export const THEME_COLORS = [
    { id: "default", color: "#e5e7eb", name: "Gray" },
    { id: "blue", color: "#bfdbfe", name: "Blue" },
    { id: "green", color: "#bbf7d0", name: "Green" },
    { id: "yellow", color: "#fef08a", name: "Yellow" },
    { id: "pink", color: "#fbcfe8", name: "Pink" },
    { id: "purple", color: "#e9d5ff", name: "Purple" },
    { id: "orange", color: "#fed7aa", name: "Orange" },
];

export const DASHBOARD_TYPE_LABELS: Record<DashboardType, { label: string; emoji: string }> = {
    travel: { label: "Travel", emoji: "✈️" },
    household: { label: "Household", emoji: "🏠" },
    event: { label: "Event", emoji: "🎉" },
    other: { label: "Other", emoji: "📁" },
};
