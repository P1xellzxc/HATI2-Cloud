import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Plus, Settings, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

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

    // 2. Fetch Expenses
    const { data: expenses } = await supabase
        .from('expenses')
        .select('id, description, amount, date, paid_by(email), category')
        .eq('folder_id', folderId)
        .order('date', { ascending: false })
        .limit(20)

    // 3. Fetch Members Count
    const { data: members } = await supabase
        .from('folder_members')
        .select('id')
        .eq('folder_id', folderId)

    // 4. Calculate Total
    const totalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0

    const categories: Record<string, string> = {
        'General': '📦',
        'Food': '🍜',
        'Transport': '🚇',
        'Utilities': '💡',
        'Entertainment': '🎮',
    }

    return (
        <div className="flex h-full flex-col">
            <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
                {/* Header Panel */}
                <div className="anime-card p-8 flex items-center justify-between bg-white dark:bg-slate-800 border-none">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                            {folder.name}
                        </h1>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold dark:bg-red-900/30 dark:text-red-400">
                                ID: {folderId.split('-')[0]}
                            </span>
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                {members?.length || 1} Member(s)
                            </span>
                        </div>
                    </div>
                    <Link
                        href={`/folder/${folderId}/settings`}
                        className="anime-button bg-slate-100 text-slate-600 px-6 py-2 text-sm hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                    >
                        Settings
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Balance Card */}
                    <div className="md:col-span-2 anime-card p-8 relative overflow-hidden bg-gradient-to-br from-red-500 to-orange-500 text-white border-none">
                        <div className="absolute -right-4 -top-4 opacity-20 transform rotate-12">
                            <span className="text-9xl font-black">¥</span>
                        </div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-red-100 mb-1">
                            Total Expenses
                        </h2>
                        <div className="text-6xl font-black mt-2">
                            {formatCurrency(totalExpenses, folder.currency)}
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                            <span className="text-xs font-medium text-red-100">Live Updates</span>
                        </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="anime-card p-6 flex flex-col justify-center space-y-4 bg-white dark:bg-slate-800 border-none text-center">
                        <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center text-3xl mb-2 dark:bg-red-900/20">
                            ✨
                        </div>
                        <Link
                            href={`/folder/${folderId}/expenses/new`}
                            className="anime-button w-full bg-slate-900 text-white py-4 hover:bg-slate-800 shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-900"
                        >
                            Add Detail +
                        </Link>
                        <p className="text-xs font-medium text-slate-400">
                            Log a new transaction
                        </p>
                    </div>
                </div>

                {/* Expenses Feed */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-500"></span>
                        Transaction History
                    </h3>

                    <div className="space-y-3">
                        {expenses?.map((expense) => (
                            <div key={expense.id} className="anime-card p-4 flex items-center justify-between hover:bg-slate-50 border-2 border-transparent hover:border-red-100 dark:hover:bg-slate-700 dark:hover:border-slate-600 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl dark:bg-slate-900">
                                        {categories[expense.category] || '📦'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-slate-800 dark:text-white">{expense.description}</p>
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                            <span className="text-red-500">
                                                {formatDate(String(expense.date))}
                                            </span>
                                            <span>•</span>
                                            <span>
                                                {Array.isArray(expense.paid_by) ? expense.paid_by[0]?.email?.split('@')[0] : (expense.paid_by as any)?.email?.split('@')[0]}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-xl text-slate-800 dark:text-white">
                                        {formatCurrency(expense.amount, folder.currency)}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {(!expenses || expenses.length === 0) && (
                            <div className="p-12 text-center">
                                <div className="text-4xl mb-4">🍃</div>
                                <p className="text-slate-500 font-medium">No transactions found here...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
