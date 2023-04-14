import { createClient } from '@supabase/supabase-js'
import { SupabaseDatabase } from 'types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabaseClient = createClient<SupabaseDatabase>(supabaseUrl, supabaseAnonKey)
