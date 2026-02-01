export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    display_name: string | null
                    avatar_url: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    email: string
                    display_name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    display_name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                }
            }
            folders: {
                Row: {
                    id: string
                    owner_id: string
                    name: string
                    currency: string
                    icon: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    owner_id: string
                    name: string
                    currency?: string
                    icon?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    owner_id?: string
                    name?: string
                    currency?: string
                    icon?: string | null
                    created_at?: string
                }
            }
            folder_members: {
                Row: {
                    id: string
                    folder_id: string
                    user_id: string | null
                    temp_name: string | null
                    role: 'owner' | 'editor' | 'viewer'
                }
                Insert: {
                    id?: string
                    folder_id: string
                    user_id?: string | null
                    temp_name?: string | null
                    role?: 'owner' | 'editor' | 'viewer'
                }
                Update: {
                    id?: string
                    folder_id?: string
                    user_id?: string | null
                    temp_name?: string | null
                    role?: 'owner' | 'editor' | 'viewer'
                }
            }
            expenses: {
                Row: {
                    id: string
                    folder_id: string
                    paid_by_member_id: string | null
                    paid_by: string | null
                    amount: number
                    description: string
                    category: string | null
                    split_details: Json | null
                    date: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    folder_id: string
                    paid_by_member_id?: string | null
                    paid_by?: string | null
                    amount: number
                    description: string
                    category?: string | null
                    split_details?: Json | null
                    date?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    folder_id?: string
                    paid_by_member_id?: string | null
                    paid_by?: string | null
                    amount?: number
                    description?: string
                    category?: string | null
                    split_details?: Json | null
                    date?: string
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            create_folder_transaction: {
                Args: {
                    name: string
                    currency: string
                    icon: string
                }
                Returns: string
            }
        }
        Enums: {
            [_ in never]: never
        }
    }
}
