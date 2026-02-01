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
    const [mounted, setMounted] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
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
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-white pt-safe pb-safe">
            {/* Background Pattern */}
            <div className="fixed inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            {/* Main Card */}
            <div className={`w-full max-w-sm relative z-10 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className={`mx-auto h-20 w-20 bg-yellow-400 border-4 border-black flex items-center justify-center text-4xl mb-4 ${mounted ? 'animate-bounce-in' : ''}`}
                        style={{ boxShadow: '4px 4px 0px 0px #000' }}>
                        💰
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-black">
                        HATI² Cloud
                    </h1>
                    <p className="mt-2 text-sm font-medium text-gray-500 uppercase tracking-widest">
                        Your Financial Sanctuary
                    </p>
                </div>

                {/* Auth Card */}
                <div className="manga-panel p-6 animate-delay-100">
                    {/* Auth Mode Tabs */}
                    <div className="flex border-2 border-black mb-6">
                        <button
                            type="button"
                            onClick={() => setAuthMode('password')}
                            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-all duration-200 touch-feedback ${authMode === 'password'
                                    ? 'bg-black text-white'
                                    : 'bg-white text-black'
                                }`}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            onClick={() => setAuthMode('signup')}
                            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider border-l-2 border-black transition-all duration-200 touch-feedback ${authMode === 'signup'
                                    ? 'bg-black text-white'
                                    : 'bg-white text-black'
                                }`}
                        >
                            Sign Up
                        </button>
                        <button
                            type="button"
                            onClick={() => setAuthMode('magic')}
                            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider border-l-2 border-black transition-all duration-200 touch-feedback ${authMode === 'magic'
                                    ? 'bg-black text-white'
                                    : 'bg-white text-black'
                                }`}
                        >
                            Magic
                        </button>
                    </div>

                    {/* Password Login Form */}
                    {authMode === 'password' && (
                        <form action={passwordAction} className="space-y-4 animate-fade-in">
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-xs font-black text-black uppercase tracking-wider">
                                    Email Address
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
                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-xs font-black text-black uppercase tracking-wider">
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
                                className="manga-button-primary w-full py-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPending ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="animate-pulse">●</span>
                                        Connecting...
                                    </span>
                                ) : (
                                    'Enter Sanctuary →'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Sign Up Form */}
                    {authMode === 'signup' && (
                        <form action={signUpAction} className="space-y-4 animate-fade-in">
                            <div className="space-y-2">
                                <label htmlFor="signup-email" className="block text-xs font-black text-black uppercase tracking-wider">
                                    Email Address
                                </label>
                                <input
                                    id="signup-email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="manga-input w-full"
                                    placeholder="hello@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="signup-password" className="block text-xs font-black text-black uppercase tracking-wider">
                                    Password
                                    <span className="text-gray-400 font-normal lowercase ml-2">(min 6 chars)</span>
                                </label>
                                <input
                                    id="signup-password"
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
                                className="manga-button-primary w-full py-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPending ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="animate-pulse">●</span>
                                        Creating Account...
                                    </span>
                                ) : (
                                    'Create Account →'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Magic Link Form */}
                    {authMode === 'magic' && (
                        <form action={magicLinkAction} className="space-y-4 animate-fade-in">
                            <div className="space-y-2">
                                <label htmlFor="magic-email" className="block text-xs font-black text-black uppercase tracking-wider">
                                    Email Address
                                </label>
                                <input
                                    id="magic-email"
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
                                className="manga-button w-full py-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPending ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="animate-pulse">●</span>
                                        Sending...
                                    </span>
                                ) : (
                                    'Send Magic Link →'
                                )}
                            </button>
                            <p className="text-xs text-gray-400 text-center font-medium">
                                ⚠️ Limited to 4 emails per hour
                            </p>
                        </form>
                    )}

                    {/* Status Message */}
                    {currentState?.message && (
                        <div className={`mt-4 text-sm text-center p-4 border-2 animate-slide-up ${currentState.success
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-red-500 bg-red-50 text-red-700'
                            }`}>
                            {currentState.message}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-gray-400 font-medium animate-delay-300 animate-fade-in">
                    Secure • Private • Yours
                </p>
            </div>
        </div>
    )
}
