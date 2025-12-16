import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ylwlgahsilakiuyrxwfp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlsd2xnYWhzaWxha2l1eXJ4d2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MzAxMTEsImV4cCI6MjA4MTMwNjExMX0.INLijZaRQtTG0LEDhW4HKPo09RKp4EW0lYCmHWRn6I0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definition for Supabase candidate data
export interface SupabaseCandidate {
  id: string
  created_at: string
  job_id: string
  ai_score: number | null
  phone: string
  resume_text: string
  ai_key_strengths: string[] | null
  stage: string
  ai_red_flags: string[] | null
  ai_recommendation: string | null
  ai_summary: string | null
  name: string
  email: string
  interview_slot: string | null
  status: string | null
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

// Test jobs table connection
export async function testJobsTable() {
  try {
    const { count, error } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Jobs table test failed:', error)
      return { success: false, error: error.message }
    }

    return { success: true, count: count || 0 }
  } catch (error) {
    console.error('Jobs table test error:', error)
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

// Job-related types and functions
export interface SupabaseJob {
  id: string
  created_at: string
  title: string
  description_text: string
  department: string
  requirements: string | null
  location: string | null
  type: string
  status: string
}

export interface InsertJob {
  title: string
  description_text: string
  department: string
  requirements?: string
  location?: string
  type: string
  status: string
}

// Function to create a job in Supabase
export async function createJobInSupabase(job: InsertJob): Promise<SupabaseJob> {
  try {
    console.log('Creating job in Supabase:', job)
    
    const { data, error } = await supabase
      .from('jobs')
      .insert([job])
      .select()
      .single()

    if (error) {
      console.error('Supabase job creation error:', error)
      throw new Error(`Failed to create job: ${error.message}`)
    }

    console.log('Successfully created job:', data)
    return data
  } catch (error) {
    console.error('Error creating job:', error)
    throw error
  }
}

// Function to fetch jobs from Supabase
export async function fetchJobsFromSupabase(): Promise<SupabaseJob[]> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase jobs fetch error:', error)
      throw new Error(`Failed to fetch jobs: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Error fetching jobs:', error)
    throw error
  }
}

// Function to fetch a single job by ID
export async function fetchJobByIdFromSupabase(jobId: string): Promise<SupabaseJob | null> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      console.error('Supabase job fetch error:', error)
      throw new Error(`Failed to fetch job: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error fetching job:', error)
    throw error
  }
}

// Function to delete a candidate from Supabase
export async function deleteCandidateFromSupabase(candidateId: string): Promise<void> {
  try {
    console.log('Deleting candidate from Supabase:', candidateId)
    
    const { error } = await supabase
      .from('candidates')
      .delete()
      .eq('id', candidateId)

    if (error) {
      console.error('Supabase candidate deletion error:', error)
      throw new Error(`Failed to delete candidate: ${error.message}`)
    }

    console.log('Successfully deleted candidate:', candidateId)
  } catch (error) {
    console.error('Error deleting candidate:', error)
    throw error
  }
}