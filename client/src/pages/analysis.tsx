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
import type { Candidate, Job } from "@shared/schema";
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
  reject: {
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

  const { data: candidates, isLoading: candidatesLoading } = useQuery<Candidate[]>({
    queryKey: ["/api/candidates"],
  });

  const { data: jobs } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
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

  const filteredCandidates = candidates?.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRecommendation =
      filterRecommendation === "all" || candidate.recommendation === filterRecommendation;
    const matchesJob = !jobFilter || candidate.jobId === jobFilter;
    return matchesSearch && matchesRecommendation && matchesJob;
  });

  const stats = {
    total: candidates?.length || 0,
    interview: candidates?.filter((c) => c.recommendation === "interview").length || 0,
    onHold: candidates?.filter((c) => c.recommendation === "on-hold").length || 0,
    reject: candidates?.filter((c) => c.recommendation === "reject").length || 0,
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

  return (
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
        <div className="flex gap-2">
          <Link href="/schedule">
            <Button className="gap-2" data-testid="button-schedule-interviews">
              <Calendar className="h-4 w-4" />
              Schedule Interviews
            </Button>
          </Link>
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
      ) : filteredCandidates && filteredCandidates.length > 0 ? (
        <div className="space-y-4">
          {filteredCandidates.map((candidate, index) => {
            const config = recommendationConfig[candidate.recommendation as keyof typeof recommendationConfig];
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
                            {getJobTitle(candidate.jobId)}
                          </p>
                        </div>

                        <div className="flex items-center gap-6 flex-wrap">
                          <div className="text-center min-w-24">
                            <div className="flex items-center justify-center gap-2">
                              <span className={`text-2xl font-bold ${getScoreColor(candidate.resumeScore)}`}>
                                {candidate.resumeScore}
                              </span>
                              <span className="text-muted-foreground">/100</span>
                            </div>
                            <Progress
                              value={candidate.resumeScore}
                              className={`h-1.5 mt-1 ${getScoreBg(candidate.resumeScore)}`}
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
                            <h4 className="font-medium mb-3">AI Rationale</h4>
                            <p className="text-sm text-muted-foreground">
                              {candidate.rationale}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-6 flex-wrap">
                          {candidate.recommendation === "interview" && (
                            <Link href={`/schedule?candidate=${candidate.id}`}>
                              <Button className="gap-2" data-testid={`button-schedule-${candidate.id}`}>
                                <Calendar className="h-4 w-4" />
                                Schedule Interview
                              </Button>
                            </Link>
                          )}
                          {candidate.recommendation === "reject" && (
                            <Link href={`/emails?candidate=${candidate.id}`}>
                              <Button variant="outline" className="gap-2" data-testid={`button-email-${candidate.id}`}>
                                <Mail className="h-4 w-4" />
                                Send Update
                              </Button>
                            </Link>
                          )}
                          <Link href="/candidates">
                            <Button variant="outline" className="gap-2" data-testid={`button-view-details-${candidate.id}`}>
                              View Full Profile
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </CollapsibleContent>
                    </CardContent>
                  </Collapsible>
                </Card>
              </motion.div>
            );
          })}
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
    </div>
  );
}
