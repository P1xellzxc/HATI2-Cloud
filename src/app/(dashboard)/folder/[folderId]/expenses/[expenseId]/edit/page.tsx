import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ExpenseForm from '../../new/date-picker-form' // Reusing the form from 'new'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditExpensePage({ params }: { params: Promise<{ folderId: string, expenseId: string }> }) {
    const { folderId, expenseId } = await params
    const supabase = await createClient()

    // 1. Fetch Expense
    const { data: expense } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', expenseId)
        .eq('folder_id', folderId)
        .single()

    if (!expense) notFound()

    // 2. Fetch Members
    const { data: rawMembers } = await supabase
        .from('folder_members')
        .select('id, temp_name, user:users(display_name, email)')
        .eq('folder_id', folderId)

    const members = (rawMembers || []).map((m: any) => ({
        id: m.id,
        userId: m.user?.id || null,
        email: m.user?.email || 'N/A',
        displayName: m.temp_name || m.user?.display_name || m.user?.email?.split('@')[0] || 'Unknown'
    }))

    return (
        <div className="min-h-screen bg-white p-4 md:p-8 space-y-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 border-b-4 border-black pb-6">
                <Link href={`/folder/${folderId}`} className="manga-button h-10 w-10 flex items-center justify-center p-0">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-4xl font-black uppercase manga-title leading-none">Correction Protocol</h1>
                    <p className="font-mono text-sm mt-1 uppercase text-slate-500">
                        Edit Entry • {expense.description}
                    </p>
                </div>
            </div>

            <ExpenseForm
                folderId={folderId}
                members={members}
                initialData={expense}
            />
        </div>
    )
}
