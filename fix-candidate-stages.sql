-- Fix candidate stages for Kanban view
-- Run this in Supabase SQL Editor

-- Update candidates with AI data but no stage to 'screened'
UPDATE candidates 
SET stage = 'screened'
WHERE stage IS NULL 
  AND (ai_score IS NOT NULL OR ai_recommendation IS NOT NULL);

-- Update candidates with interview slots to 'interview_scheduled'
UPDATE candidates 
SET stage = 'interview_scheduled'
WHERE interview_slot IS NOT NULL 
  AND interview_slot != '';

-- Update remaining candidates without stage to 'new'
UPDATE candidates 
SET stage = 'new'
WHERE stage IS NULL;

-- Verify the changes
SELECT stage, COUNT(*) as count 
FROM candidates 
GROUP BY stage 
ORDER BY stage;