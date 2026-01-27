'use client'

import { useActionState } from 'react'
import { updateFolder, deleteFolder } from '@/app/(dashboard)/actions'
import { Folder, Save, Trash2, AlertTriangle, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

const initialState = {
    success: false,
    message: '',
}

export function FolderSettingsClient({ folder, members }: { folder: any, members: any[] }) {
    const [state, formAction, isPending] = useActionState(updateFolder, initialState)
    const [deleteState, deleteAction, isDeleting] = useActionState(deleteFolder, initialState)

    // Simple deleting confirmation state
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

    return (
        <div className="max-w-3xl mx-auto p-8 space-y-8">
            <Link href={`/folder/${folder.id}`} className="flex items-center gap-2 text-slate-500 hover:text-black transition-colors font-mono text-sm mb-4">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </Link>

            <header className="flex items-center gap-4 mb-8">
                <div className="h-16 w-16 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center text-3xl">
                    {folder.icon || '📁'}
                </div>
                <div>
                    <h1 className="manga-header text-4xl text-black">Folder Settings</h1>
                    <p className="text-slate-500 font-mono">Manage your collection</p>
                </div>
            </header>

            {/* ERROR / SUCCESS MESSAGES */}
            {state?.message && (
                <div className={`p-4 border-2 ${state.success ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700'} rounded-sm font-bold flex items-center gap-2`}>
                    {state.success ? '✨' : '⚠️'} {state.message}
                </div>
            )}

            <div className="grid gap-8 md:grid-cols-3">

                {/* LEFT COLUMN: EDIT FORM */}
                <div className="md:col-span-2 space-y-8">
                    {/* EDIT SECTION */}
                    <section className="manga-panel p-6 shadow-[4px_4px_0px_0px_#000]">
                        <h2 className="manga-header text-xl mb-6 flex items-center gap-2">
                            <Folder className="w-5 h-5" />
                            General Details
                        </h2>

                        <form action={formAction} className="space-y-6">
                            <input type="hidden" name="folderId" value={folder.id} />

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Collection Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    defaultValue={folder.name}
                                    className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-sm text-lg font-bold focus:border-black focus:ring-0 outline-none transition-all"
                                    placeholder="e.g. Japan Trip 2026"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Icon (Emoji)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="text"
                                        name="icon"
                                        defaultValue={folder.icon}
                                        className="w-16 text-center bg-slate-50 border-2 border-slate-200 p-3 rounded-sm text-2xl font-bold focus:border-black focus:ring-0 outline-none transition-all"
                                        placeholder="📁"
                                        maxLength={2}
                                    />
                                    <p className="text-xs text-slate-400 max-w-[200px]">
                                        Paste an emoji here to represent your collection.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t-2 border-slate-100 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="bg-black text-white px-6 py-3 rounded-sm font-bold uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]"
                                >
                                    {isPending ? 'Saving...' : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>

                {/* RIGHT COLUMN: MEMBERS & DANGER */}
                <div className="space-y-8">

                    {/* MEMBERS SECTION (READ ONLY FOR NOW) */}
                    <section className="manga-panel p-6 shadow-[4px_4px_0px_0px_#000]">
                        <h2 className="manga-header text-lg mb-4">Members</h2>
                        <div className="space-y-3">
                            {members.map((m: any) => (
                                <div key={m.user?.id || Math.random()} className="flex items-center gap-3 p-2 border-b border-slate-100">
                                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold border border-black">
                                        {m.user?.email?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold truncate">{m.user?.email}</p>
                                        <p className="text-xs text-slate-500 font-mono capitalize">{m.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <p className="text-xs text-slate-400 text-center">Inivtes are handled via Auth codes.</p>
                        </div>
                    </section>

                    {/* DANGER ZONE */}
                    <section className="border-2 border-red-200 bg-red-50 p-6 rounded-sm">
                        <h2 className="manga-header text-red-600 text-lg mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Danger Zone
                        </h2>

                        {!isConfirmingDelete ? (
                            <button
                                onClick={() => setIsConfirmingDelete(true)}
                                type="button"
                                className="w-full bg-white border-2 border-red-200 text-red-600 py-2 rounded-sm font-bold hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Collection
                            </button>
                        ) : (
                            <form action={deleteAction} className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                <p className="text-sm text-red-800 font-bold">Are you absolutely sure?</p>
                                <p className="text-xs text-red-600 mb-2">This action cannot be undone. All expenses will be lost.</p>
                                <input type="hidden" name="folderId" value={folder.id} />
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsConfirmingDelete(false)}
                                        className="flex-1 bg-white border border-slate-300 py-2 text-sm font-bold rounded-sm hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isDeleting}
                                        className="flex-1 bg-red-600 text-white py-2 text-sm font-bold rounded-sm hover:bg-red-700 shadow-md"
                                    >
                                        {isDeleting ? 'Deleting...' : 'Confirm'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>

                </div>
            </div>
        </div>
    )
}
