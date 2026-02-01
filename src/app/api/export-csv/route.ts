import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const folderId = searchParams.get('folderId')

    if (!folderId) {
        return new NextResponse('Folder ID required', { status: 400 })
    }

    const supabase = await createClient()

    // 1. Check Auth & Membership
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })

    const { data: membership } = await supabase
        .from('folder_members')
        .select('role')
        .eq('folder_id', folderId)
        .eq('user_id', user.id)
        .single()

    if (!membership) return new NextResponse('Forbidden', { status: 403 })

    // 2. Fetch Data
    const { data: expenses } = await supabase
        .from('expenses')
        .select(`
            date,
            description,
            amount,
            category,
            paid_by:folder_members(temp_name, user:users(display_name))
        `)
        .eq('folder_id', folderId)
        .order('date', { ascending: false })

    if (!expenses) return new NextResponse('No data', { status: 404 })

    // 3. Generate CSV
    const csvRows = [
        ['Date', 'Description', 'Amount', 'Category', 'Paid By'],
        ...expenses.map((exp: any) => {
            const payerName = exp.paid_by?.temp_name || exp.paid_by?.user?.display_name || 'Unknown'
            return [
                exp.date,
                `"${exp.description.replace(/"/g, '""')}"`, // Escape quotes
                exp.amount,
                exp.category,
                `"${payerName.replace(/"/g, '""')}"`
            ]
        })
    ]

    const csvContent = csvRows.map(row => row.join(',')).join('\n')

    // 4. Return Response
    return new NextResponse(csvContent, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="folder-${folderId}-expenses.csv"`,
        },
    })
}
