import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { User, Save } from 'lucide-react'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch Profile
    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    async function updateProfile(formData: FormData) {
        'use server'
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const displayName = formData.get('displayName') as string
        const defaultCurrency = formData.get('defaultCurrency') as string

        await supabase
            .from('users')
            .update({
                display_name: displayName,
                default_currency: defaultCurrency
            })
            .eq('id', user.id)

        revalidatePath('/settings/profile')
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 border-b-4 border-black pb-6">
                <div className="bg-black text-white p-2">
                    <User className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-4xl font-black uppercase manga-title leading-none">Identity Card</h1>
                    <p className="font-mono text-sm mt-1 uppercase text-slate-500">
                        Customize your persona
                    </p>
                </div>
            </div>

            <form action={updateProfile} className="manga-panel p-8 space-y-6 max-w-lg">
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest">Display Name</label>
                    <input
                        name="displayName"
                        defaultValue={profile?.display_name || ''}
                        className="manga-input w-full"
                        placeholder="e.g. Satoshi Nakamoto"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest">Email</label>
                    <input
                        disabled
                        value={user.email}
                        className="manga-input w-full bg-slate-100 text-slate-500 cursor-not-allowed"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest">Default Currency</label>
                    <select
                        name="defaultCurrency"
                        defaultValue={profile?.default_currency || 'PHP'}
                        className="manga-input w-full h-[50px]"
                    >
                        <option value="PHP">PHP (₱)</option>
                        <option value="USD">USD ($)</option>
                        <option value="JPY">JPY (¥)</option>
                        <option value="EUR">EUR (€)</option>
                    </select>
                </div>

                <div className="pt-4">
                    <button className="manga-button-primary w-full flex items-center justify-center gap-2">
                        <Save className="w-5 h-5" />
                        UPDATE ID
                    </button>
                </div>
            </form>
        </div>
    )
}
