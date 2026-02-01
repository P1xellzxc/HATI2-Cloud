'use client'

import { useActionState, useEffect, useState } from 'react'
import { login, loginWithPassword, signUp } from '@/app/auth/actions'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
    const [magicLinkState, magicLinkAction, isMagicLinkPending] = useActionState(login, null)
    const [passwordState, passwordAction, isPasswordPending] = useActionState(loginWithPassword, null)
    const [signUpState, signUpAction, isSignUpPending] = useActionState(signUp, null)

    const [authMode, setAuthMode] = useState<'magic' | 'password' | 'signup'>('password')
    const router = useRouter()

    useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                router.replace('/')
            }
        }
        checkUser()
    }, [router])

    const currentState = authMode === 'magic' ? magicLinkState : authMode === 'password' ? passwordState : signUpState
    const isPending = authMode === 'magic' ? isMagicLinkPending : authMode === 'password' ? isPasswordPending : isSignUpPending

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6 manga-panel p-8 bg-white border-4 border-black">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-red-100 flex items-center justify-center text-3xl mb-4">
                        💰
                    </div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-black">
                        HATI² Cloud
                    </h1>
                    <p className="mt-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Your private financial sanctuary
                    </p>
                </div>

                {/* Auth Mode Tabs */}
                <div className="flex border-2 border-black">
                    <button
                        type="button"
                        onClick={() => setAuthMode('password')}
                        className={`flex-1 py-2 text-xs font-black uppercase tracking-wider transition-colors ${authMode === 'password' ? 'bg-black text-white' : 'bg-white text-black hover:bg-slate-100'}`}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        onClick={() => setAuthMode('signup')}
                        className={`flex-1 py-2 text-xs font-black uppercase tracking-wider border-l-2 border-black transition-colors ${authMode === 'signup' ? 'bg-black text-white' : 'bg-white text-black hover:bg-slate-100'}`}
                    >
                        Sign Up
                    </button>
                    <button
                        type="button"
                        onClick={() => setAuthMode('magic')}
                        className={`flex-1 py-2 text-xs font-black uppercase tracking-wider border-l-2 border-black transition-colors ${authMode === 'magic' ? 'bg-black text-white' : 'bg-white text-black hover:bg-slate-100'}`}
                    >
                        Magic Link
                    </button>
                </div>

                {/* Password Login Form */}
                {authMode === 'password' && (
                    <form action={passwordAction} className="space-y-4">
                        <div className="space-y-1">
                            <label htmlFor="email" className="block text-xs font-black text-black uppercase">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="manga-input w-full"
                                placeholder="hello@example.com"
                            />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="password" className="block text-xs font-black text-black uppercase">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="manga-input w-full"
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="manga-button-primary w-full py-3 disabled:opacity-50"
                        >
                            {isPending ? 'Connecting...' : 'Enter Sanctuary →'}
                        </button>
                    </form>
                )}

                {/* Sign Up Form */}
                {authMode === 'signup' && (
                    <form action={signUpAction} className="space-y-4">
                        <div className="space-y-1">
                            <label htmlFor="email" className="block text-xs font-black text-black uppercase">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="manga-input w-full"
                                placeholder="hello@example.com"
                            />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="password" className="block text-xs font-black text-black uppercase">
                                Password (min 6 chars)
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={6}
                                className="manga-input w-full"
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="manga-button-primary w-full py-3 disabled:opacity-50"
                        >
                            {isPending ? 'Creating Account...' : 'Create Account →'}
                        </button>
                    </form>
                )}

                {/* Magic Link Form */}
                {authMode === 'magic' && (
                    <form action={magicLinkAction} className="space-y-4">
                        <div className="space-y-1">
                            <label htmlFor="email" className="block text-xs font-black text-black uppercase">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="manga-input w-full"
                                placeholder="hello@example.com"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="manga-button w-full py-3 disabled:opacity-50"
                        >
                            {isPending ? 'Sending...' : 'Send Magic Link →'}
                        </button>
                        <p className="text-xs text-slate-500 text-center">
                            ⚠️ Limited to 4 emails/hour
                        </p>
                    </form>
                )}

                {currentState?.message && (
                    <div className={`text-sm text-center p-3 border-2 ${currentState.success ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700'}`}>
                        {currentState.message}
                    </div>
                )}
            </div>
        </div>
    )
}
