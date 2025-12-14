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
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import type { Candidate, Job } from "@shared/schema";
import { motion } from "framer-motion";

const statusConfig = {
  pending: { label: "Pending", color: "text-muted-foreground", bg: "bg-muted" },
  interview_scheduled: { label: "Interview Scheduled", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/50" },
  prescreen_scheduled: { label: "Pre-screen Scheduled", color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/50" },
  email_sent: { label: "Email Sent", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/50" },
  hired: { label: "Hired", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/50" },
  rejected: { label: "Rejected", color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/50" },
};

const recommendationConfig = {
  interview: { label: "Interview", icon: CheckCircle, color: "text-emerald-600" },
  "on-hold": { label: "On Hold", icon: Clock, color: "text-amber-600" },
  reject: { label: "Reject", icon: XCircle, color: "text-rose-600" },
};

export default function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("appliedDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const { data: candidates, isLoading: candidatesLoading } = useQuery<Candidate[]>({
    queryKey: ["/api/candidates"],
  });

  const { data: jobs } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const getJobTitle = (jobId: string) => {
    return jobs?.find((j) => j.id === jobId)?.title || "Unknown";
  };

  const filteredCandidates = candidates
    ?.filter((candidate) => {
      const matchesSearch =
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aVal: string | number = a[sortField as keyof Candidate] as string | number;
      let bVal: string | number = b[sortField as keyof Candidate] as string | number;
      
      if (sortField === "resumeScore") {
        aVal = Number(aVal);
        bVal = Number(bVal);
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
    if (!candidates) return;
    
    const csv = [
      ["Name", "Email", "Phone", "Position", "Score", "Recommendation", "Status", "Applied Date", "Last Updated"].join(","),
      ...candidates.map((c) =>
        [
          c.name,
          c.email,
          c.phone,
          getJobTitle(c.jobId),
          c.resumeScore,
          c.recommendation,
          c.status,
          c.appliedDate,
          c.lastUpdated,
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
        <Button variant="outline" className="gap-2" onClick={handleExport} data-testid="button-export">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
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
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
              <SelectItem value="prescreen_scheduled">Pre-screen Scheduled</SelectItem>
              <SelectItem value="email_sent">Email Sent</SelectItem>
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
            ) : filteredCandidates && filteredCandidates.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-56">
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
                      <TableHead>Position</TableHead>
                      <TableHead className="text-center">
                        <Button
                          variant="ghost"
                          className="gap-1"
                          onClick={() => handleSort("resumeScore")}
                          data-testid="sort-score"
                        >
                          Score
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>Recommendation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>
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
                      const recConfig = recommendationConfig[candidate.recommendation as keyof typeof recommendationConfig];
                      const statConfig = statusConfig[candidate.status as keyof typeof statusConfig] || statusConfig.pending;
                      const RecIcon = recConfig?.icon || Clock;

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
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {getJobTitle(candidate.jobId)}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`font-semibold ${
                              candidate.resumeScore >= 80
                                ? "text-emerald-600"
                                : candidate.resumeScore >= 60
                                ? "text-amber-600"
                                : "text-rose-600"
                            }`}>
                              {candidate.resumeScore}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className={`flex items-center gap-1.5 ${recConfig?.color}`}>
                              <RecIcon className="h-4 w-4" />
                              <span className="text-sm">{recConfig?.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${statConfig.bg} ${statConfig.color} border-0`}>
                              {statConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {candidate.appliedDate}
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
                                {candidate.recommendation === "interview" && (
                                  <Link href={`/schedule?candidate=${candidate.id}`}>
                                    <DropdownMenuItem>
                                      <Calendar className="h-4 w-4 mr-2" />
                                      Schedule Interview
                                    </DropdownMenuItem>
                                  </Link>
                                )}
                                {candidate.recommendation === "reject" && (
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
                <h3 className="text-lg font-semibold mb-2">No candidates yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start by screening resumes for your job openings.
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
            Showing {filteredCandidates.length} of {candidates?.length} candidates
          </span>
          <span>
            Last updated: {new Date().toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
