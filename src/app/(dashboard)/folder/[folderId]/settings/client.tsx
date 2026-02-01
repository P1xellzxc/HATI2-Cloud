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
        <div className="max-w-4xl mx-auto p-8 space-y-12">
            <Link href={`/folder/${folder.id}`} className="inline-flex items-center gap-2 text-black hover:underline font-mono text-sm mb-4 uppercase tracking-widest">
                <ArrowLeft className="w-4 h-4" />
                Return to Dashboard
            </Link>

            <header className="flex items-center gap-6 pb-6 border-b-4 border-black">
                <div className="h-20 w-20 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center text-4xl">
                    {folder.icon || '📁'}
                </div>
                <div>
                    <h1 className="manga-title text-5xl mb-1">SETTINGS</h1>
                    <p className="font-mono text-sm uppercase tracking-wider bg-black text-white px-2 inline-block">
                        Folder Config // {folder.id.split('-')[0]}
                    </p>
                </div>
            </header>

            {/* ERROR / SUCCESS MESSAGES */}
            {state?.message && (
                <div className={`p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000] ${state.success ? 'bg-green-100' : 'bg-red-100'} font-bold flex items-center gap-2 uppercase font-mono`}>
                    {state.success ? '✨ SUCCESS:' : '⚠️ ERROR:'} {state.message}
                </div>
            )}

            <div className="grid gap-12 md:grid-cols-3">

                {/* LEFT COLUMN: EDIT FORM */}
                <div className="md:col-span-2 space-y-8">
                    {/* EDIT SECTION */}
                    <section className="manga-panel p-8">
                        <h2 className="manga-title text-2xl mb-8 flex items-center gap-2 border-b-2 border-black pb-2">
                            <Folder className="w-6 h-6" />
                            General Specs
                        </h2>

                        <form action={formAction} className="space-y-6">
                            <input type="hidden" name="folderId" value={folder.id} />

                            <div>
                                <label className="block text-xs font-black mb-2 uppercase tracking-widest">Collection Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    defaultValue={folder.name}
                                    className="manga-input w-full text-xl"
                                    placeholder="e.g. Japan Trip 2026"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black mb-2 uppercase tracking-widest">Icon (Emoji)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="text"
                                        name="icon"
                                        defaultValue={folder.icon}
                                        className="manga-input w-20 text-center text-3xl"
                                        placeholder="📁"
                                        maxLength={2}
                                    />
                                    <div className="font-mono text-xs text-slate-500 max-w-[200px] border-l-2 border-black pl-3">
                                        REPRESENT YOUR COLLECTION WITH A SYMBOL.
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 mt-6 border-t-2 border-black flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="manga-button-primary flex items-center gap-2"
                                >
                                    {isPending ? 'SAVING...' : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            SAVE CHANGES
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>

                {/* RIGHT COLUMN: MEMBERS & DANGER */}
                <div className="space-y-8">

                    {/* MEMBERS SECTION */}
                    <section className="manga-panel p-6 bg-slate-50">
                        <h2 className="manga-title text-lg mb-4 border-b-2 border-black pb-2">Members</h2>
                        <div className="space-y-4">
                            {members.map((m: any) => (
                                <div key={m.user?.id || Math.random()} className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-white flex items-center justify-center text-sm font-black border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                                        {m.user?.email?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold truncate font-mono">{m.user?.email}</p>
                                        <div className="text-[10px] font-black uppercase bg-black text-white inline-block px-1">
                                            {m.role}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t-2 border-dashed border-black">
                            <p className="text-xs font-mono uppercase text-center opacity-60">
                                Invites handled via Auth codes.
                            </p>
                        </div>
                    </section>

                    {/* DANGER ZONE */}
                    <section className="border-4 border-black bg-stripes-red p-6 shadow-[8px_8px_0px_0px_#000] relative overflow-hidden bg-white">
                        <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase">
                            Warning
                        </div>

                        <h2 className="manga-title text-red-600 text-xl mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6 stroke-[3]" />
                            DANGER ZONE
                        </h2>

                        {!isConfirmingDelete ? (
                            <button
                                onClick={() => setIsConfirmingDelete(true)}
                                type="button"
                                className="w-full bg-white border-2 border-red-600 text-red-600 py-3 font-black uppercase hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#dc2626]"
                            >
                                <Trash2 className="w-4 h-4" />
                                DELETE ARCHIVE
                            </button>
                        ) : (
                            <form action={deleteAction} className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="bg-red-50 border-2 border-red-200 p-3">
                                    <p className="text-sm font-bold text-red-900 uppercase">Final Warning</p>
                                    <p className="text-xs font-mono text-red-700">This action is irreversible. All data will be wiped.</p>
                                </div>
                                <input type="hidden" name="folderId" value={folder.id} />
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsConfirmingDelete(false)}
                                        className="flex-1 bg-white border-2 border-black py-2 text-sm font-bold uppercase hover:bg-slate-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isDeleting}
                                        className="flex-1 bg-red-600 border-2 border-black text-white py-2 text-sm font-bold uppercase hover:bg-red-700 shadow-[2px_2px_0px_0px_#000]"
                                    >
                                        {isDeleting ? 'WIPING...' : 'CONFIRM'}
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
