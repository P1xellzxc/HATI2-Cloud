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
    paidBy: z.string().uuid().optional(),
    splitWith: z.union([z.string(), z.array(z.string())]).optional(), // Checkboxes submit as string or array
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
    })

    if (!parsed.success) {
        return { success: false, message: parsed.error.issues[0].message }
    }

    // 2. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }

    // 3. Authorization Check (RLS handles it, but good to check membership specifically if we want custom error)
    // We rely on RLS policy: "Editors can insert expenses"

    const { folderId, description, amount, date, category, paidBy, splitWith } = parsed.data

    // Normalize splitWith to array
    const splitMembers = Array.isArray(splitWith) ? splitWith : (splitWith ? [splitWith] : [])

    // Construct Split Details JSON
    // { "type": "equal", "members": ["id1", "id2"] }
    const splitDetails = {
        type: 'equal',
        members: splitMembers.length > 0 ? splitMembers : [user.id] // Default to purely personal if no split selected
    }

    const { error } = await supabase
        .from('expenses')
        .insert({
            folder_id: folderId,
            paid_by: paidBy || user.id, // Use selected payer or current user
            description,
            amount,
            date,
            category,
            split_details: splitDetails
        })

    if (error) {
        return { success: false, message: 'Failed to save expense: ' + error.message }
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
    const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', parsed.data.folderId)
        .eq('owner_id', user.id) // Only owner can delete

    if (error) {
        return { success: false, message: 'Failed to delete folder' }
    }

    revalidatePath('/')
    redirect('/')
}
