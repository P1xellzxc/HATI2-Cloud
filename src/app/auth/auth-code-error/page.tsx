'use client'

import Link from 'next/link'

export default function AuthCodeErrorPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 anime-card p-10 bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-700 text-center">
                <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center text-4xl mb-6">
                    ⚠️
                </div>
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                    Authentication Error
                </h1>
                <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    The magic link has expired or is invalid. This can happen if:
                </p>
                <ul className="text-left text-sm text-slate-500 dark:text-slate-400 space-y-2 mt-4">
                    <li>• The link was already used</li>
                    <li>• The link has expired (valid for 1 hour)</li>
                    <li>• You opened the link in a different browser</li>
                </ul>
                <Link 
                    href="/login"
                    className="anime-button inline-block w-full bg-red-500 text-white py-4 hover:bg-red-400 shadow-xl shadow-red-500/30 text-lg tracking-wide mt-6"
                >
                    Try Again →
                </Link>
            </div>
        </div>
    )
}
