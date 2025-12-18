-- Fix candidate stages for new Kanban logic
-- Run this in Supabase SQL Editor

-- Update candidates with interview slots to 'interview_scheduled'
UPDATE candidates 
SET stage = 'interview_scheduled'
WHERE interview_slot IS NOT NULL 
  AND interview_slot != '';

-- Update candidates with hold/weak recommendations to 'hold'
UPDATE candidates 
SET stage = 'hold'
WHERE (ai_recommendation ILIKE '%hold%' OR 
       ai_recommendation ILIKE '%weak%' OR 
       ai_recommendation ILIKE '%maybe%')
  AND stage != 'interview_scheduled';

-- Update candidates with AI data but no specific action to 'screened' (will show in New Applications)
UPDATE candidates 
SET stage = 'screened'
WHERE stage IS NULL 
  AND (ai_score IS NOT NULL OR ai_recommendation IS NOT NULL)
  AND interview_slot IS NULL;

-- Update remaining candidates without any data to 'new'
UPDATE candidates 
SET stage = 'new'
WHERE stage IS NULL;

-- Verify the changes
SELECT 
  stage, 
  COUNT(*) as count,
  STRING_AGG(DISTINCT ai_recommendation, ', ') as recommendations
FROM candidates 
GROUP BY stage 
ORDER BY stage;