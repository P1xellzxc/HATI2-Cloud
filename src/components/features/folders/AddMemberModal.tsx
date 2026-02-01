'use client'

import { useState } from 'react'
import { Plus, UserPlus, X } from 'lucide-react'

export function AddMemberModal({ folderId }: { folderId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [name, setName] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)

        // Dynamic import to avoid server-side issues in client component if action isn't fully safe
        // But we usually import actions directly.
        // For now, let's assume we pass the action or import it.
        // We will implement the action next.
        const { addMember } = await import('@/app/(dashboard)/actions')

        const formData = new FormData()
        formData.append('folderId', folderId)
        formData.append('name', name)

        const result = await addMember(null, formData)

        setIsLoading(false)
        if (result?.success) {
            setIsOpen(false)
            setName('')
            // Ideally trigger a toast or revalidation happens automatically via action
        } else {
            alert(result?.message || 'Failed to add member')
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full border-2 border-black border-dashed p-4 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors font-mono uppercase text-sm"
            >
                <Plus className="w-4 h-4" />
                Add Member
            </button>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000] w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="manga-title text-xl flex items-center gap-2">
                        <UserPlus className="w-5 h-5" />
                        Recruit Member
                    </h2>
                    <button onClick={() => setIsOpen(false)} className="hover:bg-slate-100 p-1 rounded-sm">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest mb-2">
                            Codename (Display Name)
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Shadow"
                            required
                            className="manga-input w-full"
                            autoFocus
                        />
                        <p className="text-xs font-mono text-slate-500 mt-2">
                            * Creating a placeholder member. You can link a real user later.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 border-2 border-black py-2 font-bold uppercase hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-black text-white border-2 border-black py-2 font-bold uppercase hover:bg-slate-800 shadow-[2px_2px_0px_0px_#888]"
                        >
                            {isLoading ? 'Summoning...' : 'Add Member'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
