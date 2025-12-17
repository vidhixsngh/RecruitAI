import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearch } from "wouter";
import {
  Bot,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Calendar,
  ArrowRight,
  Download,
  FileText,
  User,
  X,
  Briefcase,
  Star,
  AlertTriangle,
  Target,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { Candidate, Job } from "@shared/schema";
import { fetchCandidatesFromSupabase, type SupabaseCandidate } from "@/lib/supabase";
import { motion } from "framer-motion";

const recommendationConfig = {
  interview: {
    label: "Call for Interview",
    icon: CheckCircle,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  "on-hold": {
    label: "On Hold",
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/50",
    border: "border-amber-200 dark:border-amber-800",
  },
  hold: {
    label: "On Hold",
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/50",
    border: "border-amber-200 dark:border-amber-800",
  },
  reject: {
    label: "Reject",
    icon: XCircle,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/50",
    border: "border-rose-200 dark:border-rose-800",
  },
  rejected: {
    label: "Reject",
    icon: XCircle,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/50",
    border: "border-rose-200 dark:border-rose-800",
  },
};

export default function AnalysisPage() {
  const searchParams = useSearch();
  const jobFilter = new URLSearchParams(searchParams).get("job") || "";
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRecommendation, setFilterRecommendation] = useState<string>("all");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [selectedCandidate, setSelectedCandidate] = useState<SupabaseCandidate | null>(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

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

  const toggleExpanded = (id: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filteredCandidates = supabaseCandidates?.filter((candidate) => {
    const matchesSearch =
      (candidate.name && candidate.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (candidate.email && candidate.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Map Supabase recommendation values to filter values
    let candidateRecommendation = candidate.ai_recommendation?.toLowerCase();
    if (candidateRecommendation === 'on-hold') candidateRecommendation = 'hold';
    if (candidateRecommendation === 'rejected') candidateRecommendation = 'reject';
    
    const matchesRecommendation =
      filterRecommendation === "all" || candidateRecommendation === filterRecommendation;
    const matchesJob = !jobFilter || candidate.job_id === jobFilter;
    return matchesSearch && matchesRecommendation && matchesJob;
  });

  const stats = {
    total: supabaseCandidates?.length || 0,
    interview: supabaseCandidates?.filter((c) => c.ai_recommendation?.toLowerCase().includes('interview') || c.ai_recommendation?.toLowerCase().includes('hire')).length || 0,
    onHold: supabaseCandidates?.filter((c) => c.ai_recommendation?.toLowerCase().includes('hold')).length || 0,
    reject: supabaseCandidates?.filter((c) => c.ai_recommendation?.toLowerCase().includes('reject')).length || 0,
  };

  const getJobTitle = (jobId: string) => {
    return jobs?.find((j) => j.id === jobId)?.title || "Unknown Position";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  const openResumeModal = (candidate: SupabaseCandidate) => {
    setSelectedCandidate(candidate);
    setIsResumeModalOpen(true);
  };

  // Resume Detail Modal Component
  const ResumeDetailModal = () => {
    if (!selectedCandidate) return null;

    const job = jobs?.find(j => j.id === selectedCandidate.job_id);
    const recommendation = selectedCandidate.ai_recommendation?.toLowerCase() || '';
    const config = recommendationConfig[recommendation as keyof typeof recommendationConfig] || recommendationConfig.reject;
    
    return (
      <Dialog open={isResumeModalOpen} onOpenChange={setIsResumeModalOpen}>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className={`text-center p-4 rounded-lg border ${config.bg} ${config.border}`}>
                  <div className={`text-lg font-semibold mb-1 ${config.color} capitalize`}>
                    {selectedCandidate.ai_recommendation || 'Processing...'}
                  </div>
                  <div className="text-sm text-slate-600">AI Recommendation</div>
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
                onClick={() => setIsResumeModalOpen(false)}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:bg-gradient-to-br dark:from-black dark:via-slate-950 dark:to-gray-900">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-analysis-title">
            <Bot className="h-6 w-6 text-primary" />
            AI Analysis
          </h1>
          <p className="text-muted-foreground mt-1">
            Review AI-powered candidate scores and recommendations
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold" data-testid="stat-total">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Screened</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="stat-interview">
              {stats.interview}
            </p>
            <p className="text-sm text-muted-foreground">For Interview</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400" data-testid="stat-onhold">
              {stats.onHold}
            </p>
            <p className="text-sm text-muted-foreground">On Hold</p>
          </CardContent>
        </Card>
        <Card className="border-rose-200 dark:border-rose-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400" data-testid="stat-reject">
              {stats.reject}
            </p>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-candidates"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterRecommendation} onValueChange={setFilterRecommendation}>
            <SelectTrigger className="w-44" data-testid="select-filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Candidates</SelectItem>
              <SelectItem value="interview">For Interview</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
              <SelectItem value="reject">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {candidatesLoading ? (
        <div className="space-y-4">
          <p className="text-center text-muted-foreground">Loading candidates from Supabase...</p>
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-60" />
                  </div>
                  <Skeleton className="h-10 w-24" />
                </div>
              </CardContent>
            </Card>
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
        <div className="space-y-4">
          {filteredCandidates.map((candidate, index) => {
            // Only show candidates that have AI analysis data
            if (!candidate.ai_score && !candidate.ai_recommendation) {
              return null;
            }

            const recommendation = candidate.ai_recommendation?.toLowerCase() || '';
            const config = recommendationConfig[recommendation as keyof typeof recommendationConfig] || recommendationConfig.reject;
            const isExpanded = expandedCards.has(candidate.id);
            const IconComponent = config.icon;

            return (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className={`transition-colors ${config.border}`}
                  data-testid={`card-candidate-${candidate.id}`}
                >
                  <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(candidate.id)}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${config.bg}`}>
                          <IconComponent className={`h-6 w-6 ${config.color}`} />
                        </div>

                        <div className="flex-1 min-w-48">
                          <p className="font-semibold">{candidate.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {getJobTitle(candidate.job_id)}
                          </p>
                        </div>

                        <div className="flex items-center gap-6 flex-wrap">
                          <div className="text-center min-w-24">
                            <div className="flex items-center justify-center gap-2">
                              <span className={`text-2xl font-bold ${getScoreColor(candidate.ai_score || 0)}`}>
                                {candidate.ai_score || 0}
                              </span>
                              <span className="text-muted-foreground">/100</span>
                            </div>
                            <Progress
                              value={candidate.ai_score || 0}
                              className={`h-1.5 mt-1 ${getScoreBg(candidate.ai_score || 0)}`}
                            />
                          </div>

                          <Badge className={`${config.bg} ${config.color} border ${config.border}`}>
                            {config.label}
                          </Badge>

                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-expand-${candidate.id}`}>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>

                      <CollapsibleContent className="mt-6 pt-6 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-3">Contact Information</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span>{candidate.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <span>{candidate.phone}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-3">AI Summary</h4>
                            <p className="text-sm text-muted-foreground">
                              {candidate.ai_summary || 'AI analysis summary not available'}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-6 flex-wrap">
                          {recommendation.includes("reject") && (
                            <Link href={`/emails?candidate=${candidate.id}`}>
                              <Button variant="outline" className="gap-2" data-testid={`button-email-${candidate.id}`}>
                                <Mail className="h-4 w-4" />
                                Send Update
                              </Button>
                            </Link>
                          )}
                          <Button 
                            className="gap-2 bg-rose-500 hover:bg-rose-600 text-white" 
                            onClick={() => openResumeModal(candidate)}
                            data-testid={`button-view-details-${candidate.id}`}
                          >
                            <FileText className="h-4 w-4" />
                            View Profile
                          </Button>
                        </div>
                      </CollapsibleContent>
                    </CardContent>
                  </Collapsible>
                </Card>
              </motion.div>
            );
          }).filter(Boolean)}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="text-center py-12">
            <CardContent>
              <Bot className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No candidates analyzed yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by screening resumes for your job openings.
              </p>
              <Link href="/jobs">
                <Button className="gap-2" data-testid="button-go-to-jobs">
                  Go to Job Openings
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Resume Detail Modal */}
      <ResumeDetailModal />
      </div>
    </div>
  );
}
