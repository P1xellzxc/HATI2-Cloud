import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import { calculateSettlements } from '@/lib/logic/settlements'
import { ArrowLeft, ArrowRight, History, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default async function SettlementDetailsPage({ params }: { params: Promise<{ folderId: string }> }) {
    const { folderId } = await params
    const supabase = await createClient()

    // 1. Fetch Folder
    const { data: folder } = await supabase
        .from('folders')
        .select('name, currency')
        .eq('id', folderId)
        .single()

    if (!folder) notFound()

    // 2. Fetch Members
    const { data: rawMembers } = await supabase
        .from('folder_members')
        .select(`
            id, 
            temp_name, 
            user:users (display_name, email)
        `)
        .eq('folder_id', folderId)

    const members = (rawMembers || []).map((m: any) => ({
        id: m.id,
        displayName: m.temp_name || m.user?.display_name || m.user?.email?.split('@')[0] || 'Unknown'
    }))

    // 3. Fetch All Expenses
    const { data: expenses } = await supabase
        .from('expenses')
        .select('id, description, amount, date, paid_by_member_id, category, split_details')
        .eq('folder_id', folderId)
        .order('date', { ascending: false })

    // 4. Calculate Logic
    const debts = calculateSettlements(expenses || [], members)

    const getMemberName = (id: string) => members.find(m => m.id === id)?.displayName || 'Unknown'

    return (
        <div className="min-h-screen bg-white p-4 md:p-8 space-y-8 max-w-4xl mx-auto">

            {/* Header */}
            <div className="flex items-center gap-4 border-b-4 border-black pb-6">
                <Link href={`/folder/${folderId}`} className="manga-button h-10 w-10 flex items-center justify-center p-0">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-4xl font-black uppercase manga-title leading-none">Settlement Protocol</h1>
                    <p className="font-mono text-sm mt-1 uppercase text-slate-500">
                        Audit Trail • {folder.name}
                    </p>
                </div>
            </div>

            {/* Debts List */}
            <div className="space-y-12">
                {debts.length === 0 ? (
                    <div className="manga-panel p-12 flex flex-col items-center justify-center text-center space-y-4">
                        <ShieldCheck className="w-20 h-20 text-green-500" />
                        <h2 className="text-2xl font-black uppercase">All Debts Resolved</h2>
                        <p className="font-mono">No outstanding balances detected in this timeline.</p>
                    </div>
                ) : (
                    debts.map((debt, index) => (
                        <div key={index} className="manga-panel p-0 overflow-hidden relative">
                            {/* Summary Header */}
                            <div className="bg-black text-white p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4 text-xl md:text-2xl font-black uppercase">
                                    <span className="text-slate-400">{getMemberName(debt.from)}</span>
                                    <ArrowRight className="w-6 h-6 animate-pulse text-yellow-400" />
                                    <span className="text-white">{getMemberName(debt.to)}</span>
                                </div>
                                <div className="text-4xl font-black text-yellow-300 font-mono">
                                    {formatCurrency(debt.amount, folder.currency)}
                                </div>
                            </div>

                            {/* Audit Trail Table */}
                            <div className="p-6 bg-slate-50">
                                <div className="flex items-center gap-2 mb-4">
                                    <History className="w-5 h-5" />
                                    <h3 className="font-black uppercase text-sm tracking-widest">Transaction History</h3>
                                </div>

                                <div className="border-2 border-black bg-white shadow-[4px_4px_0_0_#e2e8f0]">
                                    <table className="w-full text-sm">
                                        <thead className="bg-black text-white font-mono uppercase text-xs">
                                            <tr>
                                                <th className="p-3 text-left">Date</th>
                                                <th className="p-3 text-left">Description</th>
                                                <th className="p-3 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y-2 divide-slate-100 font-mono">
                                            {debt.history.map((log) => (
                                                <tr key={log.expenseId + log.amount} className={`group hover:bg-yellow-50 ${log.isOffset ? 'bg-red-50 text-red-600' : ''}`}>
                                                    <td className="p-3 whitespace-nowrap">{formatDate(log.date).split(' ')[0]}</td>
                                                    <td className="p-3 w-full font-bold uppercase flex items-center gap-2">
                                                        {log.isOffset && <span className="text-[10px] bg-red-100 px-1 border border-red-200 rounded">OFFSET</span>}
                                                        {log.description}
                                                    </td>
                                                    <td className="p-3 text-right font-black">
                                                        {log.isOffset ? '-' : '+'}{formatCurrency(Math.abs(log.amount), folder.currency)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="border-t-2 border-black bg-slate-100">
                                            <tr>
                                                <td colSpan={2} className="p-3 text-right font-black uppercase text-xs tracking-widest">Net Total</td>
                                                <td className="p-3 text-right font-black text-lg underline decoration-4 decoration-yellow-300 underline-offset-4">
                                                    {formatCurrency(debt.amount, folder.currency)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
