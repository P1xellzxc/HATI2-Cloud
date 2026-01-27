'use client'

import { useActionState, useEffect } from 'react'
import { login } from '@/app/auth/actions'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, null)
    const router = useRouter()

    useEffect(() => {
        // Check if user is already logged in
        const checkUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                router.replace('/')
            }
        }
        checkUser()
    }, [router])


    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 anime-card p-10 bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-700">
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center text-4xl mb-6 text-red-500">
                        🎐
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                        HATI² Cloud
                    </h1>
                    <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Your private financial sanctuary
                    </p>
                </div>

                <form action={formAction} className="mt-8 space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-bold text-slate-700 dark:text-slate-200 ml-1">
                            Email Address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="block w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-4 px-6 text-slate-900 shadow-none ring-0 placeholder:text-slate-400 focus:border-red-400 focus:ring-0 sm:text-lg dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-all"
                            placeholder="hello@example.com"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="anime-button w-full bg-red-500 text-white py-4 hover:bg-red-400 shadow-xl shadow-red-500/30 text-lg tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? 'Connecting...' : 'Enter Sanctuary →'}
                        </button>
                    </div>

                    {state?.message && (
                        <div className={`text-sm text-center p-3 rounded-lg ${state.success ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {state.message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}
