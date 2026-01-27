import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { FolderSettingsClient } from './client'

export default async function FolderSettingsPage({ params }: { params: Promise<{ folderId: string }> }) {
    const { folderId } = await params
    const supabase = await createClient()

    const { data: folder } = await supabase.from('folders').select('id, name, icon, currency').eq('id', folderId).single()
    const { data: members } = await supabase
        .from('folder_members')
        .select('role, user:user_id(id, email, avatar_url)')
        .eq('folder_id', folderId)

    if (!folder) notFound()

    return <FolderSettingsClient folder={folder} members={members || []} />
}
