import { useState } from "react";
import * as React from "react";
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
  UserCheck,
  UserX,
  Pause,
  Loader2,
  Star,
  AlertTriangle,
  Target,
  FileUser,
  X,
  Briefcase,
  Trash2,
  List,
  LayoutGrid,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import type { Job } from "@shared/schema";
import { motion } from "framer-motion";
import { fetchCandidatesFromSupabase, testSupabaseConnection, deleteCandidateFromSupabase, type SupabaseCandidate } from "@/lib/supabase";
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

// Kanban column definitions based on actual stages used in the system
const KANBAN_COLUMNS = [
  {
    id: 'new',
    title: 'New Applications',
    status: ['new', 'pending', 'applied'],
    color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50',
    headerColor: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200',
    count: 0
  },
  {
    id: 'screened',
    title: 'AI Screened',
    status: ['screened', 'reviewed', 'analyzed'],
    color: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/50',
    headerColor: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200',
    count: 0
  },
  {
    id: 'interview_scheduled',
    title: 'Interview Scheduled',
    status: ['interview_scheduled', 'prescreen_scheduled'],
    color: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50',
    headerColor: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200',
    count: 0
  },
  {
    id: 'completed',
    title: 'Process Complete',
    status: ['email_sent', 'rejected', 'hired'],
    color: 'bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-700/50',
    headerColor: 'bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200',
    count: 0
  }
];

export default function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [processingDecisions, setProcessingDecisions] = useState<Set<string>>(new Set());
  const [completedDecisions, setCompletedDecisions] = useState<Map<string, string>>(() => {
    // Load completed decisions from localStorage on component mount
    try {
      const saved = localStorage.getItem('completedDecisions');
      console.log('🔄 Loading completed decisions from localStorage:', saved);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('📋 Parsed completed decisions:', parsed);
        const map = new Map(Object.entries(parsed));
        console.log('🗺️ Created Map with entries:', Array.from(map.entries()));
        return map;
      }
    } catch (error) {
      console.error('❌ Error loading completed decisions from localStorage:', error);
    }
    console.log('🆕 No saved decisions found, starting with empty Map');
    return new Map();
  });
  const [selectedCandidate, setSelectedCandidate] = useState<SupabaseCandidate | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<{id: string, name: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
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

  // Kanban helper functions
  const getScoreColor = (score: number | null) => {
    if (!score) return "text-gray-500";
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-rose-600";
  };

  const getScoreBg = (score: number | null) => {
    if (!score) return "bg-gray-100";
    if (score >= 80) return "bg-emerald-100";
    if (score >= 60) return "bg-amber-100";
    return "bg-rose-100";
  };

  // Group candidates by stage for Kanban view
  const groupedCandidates = React.useMemo(() => {
    if (!supabaseCandidates) return {};

    const groups: { [key: string]: SupabaseCandidate[] } = {};
    
    KANBAN_COLUMNS.forEach(column => {
      groups[column.id] = supabaseCandidates.filter(candidate => {
        const candidateStage = candidate.stage?.toLowerCase() || 'new';
        return column.status.some(status => candidateStage.includes(status));
      });
    });

    return groups;
  }, [supabaseCandidates]);

  // SIMPLIFIED ACTION-BASED FILTERING
  const filteredCandidates = React.useMemo(() => {
    if (!supabaseCandidates) return [];
    
    return supabaseCandidates.filter((candidate) => {
      // Search functionality
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch = searchLower === "" || 
        (candidate.name && candidate.name.toLowerCase().includes(searchLower)) ||
        (candidate.email && candidate.email.toLowerCase().includes(searchLower)) ||
        (candidate.phone && candidate.phone.toLowerCase().includes(searchLower));
      
      // Action-based filtering
      if (statusFilter === "all") {
        return matchesSearch;
      }
      
      // Check if decision was already made (database state first, then localStorage)
      const hasInterviewScheduled = candidate.interview_slot !== null && candidate.interview_slot !== '';
      const stageIndicatesEmailSent = candidate.stage?.toLowerCase().includes('email_sent') || 
                                     candidate.stage?.toLowerCase().includes('interview_scheduled') ||
                                     candidate.status?.toLowerCase().includes('email_sent') ||
                                     candidate.status?.toLowerCase().includes('interview_scheduled');
      
      const isCompletedInStorage = completedDecisions.has(candidate.id);
      const completedActionInStorage = completedDecisions.get(candidate.id);
      
      const isCompleted = hasInterviewScheduled || stageIndicatesEmailSent || isCompletedInStorage;
      let completedAction = '';
      
      if (hasInterviewScheduled || stageIndicatesEmailSent) {
        completedAction = 'interview';
      } else if (isCompletedInStorage) {
        completedAction = completedActionInStorage || '';
      }
      
      let matchesAction = false;
      
      switch (statusFilter) {
        case "processing":
          // Candidates that are being processed by AI (no AI data available)
          matchesAction = candidate.ai_score === null || candidate.ai_recommendation === null;
          break;
          
        case "interview":
          // Candidates recommended for interview OR already completed interview action
          matchesAction = (candidate.ai_recommendation?.toLowerCase().includes('interview') || 
                          candidate.ai_recommendation?.toLowerCase().includes('hire') ||
                          candidate.ai_recommendation?.toLowerCase().includes('strong')) ||
                         (isCompleted && completedAction === 'interview');
          break;
          
        case "hold":
          // Candidates recommended for hold OR already completed hold action
          matchesAction = (candidate.ai_recommendation?.toLowerCase().includes('hold') ||
                          candidate.ai_recommendation?.toLowerCase().includes('weak')) ||
                         (isCompleted && completedAction === 'hold');
          break;
          
        case "reject":
          // Candidates recommended for reject OR already completed reject action
          matchesAction = candidate.ai_recommendation?.toLowerCase().includes('reject') ||
                         (isCompleted && completedAction === 'reject');
          break;
          
        case "completed":
          // Candidates where mail has been sent (any completed action)
          matchesAction = isCompleted;
          break;
          
        default:
          matchesAction = false;
      }
      
      return matchesSearch && matchesAction;
    });
  }, [supabaseCandidates, statusFilter, searchQuery, completedDecisions]);

  // Debug logging for completed decisions
  React.useEffect(() => {
    console.log('🔄 === COMPLETED DECISIONS STATE CHANGED ===');
    console.log('📊 Size:', completedDecisions.size);
    console.log('📝 Entries:', Array.from(completedDecisions.entries()));
    console.log('💾 localStorage value:', localStorage.getItem('completedDecisions'));
    
    // Double-check localStorage persistence
    if (completedDecisions.size > 0) {
      const obj = Object.fromEntries(completedDecisions);
      const jsonString = JSON.stringify(obj);
      localStorage.setItem('completedDecisions', jsonString);
      console.log('🔄 Re-saved to localStorage to ensure persistence:', jsonString);
    }
  }, [completedDecisions]);

  // Additional effect to verify persistence on component mount
  React.useEffect(() => {
    console.log('🚀 === COMPONENT MOUNTED - CHECKING PERSISTENCE ===');
    const stored = localStorage.getItem('completedDecisions');
    console.log('💾 Stored in localStorage:', stored);
    console.log('📊 Current state size:', completedDecisions.size);
    console.log('📝 Current state entries:', Array.from(completedDecisions.entries()));
    
    // If there's a mismatch, reload from localStorage
    if (stored && completedDecisions.size === 0) {
      try {
        const parsed = JSON.parse(stored);
        const newMap = new Map(Object.entries(parsed) as [string, string][]);
        console.log('🔄 Reloading from localStorage due to mismatch');
        setCompletedDecisions(newMap);
      } catch (error) {
        console.error('❌ Error reloading from localStorage:', error);
      }
    }
  }, []);



  const sortedCandidates = filteredCandidates
    ?.sort((a, b) => {
      let aVal: string | number | null;
      let bVal: string | number | null;
      
      // Map sort fields to Supabase column names
      if (sortField === "resumeScore" || sortField === "ai_score") {
        aVal = a.ai_score || 0;
        bVal = b.ai_score || 0;
      } else if (sortField === "appliedDate" || sortField === "created_at") {
        aVal = a.created_at || "";
        bVal = b.created_at || "";
      } else if (sortField === "name") {
        aVal = a.name || "";
        bVal = b.name || "";
      } else {
        aVal = (a[sortField as keyof SupabaseCandidate] as string | number) || "";
        bVal = (b[sortField as keyof SupabaseCandidate] as string | number) || "";
      }
      
      // Handle null/undefined values
      if (aVal === null || aVal === undefined) aVal = "";
      if (bVal === null || bVal === undefined) bVal = "";
      
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      
      // Convert to strings for comparison
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      if (sortDirection === "asc") {
        return aStr.localeCompare(bStr);
      }
      return bStr.localeCompare(aStr);
    });

  // Simple debug logging
  React.useEffect(() => {
    if (supabaseCandidates) {
      console.log(`Filter: "${statusFilter}" | Results: ${sortedCandidates?.length || 0}/${supabaseCandidates.length}`);
    }
  }, [statusFilter, sortedCandidates, supabaseCandidates]);



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
          `"${(c.ai_summary || 'Processing...').replace(/"/g, '""')}"`, // Escape quotes in summary
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
          title: "Mail Sent",
          description: `${webhookAction.charAt(0).toUpperCase() + webhookAction.slice(1)} notification sent to ${candidateName} successfully.`,
        });
        
        // Add to completed decisions with the action taken
        setCompletedDecisions(prev => {
          const newMap = new Map(prev).set(candidateId, webhookAction);
          console.log('💾 === SAVING COMPLETED DECISION ===');
          console.log('👤 Candidate ID:', candidateId);
          console.log('🎯 Action:', webhookAction);
          console.log('📊 New Map size:', newMap.size);
          console.log('📝 New Map entries:', Array.from(newMap.entries()));
          
          // Save to localStorage for persistence
          try {
            const obj = Object.fromEntries(newMap);
            const jsonString = JSON.stringify(obj);
            localStorage.setItem('completedDecisions', jsonString);
            console.log('💾 Saved to localStorage:', jsonString);
            
            // Verify it was saved correctly
            const verification = localStorage.getItem('completedDecisions');
            console.log('✅ Verification read from localStorage:', verification);
            
            // Force a small delay to ensure state update
            setTimeout(() => {
              console.log('🔄 Post-save state check - Map size:', newMap.size);
            }, 100);
          } catch (error) {
            console.error('❌ Error saving completed decisions to localStorage:', error);
          }
          return newMap;
        });
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

  const handleDeleteCandidate = (candidateId: string, candidateName: string) => {
    // Set the candidate to be deleted and show confirmation dialog
    setDeleteCandidate({ id: candidateId, name: candidateName });
  };

  const confirmDeleteCandidate = async () => {
    if (!deleteCandidate) return;

    setIsDeleting(true);

    try {
      console.log('Deleting candidate:', deleteCandidate.id, deleteCandidate.name);
      
      // Show loading toast
      toast({
        title: "Deleting Candidate",
        description: `Removing ${deleteCandidate.name} from the system...`,
      });

      // Delete from Supabase
      await deleteCandidateFromSupabase(deleteCandidate.id);

      // Remove from completed decisions if exists
      setCompletedDecisions(prev => {
        const newMap = new Map(prev);
        newMap.delete(deleteCandidate.id);
        
        // Update localStorage
        try {
          const obj = Object.fromEntries(newMap);
          localStorage.setItem('completedDecisions', JSON.stringify(obj));
        } catch (error) {
          console.error('Error updating localStorage after deletion:', error);
        }
        
        return newMap;
      });

      // Show success toast
      toast({
        title: "Candidate Deleted",
        description: `${deleteCandidate.name} has been successfully removed from the system.`,
      });

      // Close the dialog
      setDeleteCandidate(null);

      // Refresh the candidates list by invalidating the query
      // The useQuery will automatically refetch the data
      window.location.reload();

    } catch (error) {
      console.error('Error deleting candidate:', error);
      
      toast({
        title: "Deletion Failed",
        description: `Failed to delete ${deleteCandidate.name}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openCandidateDetails = (candidateId: string) => {
    const candidate = supabaseCandidates?.find(c => c.id === candidateId);
    if (candidate) {
      setSelectedCandidate(candidate);
      setIsDetailModalOpen(true);
    }
  };

  // Function to determine which buttons to show based on AI recommendation and score
  const getActionButtons = (candidate: SupabaseCandidate) => {
    const isProcessing = processingDecisions.has(candidate.id);
    
    // Check database state first for completed actions
    const hasInterviewScheduled = candidate.interview_slot !== null && candidate.interview_slot !== '';
    const stageIndicatesEmailSent = candidate.stage?.toLowerCase().includes('email_sent') || 
                                   candidate.stage?.toLowerCase().includes('interview_scheduled') ||
                                   candidate.status?.toLowerCase().includes('email_sent') ||
                                   candidate.status?.toLowerCase().includes('interview_scheduled');
    
    // Check localStorage as backup
    const isCompletedInStorage = completedDecisions.has(candidate.id);
    const completedActionInStorage = completedDecisions.get(candidate.id);
    
    // Determine if action is completed (database state takes priority)
    const isCompleted = hasInterviewScheduled || stageIndicatesEmailSent || isCompletedInStorage;
    let completedAction = '';
    
    if (hasInterviewScheduled || stageIndicatesEmailSent) {
      completedAction = 'interview'; // Default to interview if database indicates email sent
    } else if (isCompletedInStorage) {
      completedAction = completedActionInStorage || '';
    }
    
    // Enhanced debug logging for each candidate
    console.log(`🔍 [${candidate.name}] ID: ${candidate.id}`);
    console.log(`🔍 [${candidate.name}] Interview Slot: ${candidate.interview_slot}`);
    console.log(`🔍 [${candidate.name}] Stage: ${candidate.stage}, Status: ${candidate.status}`);
    console.log(`🔍 [${candidate.name}] DB indicates completed: ${hasInterviewScheduled || stageIndicatesEmailSent}`);
    console.log(`🔍 [${candidate.name}] Processing: ${isProcessing}, Completed: ${isCompleted}, Action: ${completedAction}`);
    
    // If decision is already completed, show the completed state
    if (isCompleted && completedAction) {
      console.log(`✅ [${candidate.name}] Showing completed state for action: ${completedAction}`);
      
      const actionConfig = {
        interview: { icon: Mail, label: 'Mail Sent', color: 'bg-blue-100 text-blue-700 border-blue-200' },
        reject: { icon: Mail, label: 'Mail Sent', color: 'bg-red-100 text-red-700 border-red-200' },
        hold: { icon: Mail, label: 'Mail Sent', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
      };
      
      const config = actionConfig[completedAction as keyof typeof actionConfig] || actionConfig.hold;
      const IconComponent = config.icon;
      
      return (
        <div className="flex items-center justify-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.color} font-medium text-sm`}>
            <IconComponent className="h-4 w-4" />
            {config.label}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openCandidateDetails(candidate.id)}
            className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-700 font-medium px-3 py-2 h-8"
            title="View candidate details"
          >
            <Eye className="h-3 w-3" />
          </Button>
        </div>
      );
    } else {
      console.log(`⚠️ [${candidate.name}] NOT showing completed state - isCompleted: ${isCompleted}, completedAction: ${completedAction}`);
    }

    // Check if AI score and recommendation are available
    const hasAIData = candidate.ai_score !== null && candidate.ai_recommendation !== null;
    
    if (!hasAIData) {
      // Always show analyzing state when AI data is missing
      // This covers cases where AI is still processing the resume
      return (
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            ✨ Analysing...
          </div>
        </div>
      );
    }

    // Determine buttons based on AI recommendation
    const recommendation = candidate.ai_recommendation?.toLowerCase() || '';
    
    // Define action configurations
    const actionConfigs = {
      reject: {
        primary: { 
          action: 'Reject', 
          icon: UserX, 
          className: 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm' 
        }
      },
      interview: {
        primary: { 
          action: 'Interview', 
          icon: UserCheck, 
          className: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm' 
        }
      },
      hold: {
        primary: { 
          action: 'Hold', 
          icon: Pause, 
          className: 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm' 
        }
      }
    };

    let config;
    if (recommendation === 'reject' || recommendation === 'rejected') {
      config = actionConfigs.reject;
    } else if (recommendation === 'interview' || recommendation === 'hire' || recommendation === 'strong-maybe') {
      config = actionConfigs.interview;
    } else if (recommendation === 'hold' || recommendation === 'on-hold' || recommendation === 'weak-maybe') {
      config = actionConfigs.hold;
    } else {
      // Fallback - show review button
      return (
        <div className="flex items-center justify-center">
          <Button
            size="sm"
            disabled={isProcessing}
            onClick={() => handleCandidateAction('Review', candidate.id, candidate.name)}
            className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-sm font-medium px-4 py-2 h-8"
          >
            {isProcessing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1.5" />
                Review
              </>
            )}
          </Button>
        </div>
      );
    }

    const PrimaryIcon = config.primary.icon;
    
    return (
      <div className="flex items-center justify-center gap-2">
        <Button
          size="sm"
          disabled={isProcessing}
          onClick={() => handleCandidateAction(config.primary.action, candidate.id, candidate.name)}
          className={`${config.primary.className} border-0 font-medium px-4 py-2 h-8`}
        >
          {isProcessing ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              <PrimaryIcon className="h-3 w-3 mr-1.5" />
              {config.primary.action}
            </>
          )}
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          disabled={isProcessing}
          onClick={() => openCandidateDetails(candidate.id)}
          className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-700 font-medium px-3 py-2 h-8"
        >
          <Eye className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  // Detailed Candidate Modal Component
  const CandidateDetailModal = () => {
    if (!selectedCandidate) return null;

    const job = jobs?.find(j => j.id === selectedCandidate.job_id);
    
    return (
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <FileUser className="h-6 w-6 text-primary" />
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
              {selectedCandidate.interview_slot && (
                <div className="md:col-span-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">
                    Interview Scheduled: {selectedCandidate.interview_slot}
                  </span>
                </div>
              )}
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
                    {selectedCandidate.ai_score !== null ? selectedCandidate.ai_score : (
                      <div className="flex items-center justify-center gap-2 text-lg">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Analyzing...
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-slate-600">AI Score</div>
                </div>

                {/* AI Recommendation */}
                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border">
                  <div className="text-lg font-semibold text-emerald-700 mb-1 capitalize">
                    {selectedCandidate.ai_recommendation || (
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-slate-600">AI Recommendation</div>
                </div>

                {/* Stage */}
                <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border">
                  <div className="text-lg font-semibold text-amber-700 mb-1 capitalize">
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
                  {selectedCandidate.ai_summary || (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      AI is analyzing the candidate's profile and generating insights...
                    </div>
                  )}
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

            {/* Resume Text */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-600" />
                Resume Content
              </h4>
              <div className="p-4 bg-slate-50 rounded-lg max-h-60 overflow-y-auto">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                  {selectedCandidate.resume_text}
                </pre>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsDetailModalOpen(false)}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Close
              </Button>
              
              {(() => {
                const hasInterviewScheduled = selectedCandidate.interview_slot !== null && selectedCandidate.interview_slot !== '';
                const stageIndicatesEmailSent = selectedCandidate.stage?.toLowerCase().includes('email_sent') || 
                                               selectedCandidate.stage?.toLowerCase().includes('interview_scheduled') ||
                                               selectedCandidate.status?.toLowerCase().includes('email_sent') ||
                                               selectedCandidate.status?.toLowerCase().includes('interview_scheduled');
                const isCompletedInStorage = completedDecisions.has(selectedCandidate.id);
                const isCompleted = hasInterviewScheduled || stageIndicatesEmailSent || isCompletedInStorage;
                
                return !isCompleted;
              })() && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      handleCandidateAction('Reject', selectedCandidate.id, selectedCandidate.name);
                      setIsDetailModalOpen(false);
                    }}
                    className="bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-2"
                    disabled={processingDecisions.has(selectedCandidate.id)}
                  >
                    <UserX className="h-4 w-4" />
                    Reject
                  </Button>
                  
                  <Button
                    onClick={() => {
                      handleCandidateAction('Hold', selectedCandidate.id, selectedCandidate.name);
                      setIsDetailModalOpen(false);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2"
                    disabled={processingDecisions.has(selectedCandidate.id)}
                  >
                    <Pause className="h-4 w-4" />
                    Hold
                  </Button>
                  
                  <Button
                    onClick={() => {
                      handleCandidateAction('Interview', selectedCandidate.id, selectedCandidate.name);
                      setIsDetailModalOpen(false);
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
                    disabled={processingDecisions.has(selectedCandidate.id)}
                  >
                    <UserCheck className="h-4 w-4" />
                    Interview
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:bg-gradient-to-br dark:from-black dark:via-slate-950 dark:to-gray-900">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex-1">
          <div className="flex items-center gap-6 mb-2">
            <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-candidates-title">
              <Users className="h-6 w-6 text-primary" />
              All Candidates
            </h1>
            
            {/* Elegant View Toggle */}
            <div className="flex items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-full p-1 shadow-sm">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <List className="h-4 w-4" />
                List
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  viewMode === "kanban"
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                Kanban
              </button>
            </div>
          </div>
          <p className="text-muted-foreground">
            Real-time tracking of all candidate applications and statuses
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport} data-testid="button-export">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </motion.div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 ${searchQuery ? 'pr-8' : 'pr-3'} transition-all duration-200`}
            data-testid="input-search"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-slate-100 rounded-full transition-colors"
              title="Clear search"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select 
            value={statusFilter} 
            onValueChange={(value) => {
              console.log('=== FILTER CHANGE ===');
              console.log('Previous filter:', statusFilter);
              console.log('New filter:', value);
              setStatusFilter(value);
            }}
          >
            <SelectTrigger className="w-48" data-testid="select-status-filter">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Candidates</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="hold">On Hold</SelectItem>
              <SelectItem value="reject">Rejected</SelectItem>
              <SelectItem value="completed">Mail Sent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {viewMode === "list" ? (
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
            ) : sortedCandidates && sortedCandidates.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-52">
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
                      <TableHead className="w-40">Position</TableHead>
                      <TableHead className="w-24 text-center">
                        <Button
                          variant="ghost"
                          className="gap-1"
                          onClick={() => handleSort("ai_score")}
                          data-testid="sort-score"
                        >
                          Resume Score
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-40">Recommendation</TableHead>
                      <TableHead className="w-44 text-center">Actions</TableHead>
                      <TableHead className="w-36 text-center">Interview</TableHead>
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
                    {sortedCandidates?.map((candidate) => {
                      const recConfig = candidate.ai_recommendation 
                        ? recommendationConfig[candidate.ai_recommendation as keyof typeof recommendationConfig]
                        : null;

                      return (
                        <TableRow key={candidate.id} data-testid={`row-candidate-${candidate.id}`}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{candidate.name}</p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <Mail className="h-3 w-3" />
                                <span>{candidate.email}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            <span className="text-sm leading-tight break-words">{getJobTitle(candidate.job_id)}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            {candidate.ai_score !== null ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className={`font-bold text-sm px-2 py-1 rounded-full ${
                                  candidate.ai_score >= 70
                                    ? "bg-emerald-100 text-emerald-700"
                                    : candidate.ai_score >= 50
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                                }`}>
                                  {candidate.ai_score}/100
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center">
                                <div className="flex items-center gap-1 text-xs text-blue-600">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Analysing...
                                </div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {candidate.ai_recommendation ? (
                              <div className={`flex items-center gap-2 ${recConfig?.color || "text-muted-foreground"}`}>
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${recConfig?.dotColor || "bg-gray-400"}`}></div>
                                <span className="text-sm font-medium whitespace-nowrap">{recConfig?.label || candidate.ai_recommendation}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-blue-600">
                                <div className="flex items-center gap-1 text-xs">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  ✨ Analysing...
                                </div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {getActionButtons(candidate)}
                          </TableCell>
                          <TableCell className="text-center">
                            {candidate.interview_slot ? (
                              <div className="flex items-center justify-center">
                                <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs px-2 py-1">
                                  🗓️ {candidate.interview_slot}
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">Not scheduled</span>
                            )}
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
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteCandidate(candidate.id, candidate.name)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Candidate
                                </DropdownMenuItem>
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
      ) : (
        /* Kanban View */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {candidatesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {KANBAN_COLUMNS.map((column) => (
                <Card key={column.id} className={`${column.color} border-2`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{column.title}</span>
                      <Skeleton className="h-6 w-8" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : candidatesError ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-red-600">Error Loading Candidates</h3>
              <p className="text-muted-foreground mb-4">
                {candidatesError.message || 'Failed to fetch candidates from Supabase'}
              </p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Retry
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {KANBAN_COLUMNS.map((column) => {
                const columnCandidates = groupedCandidates[column.id] || [];
                
                return (
                  <motion.div
                    key={column.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: KANBAN_COLUMNS.indexOf(column) * 0.1 }}
                  >
                    <Card className={`${column.color} border-2 min-h-[600px]`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span>{column.title}</span>
                          <Badge className={column.headerColor}>
                            {columnCandidates.length}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {columnCandidates.map((candidate) => (
                          <motion.div
                            key={candidate.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card
                              className="cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                              onClick={() => openCandidateDetails(candidate.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm truncate">
                                      {candidate.name}
                                    </h4>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {getJobTitle(candidate.job_id)}
                                    </p>
                                  </div>
                                  <Eye className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer" />
                                </div>

                                {/* AI Score Badge */}
                                {candidate.ai_score && (
                                  <div className="flex items-center justify-between mb-2">
                                    <Badge 
                                      className={`text-xs ${getScoreBg(candidate.ai_score)} ${getScoreColor(candidate.ai_score)} border-0`}
                                    >
                                      Score: {candidate.ai_score}/100
                                    </Badge>
                                    {candidate.ai_recommendation && (
                                      <Badge variant="outline" className="text-xs">
                                        {candidate.ai_recommendation}
                                      </Badge>
                                    )}
                                  </div>
                                )}

                                {/* AI Summary Snippet */}
                                {candidate.ai_summary && (
                                  <p className="text-xs text-muted-foreground leading-relaxed overflow-hidden" style={{ 
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                  }}>
                                    {candidate.ai_summary}
                                  </p>
                                )}

                                {/* Contact Info */}
                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  <span className="truncate">{candidate.email}</span>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                        
                        {columnCandidates.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No candidates in this stage</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {supabaseCandidates && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {sortedCandidates?.length || 0} of {supabaseCandidates.length} candidates
              {searchQuery && ` matching "${searchQuery}"`}
              {statusFilter !== "all" && ` in "${statusFilter}" stage`}
            </span>
            <span>
              Last updated: {new Date().toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
            🔍 Active Filter: "{statusFilter}" | Search: "{searchQuery || 'none'}" | Results: {sortedCandidates?.length || 0} | Completed Decisions: {completedDecisions.size}
          </div>
        </div>
      )}

      {/* Candidate Detail Modal */}
      <CandidateDetailModal />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteCandidate} onOpenChange={() => setDeleteCandidate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Candidate
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteCandidate?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This action cannot be undone. This will permanently remove:
              </p>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                <li>Candidate profile and contact information</li>
                <li>Resume content and AI analysis</li>
                <li>Application history and status</li>
                <li>Interview scheduling data</li>
              </ul>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteCandidate(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteCandidate}
                disabled={isDeleting}
                className="flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Candidate
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
