import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import NewExpenseForm from './date-picker-form' // Renaming or creating new client component

export default async function NewExpensePage({ params }: { params: Promise<{ folderId: string }> }) {
    const { folderId } = await params
    const supabase = await createClient()

    // Fetch Members (including placeholders)
    const { data: members, error } = await supabase
        .from('folder_members')
        .select(`
            id,
            user_id,
            temp_name,
            role,
            user:users (
                id,
                email,
                display_name,
                avatar_url
            )
        `)
        .eq('folder_id', folderId)

    if (error || !members) {
        notFound()
    }

    // Transform for easier usage
    const formattedMembers = members.map((m: any) => ({
        id: m.id, // Using MEMBER ID now, not User ID
        userId: m.user_id,
        email: m.user?.email,
        displayName: m.temp_name || m.user?.display_name || m.user?.email?.split('@')[0] || 'Unknown Member'
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
