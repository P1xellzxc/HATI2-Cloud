import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/auth/actions'
import { Folder, LogOut, Plus, Settings } from 'lucide-react'

import { MobileNav } from '@/components/layout/MobileNav'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch folders the user is a member of
    const { data: folders } = await supabase
        .from('folders')
        .select('id, name, icon')
        .order('created_at', { ascending: false })

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans">
            {/* Sidebar Navigation */}
            <aside className="hidden w-72 border-r-2 border-black bg-white md:flex md:flex-col shadow-none">
                <div className="flex h-20 items-center justify-center border-b-2 border-black px-6 bg-yellow-50">
                    <Link href="/" className="flex items-center gap-2 font-black text-2xl tracking-tight text-black hover:text-red-500 transition-colors">
                        <span className="text-3xl">👺</span>
                        <span className="manga-header text-3xl">HATI²</span>
                    </Link>
                </div>

                <div className="flex flex-1 flex-col overflow-y-auto p-4 space-y-6">
                    <div className="manga-panel p-4 bg-white shadow-[4px_4px_0px_0px_#000]">
                        <h3 className="manga-header text-xs text-slate-500 mb-4 px-2">Collections</h3>
                        <nav className="space-y-2">
                            {folders?.map((folder) => (
                                <Link
                                    key={folder.id}
                                    href={`/folder/${folder.id}`}
                                    className="flex items-center gap-3 rounded-sm border-2 border-transparent px-3 py-3 text-sm font-bold text-slate-700 hover:border-black hover:bg-red-50 hover:shadow-[2px_2px_0px_0px_#000] transition-all"
                                >
                                    <span className="text-xl">{folder.icon || '📁'}</span>
                                    {folder.name}
                                </Link>
                            ))}

                            <Link
                                href="/new-folder"
                                className="flex items-center gap-3 rounded-sm border-2 border-dashed border-slate-300 px-3 py-3 text-sm font-bold text-slate-400 hover:border-black hover:text-black hover:bg-white hover:shadow-[2px_2px_0px_0px_#000] transition-all"
                            >
                                <Plus className="h-5 w-5" />
                                Create New
                            </Link>
                        </nav>
                    </div>


                    {/* New Section: Social */}
                    <div className="manga-panel p-4 bg-white shadow-[4px_4px_0px_0px_#000]">
                        <h3 className="manga-header text-xs text-slate-500 mb-4 px-2">Social</h3>
                        <nav className="space-y-2">
                            <Link
                                href="/invitations"
                                className="flex items-center gap-3 rounded-sm border-2 border-transparent px-3 py-3 text-sm font-bold text-slate-700 hover:border-black hover:bg-red-50 hover:shadow-[2px_2px_0px_0px_#000] transition-all"
                            >
                                <span className="text-xl">💌</span>
                                Invitations
                            </Link>
                            <Link
                                href="/settings/profile"
                                className="flex items-center gap-3 rounded-sm border-2 border-transparent px-3 py-3 text-sm font-bold text-slate-700 hover:border-black hover:bg-red-50 hover:shadow-[2px_2px_0px_0px_#000] transition-all"
                            >
                                <span className="text-xl">👤</span>
                                My Profile
                            </Link>
                        </nav>
                    </div>
                </div>

                <div className="border-t-2 border-black p-4 bg-white">
                    <div className="manga-panel-sm flex items-center gap-3 px-3 py-3 rounded-sm bg-white hover:bg-slate-50 transition-colors shadow-[2px_2px_0px_0px_#000]">
                        <div className="h-8 w-8 bg-black rounded-sm flex items-center justify-center text-sm font-bold text-white">
                            {user.email?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-bold text-black font-mono">
                                {user.email?.split('@')[0]}
                            </p>
                        </div>
                        <form action={logout}>
                            <button title="Sign Out" className="text-slate-400 hover:text-red-500 transition-colors">
                                <LogOut className="h-5 w-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </aside >

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-background md:p-6">
                {children}
            </main>

            {/* Mobile Navigation (Visible on Mobile) */}
            <MobileNav />
        </div >
    )
}
