'use client'

import { useActionState } from 'react'
import { createExpense } from '@/app/(dashboard)/actions'
import { Loader2 } from 'lucide-react'

interface Member {
    id: string
    email: string
    displayName: string
}

export default function NewExpenseForm({ folderId, members }: { folderId: string, members: Member[] }) {
    const [state, formAction, isPending] = useActionState(createExpense, null)

    return (
        <form action={formAction} className="space-y-6 anime-card p-8 bg-white dark:bg-slate-800 border-none shadow-xl">
            <div className="border-b border-red-100 dark:border-slate-700 pb-4 mb-4 flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <h2 className="font-bold text-sm uppercase text-red-500 tracking-wider">New Transaction Entry</h2>
            </div>
            <input type="hidden" name="folderId" value={folderId} />

            <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-bold text-slate-700 dark:text-slate-200">
                    Description
                </label>
                <input
                    id="description"
                    name="description"
                    type="text"
                    required
                    placeholder="What did you buy?"
                    className="block w-full rounded-xl border-2 border-slate-100 bg-slate-50 py-3 px-4 text-slate-900 shadow-none ring-0 placeholder:text-slate-400 focus:border-red-400 focus:bg-white focus:ring-0 sm:text-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-all"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="amount" className="block text-sm font-bold text-slate-700 dark:text-slate-200">
                        Amount
                    </label>
                    <input
                        id="amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        className="block w-full rounded-xl border-2 border-slate-100 bg-slate-50 py-3 px-4 text-slate-900 shadow-none ring-0 placeholder:text-slate-400 focus:border-red-400 focus:bg-white focus:ring-0 sm:text-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="date" className="block text-sm font-bold text-slate-700 dark:text-slate-200">
                        Date
                    </label>
                    <input
                        id="date"
                        name="date"
                        type="date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                        required
                        className="block w-full rounded-xl border-2 border-slate-100 bg-slate-50 py-3 px-4 text-slate-900 shadow-none ring-0 placeholder:text-slate-400 focus:border-red-400 focus:bg-white focus:ring-0 sm:text-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-all"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-bold text-slate-700 dark:text-slate-200">
                    Category
                </label>
                <select
                    id="category"
                    name="category"
                    className="block w-full rounded-xl border-2 border-slate-100 bg-slate-50 py-3 px-4 text-slate-900 shadow-none ring-0 focus:border-red-400 focus:bg-white sm:text-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-all"
                >
                    <option value="General">General</option>
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Entertainment">Entertainment</option>
                </select>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <p className="text-sm font-bold text-slate-500">Splitting Options</p>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Paid By</label>
                    <div className="grid grid-cols-2 gap-2">
                        {members.map(member => (
                            <label key={`payer-${member.id}`} className="flex items-center gap-2 p-3 rounded-xl border-2 border-slate-100 cursor-pointer hover:border-red-200 hover:bg-red-50 peer-checked:border-red-500 peer-checked:bg-red-50 transition-all">
                                <input
                                    type="radio"
                                    name="paidBy"
                                    value={member.id}
                                    defaultChecked={member.id === members[0]?.id} // Very basic default
                                    className="text-red-500 focus:ring-red-500 border-gray-300"
                                />
                                <span className="text-sm font-medium truncate">{member.email}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Proportional Split With</label>
                    <div className="grid grid-cols-2 gap-2">
                        {members.map(member => (
                            <label key={`split-${member.id}`} className="flex items-center gap-2 p-3 rounded-xl border-2 border-slate-100 cursor-pointer hover:border-red-200 hover:bg-red-50 transition-all">
                                <input
                                    type="checkbox"
                                    name="splitWith"
                                    value={member.id}
                                    defaultChecked
                                    className="rounded text-red-500 focus:ring-red-500 border-gray-300"
                                />
                                <span className="text-sm font-medium truncate">{member.email}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex w-full justify-center items-center gap-2 rounded-full bg-red-500 px-3 py-4 text-sm font-bold uppercase leading-6 text-white shadow-lg shadow-red-500/30 hover:bg-red-400 hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isPending ? 'Recording...' : 'Confirm Entry'}
                </button>
            </div>

            {state?.message && (
                <div className={`text-sm text-center p-3 rounded-lg ${state.success ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {state.message}
                </div>
            )}
        </form>
    )
}
