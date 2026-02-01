import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Trophy, PieChart as PieIcon } from 'lucide-react'
import { getCategoryBreakdown, getDailyTrend, getMemberStats } from '@/lib/logic/analytics'
import { CategoryPie, TrendChart, MemberBar } from '@/components/features/analytics/MangaCharts'
import { AnalyticsControls } from '@/components/features/analytics/AnalyticsControls'
import { formatCurrency } from '@/lib/utils'

export default async function AnalyticsPage({ params, searchParams }: { params: Promise<{ folderId: string }>, searchParams: Promise<{ period?: string, year?: string, month?: string }> }) {
    const { folderId } = await params
    const { period = 'ALL', year = '', month = '' } = await searchParams

    const supabase = await createClient()

    // 1. Fetch Folder
    const { data: folder } = await supabase.from('folders').select('name, currency').eq('id', folderId).single()
    if (!folder) notFound()

    // 2. Fetch Members
    const { data: rawMembers } = await supabase.from('folder_members').select('id, temp_name, user:users(display_name, email)').eq('folder_id', folderId)
    const members = (rawMembers || []).map((m: any) => ({
        id: m.id,
        displayName: m.temp_name || m.user?.display_name || m.user?.email?.split('@')[0] || 'Unknown'
    }))

    // 3. Fetch Available Years (Before filtering to populate dropdown)
    const { data: allDates } = await supabase.from('expenses').select('date').eq('folder_id', folderId)
    const availableYears = Array.from(new Set((allDates || []).map((exp: any) => new Date(exp.date).getFullYear()))).sort((a: any, b: any) => b - a) as number[]

    // 4. Prepare Filter Range
    let startDate: string | null = null
    let endDate: string | null = null

    if (period === 'YEARLY' && year) {
        startDate = `${year}-01-01`
        endDate = `${Number(year) + 1}-01-01`
    } else if (period === 'MONTHLY' && year && month) {
        // Handle Dec->Jan transition
        const nextMonth = Number(month) === 12 ? 1 : Number(month) + 1
        const nextYear = Number(month) === 12 ? Number(year) + 1 : Number(year)
        // Pad months to ensure "02", "03", etc.
        startDate = `${year}-${month.padStart(2, '0')}-01`
        endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`
    }

    // 5. Fetch Expenses (Filtered)
    let query = supabase
        .from('expenses')
        .select('*, paid_by_member_id')
        .eq('folder_id', folderId)
        .order('date', { ascending: true })

    if (startDate && endDate) {
        query = query.gte('date', startDate).lt('date', endDate)
    }

    const { data: expenses } = await query

    if (!expenses) return <div>No data</div>

    const filteredExpenses = expenses

    // 6. Process Data
    const categoryData = getCategoryBreakdown(filteredExpenses)
    const trendData = getDailyTrend(filteredExpenses)
    const memberData = getMemberStats(filteredExpenses, members)

    // KPIs
    const totalSpent = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const topSpender = memberData.length > 0 ? memberData[0] : null
    const avgDaily = trendData.length > 0 ? totalSpent / trendData.length : 0

    return (
        <div className="min-h-screen bg-white p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 border-b-4 border-black pb-6">
                <Link href={`/folder/${folderId}`} className="manga-button h-10 w-10 flex items-center justify-center p-0">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-4xl font-black uppercase manga-title leading-none">Battle Report</h1>
                    <p className="font-mono text-sm mt-1 uppercase text-slate-500">
                        Analytics • {folder.name}
                    </p>
                </div>
            </div>



            {/* Controls */}
            <AnalyticsControls years={availableYears} />

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="manga-panel p-6 bg-yellow-50">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5" />
                        <h3 className="font-black uppercase text-xs">Total Power</h3>
                    </div>
                    <p className="text-4xl font-black tracking-tighter">
                        {formatCurrency(totalSpent, folder.currency)}
                    </p>
                </div>
                <div className="manga-panel p-6 bg-black text-white">
                    <div className="flex items-center gap-2 mb-2 text-yellow-400">
                        <Trophy className="w-5 h-5" />
                        <h3 className="font-black uppercase text-xs">MVP (Paid Most)</h3>
                    </div>
                    <p className="text-2xl font-black truncate text-yellow-300">
                        {topSpender ? topSpender.name : 'N/A'}
                    </p>
                    <p className="font-mono text-sm text-slate-400">
                        {topSpender ? formatCurrency(topSpender.paid, folder.currency) : '-'}
                    </p>
                </div>
                <div className="manga-panel p-6">
                    <div className="flex items-center gap-2 mb-2 text-slate-500">
                        <PieIcon className="w-5 h-5" />
                        <h3 className="font-black uppercase text-xs">Avg Daily Burn</h3>
                    </div>
                    <p className="text-3xl font-black font-mono">
                        {formatCurrency(avgDaily, folder.currency)}
                    </p>
                </div>
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Trend */}
                <div className="manga-panel p-6 lg:col-span-2">
                    <h3 className="font-black uppercase text-lg mb-6 flex items-center gap-2">
                        <span className="bg-black text-white px-2 py-1 text-xs">GRPH-01</span>
                        Spending Timeline
                    </h3>
                    <TrendChart key={`${period}-${year}-${month}-trend`} data={trendData} />
                </div>

                {/* Categories */}
                <div className="manga-panel p-6">
                    <h3 className="font-black uppercase text-lg mb-6 flex items-center gap-2">
                        <span className="bg-black text-white px-2 py-1 text-xs">GRPH-02</span>
                        Resource Allocation
                    </h3>
                    <CategoryPie key={`${period}-${year}-${month}-cat`} data={categoryData} />
                </div>

                {/* Members */}
                <div className="manga-panel p-6">
                    <h3 className="font-black uppercase text-lg mb-6 flex items-center gap-2">
                        <span className="bg-black text-white px-2 py-1 text-xs">GRPH-03</span>
                        Member Contributions
                    </h3>
                    <MemberBar key={`${period}-${year}-${month}-mem`} data={memberData} />
                </div>
            </div>
        </div>
    )
}
