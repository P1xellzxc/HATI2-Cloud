import { createClient } from '@/lib/supabase/server'
import { Activity, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export async function ActivityFeed({ folderId }: { folderId: string }) {
    const supabase = await createClient()

    // Fetch logs
    const { data: logs } = await supabase
        .from('activity_logs')
        .select(`
            id,
            action_type,
            created_at,
            details,
            user:users (display_name)
        `)
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false })
        .limit(20)

    if (!logs || logs.length === 0) return null

    return (
        <div className="manga-panel p-6 bg-slate-50 border-dashed">
            <div className="flex items-center gap-2 mb-4 border-b-2 border-slate-200 pb-2">
                <Activity className="w-5 h-5" />
                <h3 className="font-black uppercase text-sm tracking-widest">Latest Activity</h3>
            </div>

            <div className="space-y-4">
                {logs.map((log: any) => {
                    let message = ''
                    const actor = log.user?.display_name || 'Someone'

                    switch (log.action_type) {
                        case 'ADD_MEMBER':
                            message = `added ${log.details.member_name}`
                            break
                        case 'CREATE_EXPENSE':
                            message = `spent on ${log.details.description}`
                            break
                        case 'UPDATE_EXPENSE':
                            message = `updated ${log.details.description}`
                            break
                        case 'SETTLED':
                            message = `settled debts`
                            break
                        case 'MEMBER_CLAIMED':
                            message = `joined the party`
                            break
                        default:
                            message = 'did something'
                    }

                    return (
                        <div key={log.id} className="flex gap-3 text-sm">
                            <div className="mt-1">
                                <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                            </div>
                            <div>
                                <p>
                                    <span className="font-bold">{actor}</span> {message}
                                </p>
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-0.5">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(log.created_at)}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
