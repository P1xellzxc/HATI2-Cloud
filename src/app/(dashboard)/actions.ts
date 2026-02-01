'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CreateFolderSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    currency: z.string().length(3),
})

export async function createFolder(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // 1. Validate Input
    const parsed = CreateFolderSchema.safeParse({
        name: formData.get('name'),
        currency: formData.get('currency'),
    })

    if (!parsed.success) {
        return { success: false, message: parsed.error.issues[0].message }
    }

    // 2. Get User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, message: 'Unauthorized' }
    }

    const { name, currency } = parsed.data

    // 3. Insert Folder Transactionally using RPC
    const { data: folderId, error } = await supabase.rpc('create_folder_transaction', {
        name,
        currency,
        icon: '📁'
    })

    if (error) {
        return { success: false, message: 'Failed to create folder: ' + error.message }
    }

    revalidatePath('/')
    redirect(`/folder/${folderId}`)
}

const CreateExpenseSchema = z.object({
    folderId: z.string().uuid(),
    description: z.string().min(1, 'Description is required'),
    amount: z.coerce.number().positive(),
    date: z.string(),
    category: z.string().optional(),
    paidByMemberId: z.string().uuid().optional(), // New field: Member ID (link table)
    splitWith: z.union([z.string(), z.array(z.string())]).optional(),
    splitDetails: z.string().optional(), // New field: JSON string from advanced UI
})

export async function createExpense(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // 1. Validate
    const parsed = CreateExpenseSchema.safeParse({
        folderId: formData.get('folderId'),
        description: formData.get('description'),
        amount: formData.get('amount'),
        date: formData.get('date'),
        category: formData.get('category'),
        paidByMemberId: formData.get('paidByMemberId'), // Get selected member ID
        splitWith: formData.getAll('splitWith'), // Use getAll for checkboxes
        splitDetails: formData.get('splitDetails'),
    })

    if (!parsed.success) {
        return { success: false, message: parsed.error.issues[0].message }
    }

    const { folderId, description, amount, date, category, paidByMemberId, splitWith, splitDetails } = parsed.data

    // 2. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }

    // 3. Resolve "Paid By" User ID (if applicable)
    // We have the Member ID. We need to store:
    // - paid_by_member_id (The FK to folder_members)
    // - paid_by (The FK to users, if the member is a real user)

    let realUserId = null

    // Default to current user if no member selected (fallback)
    // But ideally user MUST select a member now.

    if (paidByMemberId) {
        const { data: member } = await supabase
            .from('folder_members')
            .select('user_id')
            .eq('id', paidByMemberId)
            .single()

        if (member?.user_id) {
            realUserId = member.user_id
        }
    } else {
        // Fallback: If for some reason no member selected, try to find the current user's member ID?
        // For now, let's just error or require it. The UI defaults to first member.
        // Or we just default to current user id for legacy support?
        realUserId = user.id
    }

    // Resolve Split Details Logic
    let finalSplitDetails = {}

    if (splitDetails) {
        // Mode 1: Advanced Split (JSON provided by UI)
        try {
            finalSplitDetails = JSON.parse(splitDetails)
        } catch (e) {
            console.error('Failed to parse splitDetails:', e)
            return { success: false, message: 'Invalid split data structure' }
        }
    } else {
        // Mode 2: Legacy/Simple Split (Checkboxes only)
        // Normalize splitWith to array
        const splitMembers = Array.isArray(splitWith) ? splitWith : (splitWith ? [splitWith] : [])
        // Construct Split Details JSON
        // { "type": "equal", "members": ["member_id_1", "member_id_2"] } -> Now storing MEMBER IDs
        finalSplitDetails = {
            type: 'equal',
            members: splitMembers.length > 0 ? splitMembers : []
        }
    }

    const { error } = await supabase
        .from('expenses')
        .insert({
            folder_id: folderId,
            paid_by_member_id: paidByMemberId, // Store the Member ID link
            paid_by: realUserId, // Store the User ID link (nullable now)
            description,
            amount,
            date,
            category,
            split_details: finalSplitDetails
        })

    if (error) {
        console.error('Create Expense Error:', error)
        return { success: false, message: 'Failed to save expense: ' + error.message }
    }

    revalidatePath(`/folder/${folderId}`)
    redirect(`/folder/${folderId}`)
}

const UpdateExpenseSchema = CreateExpenseSchema.extend({
    expenseId: z.string().uuid()
})

export async function updateExpense(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const parsed = UpdateExpenseSchema.safeParse({
        expenseId: formData.get('expenseId'),
        folderId: formData.get('folderId'),
        description: formData.get('description'),
        amount: formData.get('amount'),
        date: formData.get('date'),
        category: formData.get('category'),
        paidByMemberId: formData.get('paidByMemberId'),
        splitWith: formData.getAll('splitWith'),
        splitDetails: formData.get('splitDetails'),
    })

    if (!parsed.success) {
        console.error('Validation Error for Update:', parsed.error)
        return { success: false, message: parsed.error.issues[0].message }
    }

    console.log('UpdateExpense Payload:', parsed.data)

    const { expenseId, folderId, description, amount, date, category, paidByMemberId, splitWith, splitDetails } = parsed.data

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }

    // Resolve Payer
    let realUserId = null
    if (paidByMemberId) {
        const { data: member } = await supabase
            .from('folder_members')
            .select('user_id')
            .eq('id', paidByMemberId)
            .single()

        if (member?.user_id) realUserId = member.user_id
    } else {
        realUserId = user.id
    }

    // Resolve Split Details Logic
    let finalSplitDetails = {}

    if (splitDetails) {
        try {
            finalSplitDetails = JSON.parse(splitDetails)
        } catch (e) {
            console.error('Failed to parse splitDetails:', e)
            return { success: false, message: 'Invalid split data structure' }
        }
    } else {
        const splitMembers = Array.isArray(splitWith) ? splitWith : (splitWith ? [splitWith] : [])
        finalSplitDetails = {
            type: 'equal',
            members: splitMembers.length > 0 ? splitMembers : []
        }
    }

    const { error } = await supabase
        .from('expenses')
        .update({
            paid_by_member_id: paidByMemberId,
            paid_by: realUserId,
            description,
            amount,
            date,
            category,
            split_details: finalSplitDetails
        })
        .eq('id', expenseId)
        .eq('folder_id', folderId) // Security check

    if (error) {
        console.error('Update Expense Error:', error)
        return { success: false, message: 'Failed to update expense: ' + error.message }
    }

    revalidatePath(`/folder/${folderId}`)
    redirect(`/folder/${folderId}`)
}

const UpdateFolderSchema = z.object({
    folderId: z.string().uuid(),
    name: z.string().min(1, 'Name is required'),
    icon: z.string().optional(),
})

export async function updateFolder(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const parsed = UpdateFolderSchema.safeParse({
        folderId: formData.get('folderId'),
        name: formData.get('name'),
        icon: formData.get('icon'),
    })

    if (!parsed.success) {
        return { success: false, message: parsed.error.issues[0].message }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }

    // RLS will handle permission checks (Update policy required)
    const { error } = await supabase
        .from('folders')
        .update({
            name: parsed.data.name,
            icon: parsed.data.icon || '📁'
        })
        .eq('id', parsed.data.folderId)
        .eq('owner_id', user.id) // Extra safety: only owner can update for now

    if (error) {
        return { success: false, message: 'Failed to update folder' }
    }

    revalidatePath(`/folder/${parsed.data.folderId}`)
    return { success: true, message: 'Folder updated' }
}

const DeleteFolderSchema = z.object({
    folderId: z.string().uuid(),
})

export async function deleteFolder(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const parsed = DeleteFolderSchema.safeParse({
        folderId: formData.get('folderId'),
    })

    if (!parsed.success) {
        return { success: false, message: 'Invalid folder ID' }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }

    // RLS check implies Owner/Member, but strictly restricting delete to Owner is good practice
    const { error, count } = await supabase
        .from('folders')
        .delete({ count: 'exact' })
        .eq('id', parsed.data.folderId)
        .eq('owner_id', user.id) // Only owner can delete

    if (error || count === 0) {
        return { success: false, message: 'Failed to delete folder (Permission denied or not found)' }
    }



    revalidatePath('/')
    redirect('/')
}

const AddMemberSchema = z.object({
    folderId: z.string().uuid(),
    name: z.string().min(1, 'Name is required'),
    email: z.string().email().optional().or(z.literal('')),
})

export async function addMember(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const parsed = AddMemberSchema.safeParse({
        folderId: formData.get('folderId'),
        name: formData.get('name'),
        email: formData.get('email'),
    })

    if (!parsed.success) {
        return { success: false, message: parsed.error.issues[0].message }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }

    // Check permissions
    const { data: membership } = await supabase
        .from('folder_members')
        .select('role')
        .eq('folder_id', parsed.data.folderId)
        .eq('user_id', user.id)
        .single()

    if (!membership || !['owner', 'editor'].includes(membership.role)) {
        return { success: false, message: 'Permission denied: must be owner or editor' }
    }

    // Insert Placeholder Member
    const { data: newMember, error } = await supabase
        .from('folder_members')
        .insert({
            folder_id: parsed.data.folderId,
            temp_name: parsed.data.name,
            invite_email: parsed.data.email || null,
            role: 'viewer'
        })
        .select('id, invite_token')
        .single()

    if (error) {
        return { success: false, message: 'Failed to add member: ' + error.message }
    }

    await logActivity(supabase, parsed.data.folderId, user.id, 'ADD_MEMBER', { member_name: parsed.data.name, email: parsed.data.email })

    revalidatePath(`/folder/${parsed.data.folderId}`)
    return { success: true, message: 'Member added', memberId: newMember.id, inviteToken: newMember.invite_token }
}

// --- PHASE 2 ACTIONS ---

// Helper for Activity Logging
async function logActivity(supabase: any, folderId: string, userId: string, actionType: string, details: any = {}) {
    try {
        await supabase.from('activity_logs').insert({
            folder_id: folderId,
            user_id: userId,
            action_type: actionType,
            details: details
        })
    } catch (e) {
        console.error('Failed to log activity:', e)
    }
}

const ClaimMemberSchema = z.object({
    token: z.string().uuid(),
})

export async function claimMember(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const parsed = ClaimMemberSchema.safeParse({
        token: formData.get('token'),
    })

    if (!parsed.success) {
        return { success: false, message: 'Invalid invite token' }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        // Redirect to login with return URL if not logged in?
        // For now, assuming middleware handles auth or we return specific error code
        return { success: false, message: 'Please log in to accept the invite', requiresAuth: true }
    }

    // Call RPC to claim
    const { data: success, error } = await supabase.rpc('claim_member_profile', {
        p_invite_token: parsed.data.token,
        p_user_id: user.id
    })

    if (error || !success) {
        return { success: false, message: 'Failed to claim profile. Token might be invalid or already used.' }
    }

    // We need to find the folderId to redirect
    // Provide a query for this or just redirect to root and let them find it
    revalidatePath('/')
    redirect('/')
}

const RegenerateTokenSchema = z.object({
    memberId: z.string().uuid(),
    folderId: z.string().uuid(),
})

export async function regenerateInviteToken(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const parsed = RegenerateTokenSchema.safeParse({
        memberId: formData.get('memberId'),
        folderId: formData.get('folderId')
    })

    if (!parsed.success) return { success: false, message: 'Invalid Input' }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }

    // Check permissions (Owner only?)
    const { data: currentUserMember } = await supabase
        .from('folder_members')
        .select('role')
        .eq('folder_id', parsed.data.folderId)
        .eq('user_id', user.id)
        .single()

    if (!currentUserMember || currentUserMember.role !== 'owner') {
        return { success: false, message: 'Only owners can manage invite links' }
    }

    const { error } = await supabase
        .from('folder_members')
        .update({ invite_token: crypto.randomUUID() }) // Client-side UUID gen or let DB do it? 
        // DB default is gen_random_uuid(), but for update we need to pass value or use DEFAULT keyword if supported via helper
        // Let's just use SQL or a uuid lib. Since we are in Node/Next, crypto.randomUUID is available.
        .eq('id', parsed.data.memberId)

    if (error) return { success: false, message: 'Failed to regenerate token' }

    revalidatePath(`/folder/${parsed.data.folderId}`)
    return { success: true, message: 'Token regenerated' }
}

