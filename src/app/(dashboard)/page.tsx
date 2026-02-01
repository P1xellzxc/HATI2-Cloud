import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Sparkles, Folder, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch folders for the user
    const { data: folders } = await supabase
        .from('folders')
        .select('*, folder_members!inner(user_id)')
        .eq('folder_members.user_id', user?.id)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen pb-safe-24">
            {/* Header Section */}
            <header className="px-4 pt-safe-6 pb-6 bg-gradient-to-b from-yellow-50 to-white">
                <div className="flex items-start gap-4 animate-slide-down">
                    <div className="h-14 w-14 bg-yellow-400 border-3 border-black flex items-center justify-center text-3xl flex-shrink-0"
                        style={{ boxShadow: '3px 3px 0px 0px #000' }}>
                        👋
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-black text-black tracking-tight">
                            Welcome back!
                        </h1>
                        <p className="text-sm text-gray-500 font-medium mt-1 truncate">
                            {user?.email || 'Your expense collections'}
                        </p>
                    </div>
                </div>
            </header>

            {/* Quick Stats (if folders exist) */}
            {folders && folders.length > 0 && (
                <div className="px-4 py-4 animate-fade-in animate-delay-100">
                    <div className="flex gap-3 overflow-x-auto hide-scrollbar">
                        <div className="flex-shrink-0 manga-panel-flat p-4 min-w-[140px]"
                            style={{ boxShadow: '3px 3px 0px 0px #000' }}>
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                <Folder className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase">Folders</span>
                            </div>
                            <p className="text-2xl font-black">{folders.length}</p>
                        </div>
                        <div className="flex-shrink-0 manga-panel-flat p-4 min-w-[140px] bg-yellow-50"
                            style={{ boxShadow: '3px 3px 0px 0px #000' }}>
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase">Active</span>
                            </div>
                            <p className="text-2xl font-black text-yellow-600">{folders.length}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Section Title */}
            <div className="px-4 py-3">
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Your Collections
                </h2>
            </div>

            {/* Folder Grid */}
            <div className="px-4 space-y-4">
                {/* Create New Card - Always First */}
                <Link
                    href="/new-folder"
                    className="group block manga-card-interactive p-6 border-dashed animate-slide-up touch-feedback"
                >
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-gray-100 border-2 border-black flex items-center justify-center rounded-full group-active:scale-95 transition-transform"
                            style={{ boxShadow: '2px 2px 0px 0px #000' }}>
                            <Sparkles className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-lg text-gray-800 group-hover:text-black">
                                Create New
                            </h3>
                            <p className="text-sm text-gray-500 font-medium">
                                Start tracking expenses
                            </p>
                        </div>
                        <div className="text-gray-400 group-hover:text-black transition-colors">
                            <Plus className="w-6 h-6" />
                        </div>
                    </div>
                </Link>

                {/* Existing Folders */}
                {folders?.map((folder, index) => (
                    <Link
                        key={folder.id}
                        href={`/folder/${folder.id}`}
                        className={`block manga-card-interactive p-6 animate-slide-up touch-feedback stagger-${Math.min(index + 1, 5)}`}
                        style={{ animationDelay: `${(index + 1) * 0.05}s` }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 bg-yellow-100 border-2 border-black flex items-center justify-center text-2xl flex-shrink-0"
                                style={{ boxShadow: '2px 2px 0px 0px #000' }}>
                                {folder.icon || '📁'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-black text-lg text-black truncate">
                                    {folder.name}
                                </h3>
                                <p className="text-sm text-gray-500 font-medium">
                                    {folder.currency || 'PHP'} • Tap to open
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}

                {/* Empty State */}
                {(!folders || folders.length === 0) && (
                    <div className="text-center py-12 animate-fade-in">
                        <div className="h-20 w-20 mx-auto mb-4 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-4xl">
                            📂
                        </div>
                        <h3 className="font-black text-lg text-gray-600 mb-2">
                            No folders yet
                        </h3>
                        <p className="text-sm text-gray-400 mb-6">
                            Create your first expense collection
                        </p>
                        <Link
                            href="/new-folder"
                            className="inline-block manga-button-primary px-8 py-3 text-sm"
                        >
                            Create Folder →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
