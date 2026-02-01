import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowRight, ShieldCheck } from 'lucide-react'

export default async function InvitationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Find invites matching this user's email
    // Note: This relies on invite_email being set correctly by inviter
    const { data: invites } = await supabase
        .from('folder_members')
        .select(`
            id,
            invite_token,
            folder:folders (id, name, owner:users(display_name))
        `)
        .eq('invite_email', user.email)
        .is('user_id', null) // Only unclaimed ones

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 border-b-4 border-black pb-6">
                <div className="bg-black text-white p-2">
                    <Mail className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-4xl font-black uppercase manga-title leading-none">Invitations</h1>
                    <p className="font-mono text-sm mt-1 uppercase text-slate-500">
                        PENDING ACCESS REQUESTS
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {(!invites || invites.length === 0) ? (
                    <div className="manga-panel p-12 text-center text-slate-500 font-mono flex flex-col items-center gap-4">
                        <ShieldCheck className="w-16 h-16 opacity-20" />
                        <p>No pending invitations found for {user.email}.</p>
                    </div>
                ) : (
                    invites.map((invite: any) => (
                        <div key={invite.id} className="manga-panel p-6 flex items-center justify-between group hover:shadow-[8px_8px_0_0_#000] transition-all">
                            <div>
                                <h3 className="text-xl font-black uppercase">{invite.folder.name}</h3>
                                <p className="text-sm font-mono text-slate-500">
                                    Invited by {invite.folder.owner?.display_name || 'Unknown'}
                                </p>
                            </div>
                            <Link
                                href={`/accept-invite?token=${invite.invite_token}`}
                                className="manga-button-primary flex items-center gap-2 text-sm px-6"
                            >
                                ACCEPT <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
