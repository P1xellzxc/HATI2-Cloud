import { Expense, Member } from '../logic/settlements'

export interface ChartData {
    name: string
    value: number
    fill?: string
}

export interface MemberStat {
    name: string
    paid: number
    share: number // How much they are "responsible" for (based on splits)
}

export function getCategoryBreakdown(expenses: Expense[]): ChartData[] {
    const categories: Record<string, number> = {}

    expenses.forEach(exp => {
        const cat = exp.category || 'Uncategorized'
        categories[cat] = (categories[cat] || 0) + Number(exp.amount)
    })

    return Object.entries(categories)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
}

export function getDailyTrend(expenses: Expense[]): { date: string, amount: number }[] {
    const days: Record<string, number> = {} // YYYY-MM-DD -> Amount

    expenses.forEach(exp => {
        const dateStr = String(exp.date).split('T')[0]
        days[dateStr] = (days[dateStr] || 0) + Number(exp.amount)
    })

    // Sort by date and take last 14 days (or all?) - Let's do all for now, simpler
    return Object.entries(days)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function getMemberStats(expenses: Expense[], members: Member[]): MemberStat[] {
    const stats: Record<string, MemberStat> = {}

    // Init
    members.forEach(m => {
        stats[m.id] = { name: m.displayName, paid: 0, share: 0 }
    })

    expenses.forEach(exp => {
        const amount = Number(exp.amount)

        // 1. Paid Amount
        if (exp.paid_by_member_id && stats[exp.paid_by_member_id]) {
            stats[exp.paid_by_member_id].paid += amount
        }

        // 2. Share Amount (Usage)
        if (exp.split_details) {
            const details = exp.split_details
            if (details.type === 'equal') {
                const splitMembers: string[] = details.members || []
                if (splitMembers.length > 0) {
                    const share = amount / splitMembers.length
                    splitMembers.forEach(id => {
                        if (stats[id]) stats[id].share += share
                    })
                }
            }
            else if (details.type === 'exact') {
                const allocations: Record<string, number> = details.allocations || {}
                Object.entries(allocations).forEach(([id, alloc]) => {
                    if (stats[id]) stats[id].share += Number(alloc)
                })
            }
            else if (details.type === 'percentage') {
                const allocations: Record<string, number> = details.allocations || {}
                Object.entries(allocations).forEach(([id, alloc]) => {
                    if (stats[id]) stats[id].share += (Number(alloc) / 100) * amount
                })
            }
        }
    })

    return Object.values(stats).sort((a, b) => b.paid - a.paid)
}
