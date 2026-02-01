import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: folders, error } = await supabase
        .from('folders')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching folders:', error)
    }

    return <DashboardClient initialFolders={folders || []} />
}
