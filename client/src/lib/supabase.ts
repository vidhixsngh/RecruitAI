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

// Function to update interview slot for a candidate
export async function updateCandidateInterviewSlot(candidateId: string, interviewSlot: string): Promise<SupabaseCandidate> {
  try {
    console.log('Updating interview slot for candidate:', candidateId, 'to:', interviewSlot)
    
    const { data, error } = await supabase
      .from('candidates')
      .update({ 
        interview_slot: interviewSlot,
        stage: 'interview_scheduled' // Update stage to reflect scheduling
      })
      .eq('id', candidateId)
      .select()
      .single()

    if (error) {
      console.error('Supabase interview slot update error:', error)
      throw new Error(`Failed to update interview slot: ${error.message}`)
    }

    console.log('Successfully updated interview slot:', data)
    return data
  } catch (error) {
    console.error('Error updating interview slot:', error)
    throw error
  }
}

// Function to schedule interviews for multiple candidates
export async function scheduleInterviewsInSupabase(
  candidateIds: string[], 
  date: string, 
  time: string
): Promise<SupabaseCandidate[]> {
  try {
    console.log('Scheduling interviews for candidates:', candidateIds, 'on:', date, 'at:', time)
    
    // Format the interview slot string
    const interviewSlot = `${new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })} at ${time}`;
    
    // Update all candidates with the same interview slot
    const { data, error } = await supabase
      .from('candidates')
      .update({ 
        interview_slot: interviewSlot,
        stage: 'interview_scheduled'
      })
      .in('id', candidateIds)
      .select()

    if (error) {
      console.error('Supabase bulk interview scheduling error:', error)
      throw new Error(`Failed to schedule interviews: ${error.message}`)
    }

    console.log('Successfully scheduled interviews for', data?.length || 0, 'candidates')
    return data || []
  } catch (error) {
    console.error('Error scheduling interviews:', error)
    throw error
  }
}

// Function to update candidate status after email is sent
export async function updateCandidateEmailStatus(
  candidateId: string, 
  emailType: 'rejection' | 'interview' | 'prescreen',
  emailData?: {
    subject: string;
    body: string;
    sentAt: string;
  }
): Promise<SupabaseCandidate> {
  try {
    console.log('Updating email status for candidate:', candidateId, 'type:', emailType);
    
    const updateData: any = {
      stage: 'email_sent',
      status: 'email_sent'
    };
    
    // Add email metadata if provided
    if (emailData) {
      updateData.last_email_sent = emailData.sentAt;
      updateData.last_email_type = emailType;
      updateData.last_email_subject = emailData.subject;
    }
    
    const { data, error } = await supabase
      .from('candidates')
      .update(updateData)
      .eq('id', candidateId)
      .select()
      .single();

    if (error) {
      console.error('Supabase email status update error:', error);
      throw new Error(`Failed to update email status: ${error.message}`);
    }

    console.log('Successfully updated email status:', data);
    return data;
  } catch (error) {
    console.error('Error updating email status:', error);
    throw error;
  }
}

// Function to send rejection emails with full Supabase integration
export async function sendRejectionEmails(
  candidates: SupabaseCandidate[],
  emailSubject: string,
  emailBody: string
): Promise<{ success: boolean; results: any[]; updatedCandidates: SupabaseCandidate[] }> {
  try {
    console.log('🚀 Starting rejection email process for', candidates.length, 'candidates')
    
    const results = [];
    const updatedCandidates = [];
    
    // Fetch job information for better personalization
    const jobIds = [...new Set(candidates.map(c => c.job_id))];
    const jobs = await Promise.all(
      jobIds.map(async (jobId) => {
        try {
          return await fetchJobByIdFromSupabase(jobId);
        } catch (error) {
          console.warn(`Failed to fetch job ${jobId}:`, error);
          return null;
        }
      })
    );
    
    const jobMap = new Map(jobs.filter(Boolean).map(job => [job!.id, job!.title]));
    
    for (const candidate of candidates) {
      try {
        const jobTitle = jobMap.get(candidate.job_id) || 'Position';
        
        // Replace placeholders in messages
        const personalizedSubject = emailSubject
          .replace(/{name}/g, candidate.name)
          .replace(/{position}/g, jobTitle);
          
        const personalizedBody = emailBody
          .replace(/{name}/g, candidate.name)
          .replace(/{position}/g, jobTitle);

        // Step 1: Simulate sending the email
        // In a real implementation, you would integrate with:
        // - Email service (SendGrid, AWS SES, Resend, etc.)
        // - Example: await sendEmailViaService(candidate.email, personalizedSubject, personalizedBody);
        
        console.log(`📧 Sending rejection email to ${candidate.name} (${candidate.email})`);
        console.log(`📋 Subject: ${personalizedSubject}`);
        console.log(`📄 Body preview: ${personalizedBody.substring(0, 100)}...`);
        
        // Simulate email service API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Step 2: Update Supabase with email status
        const updatedCandidate = await updateCandidateEmailStatus(
          candidate.id,
          'rejection',
          {
            subject: personalizedSubject,
            body: personalizedBody,
            sentAt: new Date().toISOString()
          }
        );
        
        updatedCandidates.push(updatedCandidate);
        
        results.push({
          candidateId: candidate.id,
          candidateName: candidate.name,
          email: candidate.email,
          jobTitle,
          emailSent: true,
          databaseUpdated: true,
          personalizedSubject,
          personalizedBody,
          error: null
        });
        
        console.log(`✅ Successfully processed ${candidate.name}`);
        
      } catch (candidateError) {
        console.error(`❌ Failed to process ${candidate.name}:`, candidateError);
        results.push({
          candidateId: candidate.id,
          candidateName: candidate.name,
          email: candidate.email,
          emailSent: false,
          databaseUpdated: false,
          error: String(candidateError)
        });
      }
    }
    
    const successCount = results.filter(r => r.emailSent && r.databaseUpdated).length;
    console.log(`✅ Successfully processed ${successCount}/${candidates.length} rejection emails`);
    
    return {
      success: successCount > 0,
      results,
      updatedCandidates
    };
    
  } catch (error) {
    console.error('❌ Error in rejection email process:', error)
    throw error
  }
}

// Function to send prescreen call notifications with Supabase integration
export async function sendPrescreenNotifications(
  candidates: SupabaseCandidate[],
  callMessage: string,
  callDate: string,
  callTime: string
): Promise<{ success: boolean; results: any[]; updatedCandidates: SupabaseCandidate[] }> {
  try {
    console.log('🚀 Starting prescreen notification process for', candidates.length, 'candidates')
    
    const results = [];
    const updatedCandidates = [];
    
    // Fetch job information for better personalization
    const jobIds = [...new Set(candidates.map(c => c.job_id))];
    const jobs = await Promise.all(
      jobIds.map(async (jobId) => {
        try {
          return await fetchJobByIdFromSupabase(jobId);
        } catch (error) {
          console.warn(`Failed to fetch job ${jobId}:`, error);
          return null;
        }
      })
    );
    
    const jobMap = new Map(jobs.filter(Boolean).map(job => [job!.id, job!.title]));
    
    for (const candidate of candidates) {
      try {
        const jobTitle = jobMap.get(candidate.job_id) || 'Position';
        
        // Replace placeholders in message
        const personalizedMessage = callMessage
          .replace(/{name}/g, candidate.name)
          .replace(/{position}/g, jobTitle)
          .replace(/{date}/g, new Date(callDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }))
          .replace(/{time}/g, callTime);

        // Step 1: Simulate sending the notification
        console.log(`📞 Sending prescreen notification to ${candidate.name} (${candidate.email})`);
        console.log(`📄 Message: ${personalizedMessage.substring(0, 100)}...`);
        
        // Simulate notification service API call
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Step 2: Update Supabase with prescreen status
        const callSlot = `${new Date(callDate).toLocaleDateString('en-US', { 
          weekday: 'short', 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })} at ${callTime}`;
        
        const { data: updatedCandidate, error } = await supabase
          .from('candidates')
          .update({ 
            stage: 'prescreen_scheduled',
            status: 'prescreen_scheduled',
            interview_slot: callSlot, // Reuse this field for prescreen calls
            last_email_sent: new Date().toISOString(),
            last_email_type: 'prescreen'
          })
          .eq('id', candidate.id)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to update prescreen status: ${error.message}`);
        }
        
        updatedCandidates.push(updatedCandidate);
        
        results.push({
          candidateId: candidate.id,
          candidateName: candidate.name,
          email: candidate.email,
          jobTitle,
          notificationSent: true,
          databaseUpdated: true,
          personalizedMessage,
          callSlot,
          error: null
        });
        
        console.log(`✅ Successfully processed prescreen for ${candidate.name}`);
        
      } catch (candidateError) {
        console.error(`❌ Failed to process prescreen for ${candidate.name}:`, candidateError);
        results.push({
          candidateId: candidate.id,
          candidateName: candidate.name,
          email: candidate.email,
          notificationSent: false,
          databaseUpdated: false,
          error: String(candidateError)
        });
      }
    }
    
    const successCount = results.filter(r => r.notificationSent && r.databaseUpdated).length;
    console.log(`✅ Successfully processed ${successCount}/${candidates.length} prescreen notifications`);
    
    return {
      success: successCount > 0,
      results,
      updatedCandidates
    };
    
  } catch (error) {
    console.error('❌ Error in prescreen notification process:', error)
    throw error
  }
}

// Function to send interview notifications
export async function sendInterviewNotifications(
  candidates: SupabaseCandidate[],
  emailMessage: string,
  telegramMessage: string,
  interviewDate: string,
  interviewTime: string
): Promise<{ success: boolean; results: any[] }> {
  try {
    console.log('Sending interview notifications to', candidates.length, 'candidates')
    
    const results = [];
    
    // Fetch job information for better personalization
    const jobIds = [...new Set(candidates.map(c => c.job_id))];
    const jobs = await Promise.all(
      jobIds.map(async (jobId) => {
        try {
          return await fetchJobByIdFromSupabase(jobId);
        } catch (error) {
          console.warn(`Failed to fetch job ${jobId}:`, error);
          return null;
        }
      })
    );
    
    const jobMap = new Map(jobs.filter(Boolean).map(job => [job!.id, job!.title]));
    
    for (const candidate of candidates) {
      try {
        const jobTitle = jobMap.get(candidate.job_id) || 'Position';
        
        // Replace placeholders in messages
        const personalizedEmail = emailMessage
          .replace(/{name}/g, candidate.name)
          .replace(/{position}/g, jobTitle)
          .replace(/{date}/g, new Date(interviewDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }))
          .replace(/{time}/g, interviewTime);
          
        const personalizedTelegram = telegramMessage
          .replace(/{name}/g, candidate.name)
          .replace(/{position}/g, jobTitle)
          .replace(/{date}/g, new Date(interviewDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }))
          .replace(/{time}/g, interviewTime);

        // For now, we'll simulate sending notifications
        // In a real implementation, you would integrate with:
        // - Email service (SendGrid, AWS SES, Resend, etc.)
        // - Telegram Bot API
        
        console.log(`📧 Email notification for ${candidate.name} (${candidate.email}):`, personalizedEmail);
        console.log(`📱 Telegram notification for ${candidate.name}:`, personalizedTelegram);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 200));
        
        results.push({
          candidateId: candidate.id,
          candidateName: candidate.name,
          email: candidate.email,
          jobTitle,
          emailSent: true,
          telegramSent: true,
          personalizedEmail,
          personalizedTelegram,
          error: null
        });
        
      } catch (candidateError) {
        console.error(`Failed to send notifications to ${candidate.name}:`, candidateError);
        results.push({
          candidateId: candidate.id,
          candidateName: candidate.name,
          email: candidate.email,
          emailSent: false,
          telegramSent: false,
          error: String(candidateError)
        });
      }
    }
    
    const successCount = results.filter(r => r.emailSent && r.telegramSent).length;
    console.log(`Successfully sent notifications to ${successCount}/${candidates.length} candidates`);
    
    return {
      success: successCount > 0,
      results
    };
    
  } catch (error) {
    console.error('Error sending interview notifications:', error)
    throw error
  }
}