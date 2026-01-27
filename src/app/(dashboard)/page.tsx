import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch recent activity or summary stats here in the future

    return (
        <div className="p-8 space-y-8">
            <header className="manga-panel p-8 bg-yellow-50 relative overflow-hidden">
                <div className="relative z-10 flex items-center gap-4 mb-2">
                    <span className="text-4xl">👋</span>
                    <h1 className="manga-header text-4xl text-black">Welcome back!</h1>
                </div>
                <p className="relative z-10 text-slate-600 font-medium font-mono">Here are your active expense collections.</p>

                {/* Decorative dots pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
            </header>

            {/* Folder Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Create New Card */}
                <Link href="/new-folder" className="group relative flex h-56 flex-col items-center justify-center rounded-sm border-2 border-dashed border-slate-300 bg-slate-50 hover:border-black hover:bg-white hover:shadow-[4px_4px_0px_0px_#000] transition-all">
                    <div className="h-16 w-16 mb-4 rounded-full bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                        ✨
                    </div>
                    <span className="font-bold text-slate-600 group-hover:text-black text-lg manga-header">Create New</span>
                    <span className="text-xs font-mono text-slate-400 mt-1">Start tracking</span>
                </Link>
            </div>
        </div>
    )
}
