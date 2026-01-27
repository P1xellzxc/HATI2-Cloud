import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import NewExpenseForm from './date-picker-form' // Renaming or creating new client component

export default async function NewExpensePage({ params }: { params: Promise<{ folderId: string }> }) {
    const { folderId } = await params
    const supabase = await createClient()

    // Fetch Members
    const { data: members, error } = await supabase
        .from('folder_members')
        .select('user_id, role, user:users(id, email, display_name, avatar_url)')
        .eq('folder_id', folderId)

    if (error || !members) {
        notFound()
    }

    // Transform for easier usage
    const formattedMembers = members.map((m: any) => ({
        id: m.user.id,
        email: m.user.email,
        displayName: m.user.display_name || m.user.email.split('@')[0]
    }))

    return (
        <div className="max-w-2xl mx-auto p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Expense</h1>
            </div>
            <NewExpenseForm folderId={folderId} members={formattedMembers} />
        </div>
    )
}
