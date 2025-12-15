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

  const handleCandidateAction = (action: string, candidateId: string, candidateName: string) => {
    console.log('Decision made:', action, candidateId, candidateName);
  };

  const openCandidateDetails = (candidateId: string) => {
    console.log('Opening candidate details for:', candidateId);
    // TODO: Implement modal or navigation to candidate details
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
                      <TableHead className="w-52 text-center">Decision</TableHead>
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
                            <div className="flex items-center gap-2 justify-center">
                              <Button
                                size="sm"
                                onClick={() => handleCandidateAction(
                                  recConfig?.buttonLabel || 'Action',
                                  candidate.id,
                                  candidate.name
                                )}
                                className={`w-20 font-medium text-xs ${recConfig?.buttonColor || "bg-gray-600 hover:bg-gray-700 text-white"}`}
                              >
                                {recConfig?.buttonLabel || 'Action'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openCandidateDetails(candidate.id)}
                                className="w-20 border-2 border-red-900 text-red-900 hover:bg-red-900 hover:text-white font-medium text-xs"
                              >
                                Preview
                              </Button>
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
