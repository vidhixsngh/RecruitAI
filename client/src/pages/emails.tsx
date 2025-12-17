import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearch, Link } from "wouter";
import {
  Mail,
  Send,
  Heart,
  XCircle,
  Users,
  ArrowRight,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  fetchCandidatesFromSupabase, 
  sendRejectionEmails,
  type SupabaseCandidate 
} from "@/lib/supabase";
import type { Candidate, Job } from "@shared/schema";
import { motion } from "framer-motion";

const emailTemplates = {
  supportive: {
    name: "Supportive & Encouraging",
    subject: "Thank You for Your Application",
    body: `Dear {name},

Thank you for taking the time to apply for the {position} role at our company. We truly appreciate your interest and the effort you put into your application.

After careful consideration, we've decided to move forward with other candidates whose experience more closely matches our current needs. This was a difficult decision, as we received many strong applications.

We were impressed by your background and encourage you to apply for future openings that align with your skills. We'll keep your resume on file for consideration.

We wish you all the best in your job search and future endeavors. Your talent will certainly find the right opportunity.

Warm regards,
HR Team`,
  },
  brief: {
    name: "Brief & Professional",
    subject: "Application Update",
    body: `Dear {name},

Thank you for applying for the {position} position. After reviewing all applications, we have decided to proceed with other candidates.

We appreciate your interest in our company and wish you success in your career journey.

Best regards,
HR Team`,
  },
  detailed: {
    name: "Detailed Feedback",
    subject: "Your Application Status",
    body: `Dear {name},

Thank you for your application for the {position} role. We've completed our review process and wanted to provide you with an update.

While your application showed promise, we've decided to move forward with candidates whose qualifications more closely match our immediate requirements. 

This decision doesn't reflect on your abilities — we simply had to make difficult choices among many qualified applicants.

We encourage you to:
- Continue developing your skills in your area of expertise
- Keep an eye on our careers page for future opportunities
- Connect with us on LinkedIn to stay updated

Thank you again for your interest, and we wish you every success.

Best wishes,
HR Team`,
  },
};

export default function EmailsPage() {
  const { toast } = useToast();
  const searchParams = useSearch();
  const candidateIdParam = new URLSearchParams(searchParams).get("candidate");

  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(
    candidateIdParam ? new Set([candidateIdParam]) : new Set()
  );
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof emailTemplates>("supportive");
  const [emailSubject, setEmailSubject] = useState(emailTemplates.supportive.subject);
  const [emailBody, setEmailBody] = useState(emailTemplates.supportive.body);

  // Fetch candidates from Supabase
  const { data: supabaseCandidates, isLoading: candidatesLoading, error: candidatesError } = useQuery<SupabaseCandidate[]>({
    queryKey: ["supabase-candidates"],
    queryFn: fetchCandidatesFromSupabase,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
  });

  // Fetch jobs from Supabase
  const { data: jobs } = useQuery({
    queryKey: ["supabase-jobs"],
    queryFn: async () => {
      const { fetchJobsFromSupabase } = await import("@/lib/supabase");
      return fetchJobsFromSupabase();
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 60000, // 1 minute
  });

  const sendEmailsMutation = useMutation({
    mutationFn: async (data: { candidateIds: string[]; subject: string; body: string }) => {
      console.log('🚀 Starting rejection email sending process...');
      
      // Get candidate details for personalization
      const candidatesToEmail = supabaseCandidates?.filter(c => data.candidateIds.includes(c.id)) || [];
      
      if (candidatesToEmail.length === 0) {
        throw new Error('No candidates found to send emails to');
      }
      
      // Send rejection emails using Supabase function
      const emailResults = await sendRejectionEmails(
        candidatesToEmail,
        data.subject,
        data.body
      );
      
      console.log('📧 Rejection email results:', emailResults);
      
      return {
        success: emailResults.success,
        results: emailResults.results,
        successCount: emailResults.results.filter(r => r.emailSent).length
      };
    },
    onSuccess: (result) => {
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["supabase-candidates"] });
      
      // Reset form
      setSelectedCandidates(new Set());
      
      // Show detailed success message
      const { successCount, results } = result;
      const failedCount = results.length - successCount;
      
      let description = `Successfully sent ${successCount} rejection email${successCount !== 1 ? 's' : ''} with care and empathy.`;
      if (failedCount > 0) {
        description += ` ${failedCount} email${failedCount !== 1 ? 's' : ''} failed to send.`;
      }
      description += ` Candidate status${successCount !== 1 ? 'es' : ''} updated in database.`;
      
      toast({
        title: "Emails processed!",
        description,
      });
    },
    onError: (error) => {
      console.error('❌ Email sending failed:', error);
      toast({
        title: "Email sending failed",
        description: error.message || "Failed to send emails. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter candidates that are recommended for rejection and haven't been sent emails yet
  const rejectedCandidates = supabaseCandidates?.filter((c) => {
    const recommendation = c.ai_recommendation?.toLowerCase() || '';
    const hasRejectionEmail = c.stage === 'email_sent' || c.status === 'email_sent';
    return recommendation.includes('reject') && !hasRejectionEmail;
  });

  const getJobTitle = (jobId: string) => {
    return jobs?.find((j) => j.id === jobId)?.title || "Unknown Position";
  };

  const toggleCandidate = (id: string) => {
    setSelectedCandidates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (rejectedCandidates) {
      setSelectedCandidates(new Set(rejectedCandidates.map((c) => c.id)));
    }
  };

  const handleTemplateChange = (template: keyof typeof emailTemplates) => {
    setSelectedTemplate(template);
    setEmailSubject(emailTemplates[template].subject);
    setEmailBody(emailTemplates[template].body);
  };

  const handleSend = () => {
    if (selectedCandidates.size === 0) {
      toast({
        title: "No candidates selected",
        description: "Please select at least one candidate.",
        variant: "destructive",
      });
      return;
    }

    sendEmailsMutation.mutate({
      candidateIds: Array.from(selectedCandidates),
      subject: emailSubject,
      body: emailBody,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:bg-gradient-to-br dark:from-black dark:via-slate-950 dark:to-gray-900">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-emails-title">
          <Mail className="h-6 w-6 text-primary" />
          Send Rejection Emails
        </h1>
        <p className="text-muted-foreground mt-1">
          Send supportive, empathetic updates to candidates who didn't make the cut
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <CardTitle className="text-lg">Candidates</CardTitle>
                  <CardDescription>
                    Select recipients
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                  data-testid="button-select-all"
                >
                  Select All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {candidatesLoading ? (
                <div>
                  <p className="text-center text-muted-foreground mb-4 text-xs">Loading candidates from Supabase...</p>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <Skeleton className="h-4 w-4" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : candidatesError ? (
                <div className="text-center py-6">
                  <XCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
                  <p className="text-sm text-red-600 font-medium">Error Loading Candidates</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {candidatesError.message || 'Failed to fetch candidates from Supabase'}
                  </p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline"
                    size="sm"
                    className="mt-3"
                  >
                    Retry
                  </Button>
                </div>
              ) : rejectedCandidates && rejectedCandidates.length > 0 ? (
                rejectedCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                      selectedCandidates.has(candidate.id)
                        ? "bg-primary/5 border border-primary/20"
                        : "bg-muted/30 hover-elevate"
                    }`}
                    onClick={() => toggleCandidate(candidate.id)}
                    data-testid={`candidate-row-${candidate.id}`}
                  >
                    <Checkbox
                      checked={selectedCandidates.has(candidate.id)}
                      onCheckedChange={() => toggleCandidate(candidate.id)}
                      data-testid={`checkbox-${candidate.id}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{candidate.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {getJobTitle(candidate.job_id)} • Score: {candidate.ai_score || 'N/A'}/100
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {candidate.email}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-rose-300 text-rose-600 text-xs">
                      {candidate.ai_recommendation || 'Reject'}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No rejected candidates found.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Candidates recommended for rejection will appear here.
                  </p>
                  <Link href="/candidates">
                    <Button variant="outline" size="sm" className="mt-3 gap-2">
                      View All Candidates
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50">
                  <Heart className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Empathy First</p>
                  <p className="text-xs text-muted-foreground">
                    Every rejection email is sent with care and respect.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Compose Email
              </CardTitle>
              <CardDescription>
                Choose a template or customize your message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-3 block">Email Template</Label>
                <Tabs value={selectedTemplate} onValueChange={(v) => handleTemplateChange(v as keyof typeof emailTemplates)}>
                  <TabsList className="w-full">
                    {Object.entries(emailTemplates).map(([key, template]) => (
                      <TabsTrigger
                        key={key}
                        value={key}
                        className="flex-1 text-xs"
                        data-testid={`tab-template-${key}`}
                      >
                        {template.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  data-testid="input-subject"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Email Body</Label>
                <Textarea
                  id="body"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="min-h-64 text-sm"
                  data-testid="input-body"
                />
                <p className="text-xs text-muted-foreground">
                  Use {"{name}"} and {"{position}"} as placeholders for personalization.
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 pt-4 border-t flex-wrap">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {selectedCandidates.size} recipient{selectedCandidates.size !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <Button
                  className="gap-2"
                  onClick={handleSend}
                  disabled={selectedCandidates.size === 0 || sendEmailsMutation.isPending}
                  data-testid="button-send"
                >
                  {sendEmailsMutation.isPending ? (
                    <>
                      <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Emails
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      </div>
    </div>
  );
}
