'use client'

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Calendar, ChevronDown, Filter } from "lucide-react"

export function AnalyticsControls({ years }: { years: number[] }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const period = searchParams.get('period') || 'ALL'
    const selectedYear = searchParams.get('year') || new Date().getFullYear().toString()
    const selectedMonth = searchParams.get('month') || (new Date().getMonth() + 1).toString()

    // Helper to update params
    const updateParams = (updates: Record<string, string>) => {
        console.log('Updating params:', updates)
        const params = new URLSearchParams(searchParams.toString())
        Object.entries(updates).forEach(([key, value]) => {
            if (value) params.set(key, value)
            else params.delete(key)
        })
        const newUrl = `${pathname}?${params.toString()}`
        console.log('Pushing URL:', newUrl)
        router.push(newUrl)
        router.refresh() // Force server re-fetch
    }

    const MONTHS = [
        { val: '1', label: 'January' },
        { val: '2', label: 'February' },
        { val: '3', label: 'March' },
        { val: '4', label: 'April' },
        { val: '5', label: 'May' },
        { val: '6', label: 'June' },
        { val: '7', label: 'July' },
        { val: '8', label: 'August' },
        { val: '9', label: 'September' },
        { val: '10', label: 'October' },
        { val: '11', label: 'November' },
        { val: '12', label: 'December' },
    ]

    return (
        <div className="manga-panel p-4 flex flex-col md:flex-row items-center gap-4 bg-slate-50 border-2 border-black shadow-[4px_4px_0_0_#000]">
            <div className="flex items-center gap-2 text-sm font-black uppercase text-slate-500 mr-auto">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
            </div>

            {/* PERIOD SELECTOR */}
            <div className="flex rounded-none border-2 border-black bg-white">
                {(['ALL', 'YEARLY', 'MONTHLY'] as const).map(p => (
                    <button
                        key={p}
                        onClick={() => {
                            if (p === 'ALL') {
                                updateParams({ period: 'ALL', year: '', month: '' })
                            } else if (p === 'YEARLY') {
                                // Force set year if missing
                                updateParams({ period: p, year: selectedYear })
                            } else if (p === 'MONTHLY') {
                                // Force set year/month if missing
                                updateParams({ period: p, year: selectedYear, month: selectedMonth })
                            }
                        }}
                        className={`px-4 py-2 text-xs font-black uppercase transition-colors ${period === p
                            ? 'bg-black text-white'
                            : 'bg-white text-black hover:bg-slate-100'}`}
                    >
                        {p}
                    </button>
                ))}
            </div>

            {/* YEAR SELECTOR (Visible for Yearly & Monthly) */}
            {period !== 'ALL' && (
                <div className="relative">
                    <select
                        value={selectedYear}
                        onChange={(e) => updateParams({ year: e.target.value, month: selectedMonth })}
                        className="appearance-none bg-white border-2 border-black px-4 py-2 pr-8 text-xs font-bold font-mono uppercase focus:outline-none cursor-pointer hover:bg-yellow-50"
                    >
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
            )}

            {/* MONTH SELECTOR (Visible for Monthly) */}
            {period === 'MONTHLY' && (
                <div className="relative">
                    <select
                        value={selectedMonth}
                        onChange={(e) => updateParams({ month: e.target.value, year: selectedYear })}
                        className="appearance-none bg-white border-2 border-black px-4 py-2 pr-8 text-xs font-bold font-mono uppercase focus:outline-none cursor-pointer hover:bg-yellow-50"
                    >
                        {MONTHS.map(m => (
                            <option key={m.val} value={m.val}>{m.label}</option>
                        ))}
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
            )}
        </div>
    )
}
