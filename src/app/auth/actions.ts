'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const supabase = await createClient()

    // 1. Passwordless Sign-In (OTP/Magic Link)
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            // Determines where to redirect after clicking the magic link
            emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
        },
    })

    if (error) {
        return { success: false, message: error.message }
    }

    // Success state to show UI feedback
    return {
        success: true,
        message: 'Check your email for the login link!'
    }
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
