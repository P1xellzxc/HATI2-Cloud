'use client'

import { useActionState } from 'react'
import { createFolder } from '@/app/(dashboard)/actions'
import { Loader2 } from 'lucide-react'

export default function NewFolderPage() {
    const [state, formAction, isPending] = useActionState(createFolder, null)

    return (
        <div className="max-w-2xl mx-auto p-8">
            <div className="mb-8 text-center animate-fade-in">
                <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center text-3xl mb-4 text-red-500">
                    📂
                </div>
                <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Create New Collection</h1>
                <p className="text-slate-500 font-medium mt-2 dark:text-slate-400">Isolated spaces for your different financial lives.</p>
            </div>

            <form action={formAction} className="space-y-6 anime-card p-8 bg-white dark:bg-slate-800 border-none shadow-xl">
                <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-bold text-slate-700 dark:text-slate-200 ml-1">
                        Collection Name
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="e.g. Kyoto Trip, Monthly Bills"
                        className="block w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-4 px-6 text-slate-900 shadow-none ring-0 placeholder:text-slate-400 focus:border-red-400 focus:ring-0 sm:text-lg dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="currency" className="block text-sm font-bold text-slate-700 dark:text-slate-200 ml-1">
                        Currency
                    </label>
                    <div className="relative">
                        <select
                            id="currency"
                            name="currency"
                            defaultValue="PHP"
                            className="block w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-4 px-6 text-slate-900 shadow-none ring-0 focus:border-red-400 focus:ring-0 sm:text-lg dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-all appearance-none"
                        >
                            <option value="PHP">PHP (₱) - Philippine Peso</option>
                            <option value="USD">USD ($) - US Dollar</option>
                            <option value="EUR">EUR (€) - Euro</option>
                            <option value="JPY">JPY (¥) - Japanese Yen</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-6 text-slate-500">
                            ▼
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="anime-button w-full bg-red-500 text-white py-4 hover:bg-red-400 shadow-xl shadow-red-500/30 text-lg tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending && <Loader2 className="h-5 w-5 animate-spin inline mr-2" />}
                        {isPending ? 'Creating...' : 'Create Collection →'}
                    </button>
                </div>

                {state?.message && (
                    <div className={`text-sm font-bold text-center p-4 rounded-xl ${state.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {state.message}
                    </div>
                )}
            </form>
        </div>
    )
}
