import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  UserCheck,
  Phone,
  Calendar,
  Send,
  Clock,
  Users,
  ArrowRight,
  Eye,
  FileText,
  User,
  X,
  Briefcase,
  Star,
  AlertTriangle,
  Target,
  Bot,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  fetchCandidatesFromSupabase, 
  sendPrescreenNotifications,
  type SupabaseCandidate 
} from "@/lib/supabase";
import type { Candidate, Job } from "@shared/schema";
import { motion } from "framer-motion";

const defaultCallTemplate = `Hi {name},

This is a quick note to let you know that we'd like to schedule a brief pre-screening call regarding your application for {position}.

The call will be approximately 15-20 minutes to discuss your background and answer any initial questions.

Proposed time: {date} at {time}

Please confirm your availability.

Best,
HR Team`;

export default function PrescreenPage() {
  const { toast } = useToast();
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [callMessage, setCallMessage] = useState(defaultCallTemplate);
  const [selectedCandidate, setSelectedCandidate] = useState<SupabaseCandidate | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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

  const schedulePrescreenMutation = useMutation({
    mutationFn: async (data: { candidateIds: string[]; date: string; time: string; message: string }) => {
      console.log('🚀 Starting prescreen scheduling process...');
      
      // Get candidate details
      const candidatesToSchedule = supabaseCandidates?.filter(c => data.candidateIds.includes(c.id)) || [];
      
      if (candidatesToSchedule.length === 0) {
        throw new Error('No candidates found to schedule prescreen calls for');
      }
      
      // Send prescreen notifications using Supabase function
      const prescreenResults = await sendPrescreenNotifications(
        candidatesToSchedule,
        data.message,
        data.date,
        data.time
      );
      
      console.log('📞 Prescreen notification results:', prescreenResults);
      
      return {
        success: prescreenResults.success,
        results: prescreenResults.results,
        updatedCandidates: prescreenResults.updatedCandidates,
        successCount: prescreenResults.results.filter(r => r.notificationSent && r.databaseUpdated).length
      };
    },
    onSuccess: (result) => {
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["supabase-candidates"] });
      
      // Reset form
      setSelectedCandidates(new Set());
      setScheduleDate("");
      setScheduleTime("");
      
      // Show detailed success message
      const { successCount, results } = result;
      const failedCount = results.length - successCount;
      
      let description = `Successfully scheduled ${successCount} prescreen call${successCount !== 1 ? 's' : ''} and sent notifications.`;
      if (failedCount > 0) {
        description += ` ${failedCount} notification${failedCount !== 1 ? 's' : ''} failed to send.`;
      }
      description += ` Candidate status${successCount !== 1 ? 'es' : ''} updated in database.`;
      
      toast({
        title: "Prescreen calls scheduled!",
        description,
      });
    },
    onError: (error) => {
      console.error('❌ Prescreen scheduling failed:', error);
      toast({
        title: "Scheduling failed",
        description: error.message || "Failed to schedule prescreen calls. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter candidates that are on hold or need further evaluation
  const onHoldCandidates = supabaseCandidates?.filter((c) => {
    const recommendation = c.ai_recommendation?.toLowerCase() || '';
    return recommendation.includes('hold') || recommendation.includes('weak') || c.stage === 'pending';
  });

  const getJobTitle = (jobId: string) => {
    return jobs?.find((j) => j.id === jobId)?.title || "Unknown Position";
  };

  const openProfileModal = (candidate: SupabaseCandidate) => {
    setSelectedCandidate(candidate);
    setIsProfileModalOpen(true);
  };

  // Candidate Profile Modal Component
  const CandidateProfileModal = () => {
    if (!selectedCandidate) return null;

    const job = jobs?.find(j => j.id === selectedCandidate.job_id);
    
    return (
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <User className="h-6 w-6 text-primary" />
              {selectedCandidate.name}
            </DialogTitle>
            <DialogDescription>
              Applied for {job?.title || 'Unknown Position'} • {new Date(selectedCandidate.created_at).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-600" />
                <span className="text-sm">{selectedCandidate.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-600" />
                <span className="text-sm">{selectedCandidate.phone}</span>
              </div>
            </div>

            {/* AI Analysis Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                AI Analysis Summary
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* AI Score */}
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {selectedCandidate.ai_score || 'N/A'}
                  </div>
                  <div className="text-sm text-slate-600">Resume Score</div>
                  {selectedCandidate.ai_score && (
                    <Progress
                      value={selectedCandidate.ai_score}
                      className="h-2 mt-2"
                    />
                  )}
                </div>

                {/* AI Recommendation */}
                <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                  <div className="text-lg font-semibold mb-1 text-amber-700 capitalize">
                    {selectedCandidate.ai_recommendation || 'Processing...'}
                  </div>
                  <div className="text-sm text-slate-600">AI Recommendation</div>
                </div>

                {/* Stage */}
                <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg border">
                  <div className="text-lg font-semibold text-slate-700 mb-1 capitalize">
                    {selectedCandidate.stage}
                  </div>
                  <div className="text-sm text-slate-600">Current Stage</div>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 text-slate-600" />
                AI Summary
              </h4>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedCandidate.ai_summary || 'AI analysis is still processing...'}
                </p>
              </div>
            </div>

            {/* Key Strengths */}
            {selectedCandidate.ai_key_strengths && selectedCandidate.ai_key_strengths.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-emerald-700">
                  <Star className="h-4 w-4" />
                  Key Strengths
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.ai_key_strengths.map((strength, index) => (
                    <Badge key={index} variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Red Flags */}
            {selectedCandidate.ai_red_flags && selectedCandidate.ai_red_flags.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  Red Flags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.ai_red_flags.map((flag, index) => (
                    <Badge key={index} variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                      {flag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Job Description */}
            {job && (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-slate-600" />
                  Job Description
                </h4>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h5 className="font-medium mb-2">{job.title}</h5>
                  <p className="text-sm text-slate-700 mb-3">{job.description_text}</p>
                  {job.requirements && (
                    <div>
                      <h6 className="font-medium text-sm mb-1">Requirements:</h6>
                      <p className="text-sm text-slate-600">{job.requirements}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Resume Content */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-600" />
                Resume Content
              </h4>
              <div className="p-4 bg-slate-50 rounded-lg max-h-60 overflow-y-auto">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                  {selectedCandidate.resume_text || 'Resume content not available'}
                </pre>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsProfileModalOpen(false)}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
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
    if (onHoldCandidates) {
      setSelectedCandidates(new Set(onHoldCandidates.map((c) => c.id)));
    }
  };

  const handleSchedule = () => {
    if (selectedCandidates.size === 0) {
      toast({
        title: "No candidates selected",
        description: "Please select at least one candidate.",
        variant: "destructive",
      });
      return;
    }
    if (!scheduleDate || !scheduleTime) {
      toast({
        title: "Missing schedule details",
        description: "Please select a date and time.",
        variant: "destructive",
      });
      return;
    }

    schedulePrescreenMutation.mutate({
      candidateIds: Array.from(selectedCandidates),
      date: scheduleDate,
      time: scheduleTime,
      message: callMessage,
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
        <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-prescreen-title">
          <UserCheck className="h-6 w-6 text-primary" />
          Manage Potential Candidates
        </h1>
        <p className="text-muted-foreground mt-1">
          Schedule HR screening calls and manage candidates who show potential for future opportunities
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle className="text-lg">On-Hold Candidates</CardTitle>
                  <CardDescription>
                    Candidates requiring additional screening
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
              ) : onHoldCandidates && onHoldCandidates.length > 0 ? (
                onHoldCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                      selectedCandidates.has(candidate.id)
                        ? "bg-primary/5 border border-primary/20"
                        : "bg-muted/30 hover-elevate"
                    }`}
                    data-testid={`candidate-row-${candidate.id}`}
                  >
                    <Checkbox
                      checked={selectedCandidates.has(candidate.id)}
                      onCheckedChange={() => toggleCandidate(candidate.id)}
                      data-testid={`checkbox-${candidate.id}`}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleCandidate(candidate.id)}>
                      <p className="font-medium truncate">{candidate.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {getJobTitle(candidate.job_id)} • Score: {candidate.ai_score || 'N/A'}/100
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {candidate.email} • {candidate.phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-amber-300 text-amber-600 dark:text-amber-400">
                        {candidate.ai_recommendation || 'On Hold'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          openProfileModal(candidate);
                        }}
                        className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-700 font-medium px-3 py-2 h-8"
                        title="View candidate profile"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No potential candidates found.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Candidates recommended for hold or further evaluation will appear here.
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
              <CardTitle className="text-lg">Schedule HR Call</CardTitle>
              <CardDescription>
                Set up pre-screening calls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Call Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    data-testid="input-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Call Time</Label>
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

              <div className="space-y-2">
                <Label>Message Template</Label>
                <Textarea
                  value={callMessage}
                  onChange={(e) => setCallMessage(e.target.value)}
                  className="min-h-48 text-sm"
                  data-testid="input-message"
                />
              </div>

              <Button
                className="w-full gap-2"
                onClick={handleSchedule}
                disabled={selectedCandidates.size === 0 || schedulePrescreenMutation.isPending}
                data-testid="button-schedule"
              >
                {schedulePrescreenMutation.isPending ? (
                  <>
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Scheduling & Sending Notifications...
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4" />
                    Schedule {selectedCandidates.size > 0 ? `(${selectedCandidates.size})` : ""} Call{selectedCandidates.size !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Candidate Profile Modal */}
      <CandidateProfileModal />
      </div>
    </div>
  );
}
