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

// Test Supabase connection
export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // First test: simple count
    const { count, error: countError } = await supabase
      .from('candidates')
      .select('*', { count: 'exact', head: true })

    console.log('Count query result:', { count, countError })

    if (countError) {
      console.error('Count query failed:', countError)
      return { success: false, error: countError.message }
    }

    // Second test: try to fetch one row
    const { data: oneRow, error: fetchError } = await supabase
      .from('candidates')
      .select('id, name, email')
      .limit(1)

    console.log('Fetch one row result:', { oneRow, fetchError })

    if (fetchError) {
      console.error('Fetch query failed:', fetchError)
      return { success: false, error: fetchError.message }
    }

    console.log('Supabase connection test successful')
    return { 
      success: true, 
      count: count || 0,
      sampleData: oneRow 
    }
  } catch (error) {
    console.error('Supabase connection test error:', error)
    return { success: false, error: String(error) }
  }
}

// Function to fetch candidates from Supabase
export async function fetchCandidatesFromSupabase(): Promise<SupabaseCandidate[]> {
  try {
    console.log('Starting to fetch candidates from Supabase...')
    console.log('Supabase URL:', supabaseUrl)
    console.log('Using anon key:', supabaseAnonKey.substring(0, 20) + '...')
    
    const { data, error, status, statusText } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false })

    console.log('Supabase response status:', status, statusText)
    console.log('Supabase response data:', data)
    console.log('Supabase response error:', error)

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw new Error(`Failed to fetch candidates: ${error.message} (Code: ${error.code})`)
    }

    console.log('Successfully fetched candidates:', data?.length || 0)
    if (data && data.length > 0) {
      console.log('First candidate:', data[0])
    }
    
    return data || []
  } catch (error) {
    console.error('Error fetching candidates:', error)
    throw error
  }
}