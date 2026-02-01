'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { addMember, regenerateInviteToken } from '@/app/(dashboard)/actions'
import { ArrowLeft, Copy, UserPlus, RefreshCw, Trash2, Shield, User } from 'lucide-react'
import Link from 'next/link'

interface ManageMembersPageProps {
    folderId: string
    members: any[]
    currentUserRole: string
    baseUrl: string
}

function InviteRow({ member, baseUrl, canManage }: { member: any, baseUrl: string, canManage: boolean }) {
    const [copied, setCopied] = useState(false)
    const [isRegenerating, setIsRegenerating] = useState(false)

    // We handle regeneration client-side via form action or just a transition?
    // Let's use simple client logic for copy
    const inviteLink = `${baseUrl}/accept-invite?token=${member.invite_token}`

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="flex items-center justify-between p-4 border-2 border-slate-100 bg-white hover:border-black transition-colors">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 flex items-center justify-center border-2 border-black rounded-full ${member.user_id ? 'bg-black text-white' : 'bg-slate-200'}`}>
                    {member.user_id ? <User className="w-5 h-5" /> : <div className="text-xs font-black">TMP</div>}
                </div>
                <div>
                    <div className="font-bold uppercase flex items-center gap-2">
                        {member.temp_name || member.user?.display_name || 'Unknown'}
                        {member.role === 'owner' && <span className="bg-yellow-300 text-black text-[10px] px-1 rounded border border-black">OWNER</span>}
                        {!member.user_id && <span className="bg-slate-200 text-slate-500 text-[10px] px-1 rounded border border-slate-300">PENDING</span>}
                    </div>
                    {member.invite_email && <div className="text-xs text-slate-400 font-mono">{member.invite_email}</div>}
                </div>
            </div>

            {canManage && !member.user_id && (
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopy}
                        className="p-2 hover:bg-slate-100 border border-transparent hover:border-black rounded transition-all flex items-center gap-2 text-xs font-bold uppercase"
                    >
                        {copied ? 'COPIED!' : 'LINK'}
                        <Copy className="w-4 h-4" />
                    </button>
                    {/* Add Regenerate Logic here if needed */}
                </div>
            )}
        </div>
    )
}

export default function ManageMembersClient({ folderId, members, currentUserRole, baseUrl }: ManageMembersPageProps) {
    const [addMemberState, addMemberAction, isAdding] = useActionState(addMember, null)

    return (
        <div className="min-h-screen bg-white p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 border-b-4 border-black pb-6">
                <Link href={`/folder/${folderId}`} className="manga-button h-10 w-10 flex items-center justify-center p-0">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-4xl font-black uppercase manga-title leading-none">Access Control</h1>
                    <p className="font-mono text-sm mt-1 uppercase text-slate-500">
                        Manage Members & Invites
                    </p>
                </div>
            </div>

            {/* Add Member Form */}
            {currentUserRole !== 'viewer' && (
                <div className="manga-panel p-6 space-y-4 bg-slate-50">
                    <h2 className="font-black uppercase flex items-center gap-2">
                        <UserPlus className="w-5 h-5" /> Add New Member
                    </h2>
                    <form action={addMemberAction} className="flex gap-4">
                        <input type="hidden" name="folderId" value={folderId} />
                        <div className="flex-1 space-y-2">
                            <input
                                name="name"
                                placeholder="Display Name (e.g. John)"
                                className="manga-input w-full bg-white"
                                required
                            />
                            <input
                                name="email"
                                type="email"
                                placeholder="Email (Optional, for secure invite)"
                                className="manga-input w-full bg-white"
                            />
                        </div>
                        <button disabled={isAdding} className="manga-button-primary self-start h-[50px] px-8">
                            {isAdding ? 'ADDING...' : 'ADD'}
                        </button>
                    </form>
                    {addMemberState?.message && (
                        <p className={`text-sm font-bold ${addMemberState.success ? 'text-green-600' : 'text-red-600'}`}>
                            {addMemberState.message}
                        </p>
                    )}
                </div>
            )}

            {/* Members List */}
            <div className="space-y-4">
                <h2 className="font-black uppercase text-xl">Roster ({members.length})</h2>
                <div className="space-y-2">
                    {members.map(member => (
                        <InviteRow
                            key={member.id}
                            member={member}
                            baseUrl={baseUrl}
                            canManage={currentUserRole === 'owner' || currentUserRole === 'editor'}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
