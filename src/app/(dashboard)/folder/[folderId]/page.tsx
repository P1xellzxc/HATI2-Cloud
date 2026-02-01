import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { AddMemberModal } from '@/components/features/folders/AddMemberModal'
import { calculateSettlements } from '@/lib/logic/settlements'
import { SettlementPanel } from '@/components/features/folders/SettlementPanel'
import { ActivityFeed } from '@/components/features/folders/ActivityFeed'

export default async function FolderPage({ params }: { params: Promise<{ folderId: string }> }) {
    const { folderId } = await params
    const supabase = await createClient()

    // 1. Fetch Folder Details
    const { data: folder, error } = await supabase
        .from('folders')
        .select('id, name, currency, icon')
        .eq('id', folderId)
        .single()

    if (error || !folder) {
        console.error('Folder fetch error:', error)
        notFound()
    }

    // 2. Fetch Members (Needed for logic)
    const { data: rawMembers } = await supabase
        .from('folder_members')
        .select(`
            id, 
            user_id, 
            temp_name, 
            user:users (
                id, 
                email, 
                display_name
            )
        `)
        .eq('folder_id', folderId)

    const members = (rawMembers || []).map((m: any) => ({
        id: m.id,
        displayName: m.temp_name || m.user?.display_name || m.user?.email?.split('@')[0] || 'Unknown'
    }))

    // 3. Fetch Expenses (ALL needed for correct debt calc)
    // Note: In a real large-scale app, we'd use a SQL View or materialized view for balances.
    const { data: expenses } = await supabase
        .from('expenses')
        .select('id, description, amount, date, paid_by_member_id, category, split_details')
        .eq('folder_id', folderId)
        .order('date', { ascending: false })

    // 4. Calculate Settlements
    const debts = calculateSettlements(expenses || [], members)

    // 5. Calculate Total
    const totalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0

    const categories: Record<string, string> = {
        'General': '📦',
        'Food': '🍜',
        'Transport': '🚇',
        'Utilities': '💡',
        'Entertainment': '🎮',
    }

    // Helper to find member name for feed
    const getMemberName = (id: string | null) => {
        if (!id) return 'Unknown'
        return members.find(m => m.id === id)?.displayName || 'Unknown'
    }

    return (
        <div className="flex h-full flex-col bg-white">
            <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12 w-full">
                {/* Header Panel */}
                <div className="flex items-center justify-between border-b-4 border-black pb-4">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black text-black tracking-tighter uppercase manga-title truncate">
                            {folder.name}
                        </h1>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="bg-black text-white px-2 py-0.5 text-xs font-mono border border-black">
                                VOL. {folderId.split('-')[0].substring(0, 3).toUpperCase()}
                            </span>
                            <span className="text-sm font-bold uppercase tracking-widest border-l-2 border-black pl-3">
                                {members?.length || 1} Character(s)
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-48 hidden md:block">
                            <AddMemberModal folderId={folderId} />
                        </div>
                        <Link
                            href={`/folder/${folderId}/analytics`}
                            className="manga-button text-sm flex items-center"
                        >
                            Analytics
                        </Link>
                        <Link
                            href={`/folder/${folderId}/settings`}
                            className="manga-button text-sm flex items-center"
                        >
                            Config
                        </Link>
                        <Link
                            href={`/folder/${folderId}/share`}
                            className="manga-button text-sm flex items-center bg-yellow-300 hover:bg-yellow-400"
                        >
                            Waitlist / Share
                        </Link>
                    </div>
                    <div className="md:hidden">
                        <AddMemberModal folderId={folderId} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Panel 1: The Big Number (Span 2) */}
                    <div className="md:col-span-2 manga-panel p-8 relative flex flex-col justify-center min-h-[250px] pattern-dots">
                        <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 font-bold text-xs uppercase">
                            Current Limit
                        </div>
                        <h2 className="text-xl font-bold uppercase tracking-widest mb-2 border-b-2 border-black w-max pb-1">
                            Total Expenses
                        </h2>
                        <div className="text-6xl md:text-8xl font-black tracking-tighter text-outline text-white drop-shadow-[4px_4px_0_#000]" style={{ WebkitTextStroke: '2px black' }}>
                            {formatCurrency(totalExpenses, folder.currency)}
                        </div>
                        <div className="mt-6 flex items-center gap-2">
                            <span className="animate-pulse text-red-600 font-bold text-sm uppercase">● Live Action</span>
                        </div>
                    </div>

                    {/* Panel 2: Settlement Status (Span 1) */}
                    <div className="md:col-span-1 h-full min-h-[250px]">
                        <SettlementPanel debts={debts} members={members} folderId={folderId} />
                    </div>

                    {/* Panel 3: Action Button (Span 1) */}
                    <div className="md:col-span-1 manga-panel p-6 flex flex-col items-center justify-center space-y-6 text-center bg-yellow-50 min-h-[250px]">
                        <div className="h-16 w-16 border-2 border-black bg-white flex items-center justify-center text-3xl shadow-[4px_4px_0_0_#000]">
                            ✏️
                        </div>
                        <Link
                            href={`/folder/${folderId}/expenses/new`}
                            className="manga-button-primary w-full py-3 text-center hover:scale-105 transform transition-transform text-sm"
                        >
                            NEW ENTRY
                        </Link>
                        <p className="font-mono text-[10px] uppercase">
                            - Record a new chapter -
                        </p>
                    </div>
                </div>

                {/* Content Grid: Feed & Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main: Expenses Feed (Span 2) */}
                    <div className="lg:col-span-2 space-y-8">
                        <h3 className="text-3xl font-black uppercase italic border-l-8 border-black pl-4">
                            Recent Arcs
                        </h3>

                        <div className="space-y-4">
                            {expenses?.map((expense) => (
                                <Link
                                    href={`/folder/${folderId}/expenses/${expense.id}/edit`}
                                    key={expense.id}
                                    className="manga-panel p-0 flex items-stretch hover:translate-x-1 transition-transform group cursor-pointer"
                                >
                                    {/* Date Box */}
                                    <div className="bg-black text-white w-20 md:w-24 flex flex-col items-center justify-center p-2 text-center border-r-2 border-black flex-shrink-0 group-hover:bg-yellow-400 group-hover:text-black transition-colors">
                                        <span className="text-[10px] uppercase font-bold tracking-widest leading-none mb-1">
                                            {new Date(expense.date).toLocaleString('en-US', { month: 'short' })}
                                        </span>
                                        <span className="text-2xl font-black leading-none">
                                            {new Date(expense.date).getDate()}
                                        </span>
                                        <span className="text-[10px] font-bold font-mono mt-1 text-slate-400 group-hover:text-black">
                                            {new Date(expense.date).getFullYear()}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-4 flex items-center justify-between gap-4 overflow-hidden">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="h-10 w-10 border-2 border-black flex items-center justify-center text-lg bg-white flex-shrink-0">
                                                {categories[expense.category] || '📦'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-base md:text-lg uppercase tracking-tight truncate group-hover:underline decoration-2 underline-offset-2">
                                                    {expense.description}
                                                </p>
                                                <div className="text-xs font-mono bg-gray-100 border border-black px-1 inline-block mt-1 truncate max-w-full">
                                                    Paid by: {getMemberName(expense.paid_by_member_id)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Amount */}
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-black text-xl md:text-2xl">
                                                {formatCurrency(expense.amount, folder.currency)}
                                            </p>
                                            <span className="text-[10px] font-bold bg-black text-white px-1 opacity-0 group-hover:opacity-100 transition-opacity uppercase">Edit</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}

                            {(!expenses || expenses.length === 0) && (
                                <div className="manga-panel p-12 text-center border-dashed">
                                    <p className="font-mono text-lg uppercase">... Silence ...</p>
                                    <p className="text-sm mt-2">No events recorded in this timeline.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar: Activity Feed */}
                    <div className="lg:col-span-1">
                        <ActivityFeed folderId={folderId} />
                    </div>
                </div>
            </div>
        </div >
    )
}
