import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearch, Link } from "wouter";
import {
  Calendar,
  Clock,
  Mail,
  Phone,
  Send,
  CheckCircle,
  Users,
  ArrowRight,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  fetchCandidatesFromSupabase, 
  scheduleInterviewsInSupabase,
  sendInterviewNotifications,
  type SupabaseCandidate 
} from "@/lib/supabase";
import type { Candidate, Job } from "@shared/schema";
import { motion } from "framer-motion";

const defaultEmailTemplate = `Dear {name},

We are pleased to inform you that after reviewing your application for the {position} role, we would like to invite you for an interview.

Interview Details:
- Date: {date}
- Time: {time}
- Format: Video Call (link will be shared)

Please confirm your availability by replying to this email.

We look forward to speaking with you!

Best regards,
HR Team`;

const defaultTelegramTemplate = `Hi {name}! 👋

Great news! We'd like to invite you for an interview for the {position} position.

📅 Date: {date}
⏰ Time: {time}

Please confirm if this works for you.

Looking forward to connecting!`;

export default function SchedulePage() {
  const { toast } = useToast();
  const searchParams = useSearch();
  const candidateIdParam = new URLSearchParams(searchParams).get("candidate");

  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(
    candidateIdParam ? new Set([candidateIdParam]) : new Set()
  );
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [emailMessage, setEmailMessage] = useState(defaultEmailTemplate);
  const [telegramMessage, setTelegramMessage] = useState(defaultTelegramTemplate);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

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

  const scheduleInterviewsMutation = useMutation({
    mutationFn: async (data: { candidateIds: string[]; date: string; time: string; emailMessage: string; telegramMessage: string }) => {
      console.log('🚀 Starting interview scheduling process...');
      
      // Step 1: Update Supabase with interview slots
      const updatedCandidates = await scheduleInterviewsInSupabase(
        data.candidateIds,
        data.date,
        data.time
      );
      
      console.log('✅ Updated candidates in Supabase:', updatedCandidates.length);
      
      // Step 2: Send notifications
      const notificationResults = await sendInterviewNotifications(
        updatedCandidates,
        data.emailMessage,
        data.telegramMessage,
        data.date,
        data.time
      );
      
      console.log('📧 Notification results:', notificationResults);
      
      return {
        success: true,
        updatedCandidates,
        notificationResults
      };
    },
    onSuccess: (result) => {
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["supabase-candidates"] });
      
      // Reset form
      setSelectedCandidates(new Set());
      setScheduleDate("");
      setScheduleTime("");
      
      // Show success message
      const successCount = result.notificationResults.results.filter(r => r.emailSent && r.telegramSent).length;
      const totalCount = result.updatedCandidates.length;
      
      toast({
        title: "Interviews scheduled!",
        description: `Successfully scheduled ${totalCount} interview${totalCount > 1 ? 's' : ''} and sent ${successCount} notification${successCount > 1 ? 's' : ''}.`,
      });
    },
    onError: (error) => {
      console.error('❌ Interview scheduling failed:', error);
      toast({
        title: "Scheduling failed",
        description: error.message || "Failed to schedule interviews. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter candidates eligible for interviews (recommended for interview and not already scheduled)
  const eligibleCandidates = supabaseCandidates?.filter((c) => {
    const recommendation = c.ai_recommendation?.toLowerCase() || '';
    const hasInterviewSlot = c.interview_slot && c.interview_slot.trim() !== '';
    return (recommendation.includes('interview') || recommendation.includes('hire')) && !hasInterviewSlot;
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
    if (eligibleCandidates) {
      setSelectedCandidates(new Set(eligibleCandidates.map((c) => c.id)));
    }
  };

  const handleSchedule = () => {
    if (selectedCandidates.size === 0) {
      toast({
        title: "No candidates selected",
        description: "Please select at least one candidate to schedule.",
        variant: "destructive",
      });
      return;
    }
    if (!scheduleDate || !scheduleTime) {
      toast({
        title: "Missing schedule details",
        description: "Please select a date and time for the interviews.",
        variant: "destructive",
      });
      return;
    }

    scheduleInterviewsMutation.mutate({
      candidateIds: Array.from(selectedCandidates),
      date: scheduleDate,
      time: scheduleTime,
      emailMessage,
      telegramMessage,
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
        <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-schedule-title">
          <Calendar className="h-6 w-6 text-primary" />
          Manage Interviews
        </h1>
        <p className="text-muted-foreground mt-1">
          Schedule interviews for recommended candidates and manage interview slots
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Scheduled Interviews Section */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Scheduled Interviews</CardTitle>
              <CardDescription>
                Candidates with confirmed interview slots (chronological order)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(() => {
                const scheduledCandidates = supabaseCandidates?.filter(c => 
                  c.interview_slot && c.interview_slot.trim() !== ''
                ).sort((a, b) => {
                  // Sort by interview_slot chronologically
                  // Assuming interview_slot format is something like "Dec 20, 2024 at 2:00 PM" or similar
                  const dateA = new Date(a.interview_slot || '');
                  const dateB = new Date(b.interview_slot || '');
                  
                  // If dates are invalid, fall back to string comparison
                  if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
                    return (a.interview_slot || '').localeCompare(b.interview_slot || '');
                  }
                  
                  return dateA.getTime() - dateB.getTime();
                });
                
                return scheduledCandidates && scheduledCandidates.length > 0 ? (
                  scheduledCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{candidate.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {getJobTitle(candidate.job_id)} • Score: {candidate.ai_score || 'N/A'}/100
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {candidate.interview_slot}
                        </p>
                        <p className="text-xs text-muted-foreground">Scheduled</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">AI will help you schedule interviews with top candidates!</p>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle className="text-lg">Eligible Candidates</CardTitle>
                  <CardDescription>
                    Candidates recommended for interviews
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {selectedCandidates.size} selected
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAll}
                    data-testid="button-select-all"
                  >
                    Select All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {candidatesLoading ? (
                <div>
                  <p className="text-center text-muted-foreground mb-4">Loading candidates from Supabase...</p>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : candidatesError ? (
                <div className="text-center py-8">
                  <Users className="h-10 w-10 mx-auto text-red-500 mb-3" />
                  <p className="text-red-600 font-medium">Error Loading Candidates</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {candidatesError.message || 'Failed to fetch candidates from Supabase'}
                  </p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline"
                    className="mt-4"
                  >
                    Retry
                  </Button>
                </div>
              ) : eligibleCandidates && eligibleCandidates.length > 0 ? (
                eligibleCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-colors cursor-pointer ${
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{candidate.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {getJobTitle(candidate.job_id)} • Score: {candidate.ai_score || 'N/A'}/100
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        <span className="text-xs">{candidate.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <span className="text-xs">{candidate.phone}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No candidates eligible for scheduling.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Candidates recommended for interviews will appear here.
                  </p>
                  <Link href="/candidates">
                    <Button variant="outline" className="mt-4 gap-2">
                      View All Candidates
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="sticky top-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Schedule Details</CardTitle>
              <CardDescription>
                Set interview date, time, and messages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Interview Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    data-testid="input-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Interview Time</Label>
                  <Select value={scheduleTime} onValueChange={setScheduleTime}>
                    <SelectTrigger data-testid="select-time">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"].map(
                        (time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs defaultValue="email" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="email" className="flex-1 gap-1" data-testid="tab-email">
                    <Mail className="h-4 w-4" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="telegram" className="flex-1 gap-1" data-testid="tab-telegram">
                    <Phone className="h-4 w-4" />
                    Telegram
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="email" className="mt-4">
                  <div className="space-y-2">
                    <Label>Email Message</Label>
                    <Textarea
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      className="min-h-40 text-sm"
                      data-testid="input-email-message"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="telegram" className="mt-4">
                  <div className="space-y-2">
                    <Label>Telegram Message</Label>
                    <Textarea
                      value={telegramMessage}
                      onChange={(e) => setTelegramMessage(e.target.value)}
                      className="min-h-40 text-sm"
                      data-testid="input-telegram-message"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <Button
                className="w-full gap-2"
                onClick={handleSchedule}
                disabled={selectedCandidates.size === 0 || scheduleInterviewsMutation.isPending}
                data-testid="button-schedule"
              >
                {scheduleInterviewsMutation.isPending ? (
                  <>
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Scheduling & Sending Notifications...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Schedule {selectedCandidates.size > 0 ? `(${selectedCandidates.size})` : ""} Interview{selectedCandidates.size !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      </div>
    </div>
  );
}
