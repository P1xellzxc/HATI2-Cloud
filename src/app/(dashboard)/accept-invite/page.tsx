'use client'

import { useActionState, useEffect } from 'react'
import { claimMember } from '@/app/(dashboard)/actions'
import { Loader2, CheckCircle, XCircle, MailOpen } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AcceptInvitePage() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const router = useRouter()

    const [state, formAction, isPending] = useActionState(claimMember, null)

    // Optional: Auto-submit if token is present? 
    // Maybe better to show a "Accept Invite" button for confirmation.

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="manga-panel p-8 text-center max-w-md w-full">
                    <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <h1 className="text-2xl font-black uppercase mb-2">Invalid Link</h1>
                    <p className="mb-6">This invite link is missing a token.</p>
                    <Link href="/" className="manga-button-primary w-full block">Go Home</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="manga-panel p-8 max-w-md w-full relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-full h-2 bg-black"></div>

                <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-300 border-4 border-black rounded-full mb-2">
                        <MailOpen className="w-10 h-10 text-black" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-black uppercase tracking-tighter">You're Invited!</h1>
                        <p className="font-mono text-sm text-slate-600">
                            You have been invited to join a collaborative folder.
                            Click below to claim your profile and sync your history.
                        </p>
                    </div>

                    <form action={formAction} className="space-y-4">
                        <input type="hidden" name="token" value={token} />

                        <button
                            type="submit"
                            disabled={isPending}
                            className="manga-button-primary w-full py-4 text-lg flex items-center justify-center gap-2"
                        >
                            {isPending ? <Loader2 className="animate-spin" /> : <CheckCircle className="w-6 h-6" />}
                            {isPending ? 'Processing...' : 'ACCEPT INVITATION'}
                        </button>
                    </form>

                    {state?.message && (
                        <div className={`p-4 border-2 border-black font-bold uppercase text-sm flex items-center gap-2 justify-center ${state.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {state.success ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                            {state.message}
                        </div>
                    )}

                    {state?.success && (
                        <div className="animate-in fade-in zoom-in duration-300">
                            <Link href="/" className="block mt-4 text-sm font-black underline decoration-2 decoration-yellow-400 underline-offset-4 hover:bg-yellow-100 p-2 rounded">
                                ENTER DASHBOARD &rarr;
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
