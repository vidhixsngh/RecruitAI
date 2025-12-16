import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Users,
  Search,
  Download,
  Filter,
  ArrowUpDown,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Eye,
  Bot,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Job } from "@shared/schema";
import { motion } from "framer-motion";
import { fetchCandidatesFromSupabase, testSupabaseConnection, type SupabaseCandidate } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const statusConfig = {
  pending: { label: "Pending", color: "text-muted-foreground", bg: "bg-muted" },
  interview_scheduled: { label: "Interview Scheduled", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/50" },
  prescreen_scheduled: { label: "Pre-screen Scheduled", color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/50" },
  email_sent: { label: "Email Sent", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/50" },
  hired: { label: "Hired", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/50" },
  rejected: { label: "Rejected", color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/50" },
  // Add any other stage values you might have in Supabase
  applied: { label: "Applied", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/50" },
  screening: { label: "Screening", color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/50" },
  interviewed: { label: "Interviewed", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/50" },
};

const recommendationConfig = {
  interview: { 
    label: "Suggest Interview", 
    icon: CheckCircle, 
    color: "text-emerald-600",
    dotColor: "bg-emerald-500",
    buttonLabel: "Interview",
    buttonColor: "bg-emerald-600 hover:bg-emerald-700 text-white"
  },
  "on-hold": { 
    label: "Suggest Hold", 
    icon: Clock, 
    color: "text-amber-600",
    dotColor: "bg-amber-500",
    buttonLabel: "Hold",
    buttonColor: "bg-amber-600 hover:bg-amber-700 text-white"
  },
  reject: { 
    label: "Suggest Reject", 
    icon: XCircle, 
    color: "text-rose-600",
    dotColor: "bg-rose-500",
    buttonLabel: "Reject",
    buttonColor: "bg-rose-600 hover:bg-rose-700 text-white"
  },
  rejected: { 
    label: "Suggest Reject", 
    icon: XCircle, 
    color: "text-rose-600",
    dotColor: "bg-rose-500",
    buttonLabel: "Reject",
    buttonColor: "bg-rose-600 hover:bg-rose-700 text-white"
  },
  hire: { 
    label: "Suggest Interview", 
    icon: CheckCircle, 
    color: "text-emerald-600",
    dotColor: "bg-emerald-500",
    buttonLabel: "Interview",
    buttonColor: "bg-emerald-600 hover:bg-emerald-700 text-white"
  },
  hold: { 
    label: "Suggest Hold", 
    icon: Clock, 
    color: "text-amber-600",
    dotColor: "bg-amber-500",
    buttonLabel: "Hold",
    buttonColor: "bg-amber-600 hover:bg-amber-700 text-white"
  },
  "strong-maybe": { 
    label: "Suggest Interview", 
    icon: CheckCircle, 
    color: "text-emerald-600",
    dotColor: "bg-emerald-500",
    buttonLabel: "Interview",
    buttonColor: "bg-emerald-600 hover:bg-emerald-700 text-white"
  },
  "weak-maybe": { 
    label: "Suggest Hold", 
    icon: Clock, 
    color: "text-amber-600",
    dotColor: "bg-amber-500",
    buttonLabel: "Hold",
    buttonColor: "bg-amber-600 hover:bg-amber-700 text-white"
  },
};

export default function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [processingDecisions, setProcessingDecisions] = useState<Set<string>>(new Set());
  const [completedDecisions, setCompletedDecisions] = useState<Map<string, string>>(new Map());
  
  const { toast } = useToast();

  // Fetch candidates from Supabase
  const { data: supabaseCandidates, isLoading: candidatesLoading, error: candidatesError } = useQuery<SupabaseCandidate[]>({
    queryKey: ["supabase-candidates"],
    queryFn: fetchCandidatesFromSupabase,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
  });



  // Comment out the old API call - we're now using Supabase
  // const { data: candidates, isLoading: candidatesLoading } = useQuery<Candidate[]>({
  //   queryKey: ["/api/candidates"],
  // });

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

  const getJobTitle = (jobId: string) => {
    return jobs?.find((j) => j.id === jobId)?.title || "Unknown Position";
  };

  const filteredCandidates = supabaseCandidates
    ?.filter((candidate) => {
      const matchesSearch =
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || candidate.stage === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;
      
      // Map sort fields to Supabase column names
      if (sortField === "resumeScore" || sortField === "ai_score") {
        aVal = a.ai_score;
        bVal = b.ai_score;
      } else if (sortField === "appliedDate" || sortField === "created_at") {
        aVal = a.created_at;
        bVal = b.created_at;
      } else if (sortField === "name") {
        aVal = a.name;
        bVal = b.name;
      } else {
        aVal = a[sortField as keyof SupabaseCandidate] as string | number;
        bVal = b[sortField as keyof SupabaseCandidate] as string | number;
      }
      
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      
      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });



  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleExport = () => {
    if (!supabaseCandidates) return;
    
    const csv = [
      ["Name", "Email", "Phone", "Position", "Score", "Recommendation", "Stage", "Applied Date", "Summary"].join(","),
      ...supabaseCandidates.map((c) =>
        [
          c.name,
          c.email,
          c.phone,
          getJobTitle(c.job_id),
          c.ai_score,
          c.ai_recommendation,
          c.stage,
          new Date(c.created_at).toLocaleDateString(),
          `"${c.ai_summary.replace(/"/g, '""')}"`, // Escape quotes in summary
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "candidates.csv";
    a.click();
  };

  const handleCandidateAction = async (action: string, candidateId: string, candidateName: string) => {
    // Find the candidate to get their details
    const candidate = supabaseCandidates?.find(c => c.id === candidateId);
    if (!candidate) {
      toast({
        title: "Error",
        description: "Candidate not found",
        variant: "destructive",
      });
      return;
    }

    // Handle special actions that don't go to webhook
    if (action === 'Screen Resume' || action === 'Review') {
      // For now, just show a toast - these could navigate to different pages
      toast({
        title: `${action} Action`,
        description: `${action} action for ${candidateName} - this would navigate to the appropriate page.`,
      });
      return;
    }

    // Convert action to lowercase for webhook (interview, reject, hold)
    const webhookAction = action.toLowerCase();
    
    // Add to processing set
    setProcessingDecisions(prev => new Set(prev).add(candidateId));

    const payload = {
      candidate_name: candidate.name,
      email: candidate.email,
      action: webhookAction,
      phone: candidate.phone,
    };

    console.log('Sending webhook payload:', payload);

    try {
      const response = await fetch('https://vidhiii.app.n8n.cloud/webhook/candidate_action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Webhook response status:', response.status);

      if (response.ok) {
        // Try to get response body for additional info
        let responseData;
        try {
          responseData = await response.json();
          console.log('Webhook response data:', responseData);
        } catch (e) {
          console.log('Webhook response (text):', await response.text());
        }

        // Success - show toast and update UI
        toast({
          title: "Decision Recorded",
          description: `${candidateName}'s ${webhookAction} decision has been recorded successfully.`,
        });
        
        // Add to completed decisions with the action taken
        setCompletedDecisions(prev => new Map(prev).set(candidateId, webhookAction));
      } else if (response.status === 404) {
        // Handle webhook not found (common in test mode)
        const errorData = await response.json();
        console.error('Webhook not found:', errorData);
        
        toast({
          title: "Webhook Not Active",
          description: "The webhook endpoint is not currently active. Please activate it in n8n and try again.",
          variant: "destructive",
        });
      } else {
        const errorText = await response.text();
        console.error('Webhook error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error sending decision to webhook:', error);
      
      // Provide more specific error messages
      let errorMessage = `Failed to record decision for ${candidateName}. Please try again.`;
      
      if (error instanceof Error && error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Network error: Unable to connect to the webhook. Please check your internet connection.';
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      // Remove from processing set
      setProcessingDecisions(prev => {
        const newSet = new Set(prev);
        newSet.delete(candidateId);
        return newSet;
      });
    }
  };

  const openCandidateDetails = (candidateId: string) => {
    console.log('Opening candidate details for:', candidateId);
    // TODO: Implement modal or navigation to candidate details
  };

  // Function to determine which buttons to show based on AI recommendation and score
  const getActionButtons = (candidate: SupabaseCandidate) => {
    const isProcessing = processingDecisions.has(candidate.id);
    const isCompleted = completedDecisions.has(candidate.id);
    
    // If decision is already completed, show the completed state
    if (isCompleted) {
      const completedAction = completedDecisions.get(candidate.id);
      return (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            disabled
            className="w-20 font-medium text-xs bg-green-600 text-white"
          >
            ✓ {completedAction === 'interview' ? 'Interview' : completedAction === 'reject' ? 'Reject' : 'Hold'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openCandidateDetails(candidate.id)}
            className="w-16 border-2 border-red-900 text-red-900 hover:bg-red-900 hover:text-white font-medium text-xs"
          >
            Preview
          </Button>
        </div>
      );
    }

    // Check if AI score and recommendation are available
    const hasAIData = candidate.ai_score && candidate.ai_recommendation;
    
    if (!hasAIData) {
      // No AI data available - show Screen Resume button
      return (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            disabled={isProcessing}
            onClick={() => handleCandidateAction('Screen Resume', candidate.id, candidate.name)}
            className="w-28 font-medium text-xs bg-red-900 hover:bg-red-800 text-white flex items-center gap-1"
          >
            {isProcessing ? '...' : (
              <>
                <FileText className="h-3 w-3" />
                Screen
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openCandidateDetails(candidate.id)}
            className="w-16 border-2 border-red-900 text-red-900 hover:bg-red-900 hover:text-white font-medium text-xs"
          >
            Preview
          </Button>
        </div>
      );
    }

    // Determine buttons based on AI recommendation
    const recommendation = candidate.ai_recommendation.toLowerCase();
    
    if (recommendation === 'reject' || recommendation === 'rejected') {
      return (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            disabled={isProcessing}
            onClick={() => handleCandidateAction('Reject', candidate.id, candidate.name)}
            className="w-16 font-medium text-xs bg-rose-600 hover:bg-rose-700 text-white"
          >
            {isProcessing ? '...' : 'Reject'}
          </Button>
          <Button
            size="sm"
            disabled={isProcessing}
            onClick={() => handleCandidateAction('Review', candidate.id, candidate.name)}
            className="w-16 font-medium text-xs bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isProcessing ? '...' : 'Review'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openCandidateDetails(candidate.id)}
            className="w-16 border-2 border-red-900 text-red-900 hover:bg-red-900 hover:text-white font-medium text-xs"
          >
            Preview
          </Button>
        </div>
      );
    } else if (recommendation === 'interview' || recommendation === 'hire' || recommendation === 'strong-maybe') {
      return (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            disabled={isProcessing}
            onClick={() => handleCandidateAction('Interview', candidate.id, candidate.name)}
            className="w-16 font-medium text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isProcessing ? '...' : 'Interview'}
          </Button>
          <Button
            size="sm"
            disabled={isProcessing}
            onClick={() => handleCandidateAction('Review', candidate.id, candidate.name)}
            className="w-16 font-medium text-xs bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isProcessing ? '...' : 'Review'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openCandidateDetails(candidate.id)}
            className="w-16 border-2 border-red-900 text-red-900 hover:bg-red-900 hover:text-white font-medium text-xs"
          >
            Preview
          </Button>
        </div>
      );
    } else if (recommendation === 'hold' || recommendation === 'on-hold' || recommendation === 'weak-maybe') {
      return (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            disabled={isProcessing}
            onClick={() => handleCandidateAction('Hold', candidate.id, candidate.name)}
            className="w-16 font-medium text-xs bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isProcessing ? '...' : 'Hold'}
          </Button>
          <Button
            size="sm"
            disabled={isProcessing}
            onClick={() => handleCandidateAction('Review', candidate.id, candidate.name)}
            className="w-16 font-medium text-xs bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isProcessing ? '...' : 'Review'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openCandidateDetails(candidate.id)}
            className="w-16 border-2 border-red-900 text-red-900 hover:bg-red-900 hover:text-white font-medium text-xs"
          >
            Preview
          </Button>
        </div>
      );
    }

    // Fallback for unknown recommendations
    return (
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          disabled={isProcessing}
          onClick={() => handleCandidateAction('Review', candidate.id, candidate.name)}
          className="w-16 font-medium text-xs bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isProcessing ? '...' : 'Review'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => openCandidateDetails(candidate.id)}
          className="w-16 border-2 border-red-900 text-red-900 hover:bg-red-900 hover:text-white font-medium text-xs"
        >
          Preview
        </Button>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-candidates-title">
            <Users className="h-6 w-6 text-primary" />
            All Candidates
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time tracking of all candidate applications and statuses
          </p>

        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={async () => {
              try {
                const connectionTest = await testSupabaseConnection();
                console.log('Connection test:', connectionTest);
                
                if (connectionTest.success) {
                  const result = await fetchCandidatesFromSupabase();
                  console.log('Test fetch result:', result);
                  alert(`✅ Supabase connected! Fetched ${result.length} candidates`);
                } else {
                  alert(`❌ Connection failed: ${connectionTest.error}`);
                }
              } catch (error) {
                console.error('Test error:', error);
                alert(`❌ Error: ${error}`);
              }
            }}
          >
            Test Supabase
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleExport} data-testid="button-export">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </motion.div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48" data-testid="select-status-filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="screening">Screening</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
              <SelectItem value="interviewed">Interviewed</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-0">
            {candidatesLoading ? (
              <div className="p-6 space-y-4">
                <p className="text-center text-muted-foreground">Loading candidates from Supabase...</p>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-60" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : candidatesError ? (
              <div className="text-center py-12">
                <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-red-600">Error Loading Candidates</h3>
                <p className="text-muted-foreground mb-4">
                  {candidatesError.message || 'Failed to fetch candidates from Supabase'}
                </p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            ) : filteredCandidates && filteredCandidates.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-72">
                        <Button
                          variant="ghost"
                          className="gap-1 -ml-3"
                          onClick={() => handleSort("name")}
                          data-testid="sort-name"
                        >
                          Candidate
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-48">Position</TableHead>
                      <TableHead className="w-24 text-center">
                        <Button
                          variant="ghost"
                          className="gap-1"
                          onClick={() => handleSort("ai_score")}
                          data-testid="sort-score"
                        >
                          AI Score
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-44">Recommendation</TableHead>
                      <TableHead className="w-72 text-center">Actions</TableHead>
                      <TableHead className="w-28">
                        <Button
                          variant="ghost"
                          className="gap-1 -ml-3"
                          onClick={() => handleSort("appliedDate")}
                          data-testid="sort-date"
                        >
                          Applied
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCandidates.map((candidate) => {
                      const recConfig = recommendationConfig[candidate.ai_recommendation as keyof typeof recommendationConfig];

                      return (
                        <TableRow key={candidate.id} data-testid={`row-candidate-${candidate.id}`}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{candidate.name}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {candidate.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {candidate.phone}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            <span className="whitespace-nowrap">{getJobTitle(candidate.job_id)}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`font-semibold ${
                              candidate.ai_score >= 80
                                ? "text-emerald-600"
                                : candidate.ai_score >= 60
                                ? "text-amber-600"
                                : "text-rose-600"
                            }`}>
                              {candidate.ai_score}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className={`flex items-center gap-2 ${recConfig?.color || "text-muted-foreground"}`}>
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${recConfig?.dotColor || "bg-gray-400"}`}></div>
                              <span className="text-sm font-medium whitespace-nowrap">{recConfig?.label || candidate.ai_recommendation}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 justify-center">
                              {getActionButtons(candidate)}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(candidate.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" data-testid={`menu-${candidate.id}`}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <Link href={`/analysis?candidate=${candidate.id}`}>
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                </Link>
                                {candidate.ai_recommendation === "interview" && (
                                  <Link href={`/schedule?candidate=${candidate.id}`}>
                                    <DropdownMenuItem>
                                      <Calendar className="h-4 w-4 mr-2" />
                                      Schedule Interview
                                    </DropdownMenuItem>
                                  </Link>
                                )}
                                {candidate.ai_recommendation === "reject" && (
                                  <Link href={`/emails?candidate=${candidate.id}`}>
                                    <DropdownMenuItem>
                                      <Mail className="h-4 w-4 mr-2" />
                                      Send Email
                                    </DropdownMenuItem>
                                  </Link>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                <p className="text-muted-foreground mb-6">
                  No candidates found in your database. Start by adding candidates to your Supabase table.
                </p>
                <Link href="/jobs">
                  <Button className="gap-2" data-testid="button-go-to-jobs">
                    <Bot className="h-4 w-4" />
                    Go to Job Openings
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {filteredCandidates && filteredCandidates.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {filteredCandidates.length} of {supabaseCandidates?.length} candidates
          </span>
          <span>
            Last updated: {new Date().toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
