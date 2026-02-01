import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ManageMembersClient from './client-page'

export default async function ManageMembersPage({ params }: { params: Promise<{ folderId: string }> }) {
    const { folderId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch Folder & Check Access
    const { data: membership } = await supabase
        .from('folder_members')
        .select('role')
        .eq('folder_id', folderId)
        .eq('user_id', user.id)
        .single()

    if (!membership) redirect('/') // Not a member

    // Fetch All Members
    const { data: members } = await supabase
        .from('folder_members')
        .select(`
            id, 
            temp_name, 
            role, 
            invite_email,
            invite_token,
            user_id,
            user:users (display_name, email, avatar_url)
        `)
        .eq('folder_id', folderId)
        .order('role', { ascending: true }) // owner first usually if role enum ordered, but 'viewer' > 'owner' alphabetically? 
    // Logic: owner > editor > viewer. 

    // Determine Base URL (env var or default)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    return (
        <ManageMembersClient
            folderId={folderId}
            members={members || []}
            currentUserRole={membership.role}
            baseUrl={baseUrl}
        />
    )
}
