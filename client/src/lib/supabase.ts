import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ylwlgahsilakiuyrxwfp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlsd2xnYWhzaWxha2l1eXJ4d2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MzAxMTEsImV4cCI6MjA4MTMwNjExMX0.INLijZaRQtTG0LEDhW4HKPo09RKp4EW0lYCmHWRn6I0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definition for Supabase candidate data
export interface SupabaseCandidate {
  id: string
  created_at: string
  job_id: string
  ai_score: number
  phone: string
  resume_text: string
  ai_key_strengths: string[]
  stage: string
  ai_red_flags: string[]
  ai_recommendation: string
  ai_summary: string
  name: string
  email: string
}

// Function to fetch candidates from Supabase
export async function fetchCandidatesFromSupabase(): Promise<SupabaseCandidate[]> {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`Failed to fetch candidates: ${error.message}`)
    }

    console.log('Fetched candidates from Supabase:', data?.length || 0)
    return data || []
  } catch (error) {
    console.error('Error fetching candidates:', error)
    throw error
  }
}