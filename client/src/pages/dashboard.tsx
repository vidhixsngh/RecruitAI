import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Briefcase,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Plus,
  Bot,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { fetchCandidatesFromSupabase, fetchJobsFromSupabase, type SupabaseCandidate, type SupabaseJob } from "@/lib/supabase";
import { motion } from "framer-motion";

const statsCards = [
  {
    title: "Active Jobs",
    icon: Briefcase,
    value: "jobs",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    title: "Total Candidates",
    icon: Users,
    value: "candidates",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    title: "Scheduled Interviews",
    icon: Calendar,
    value: "interviews",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/30",
  },
  {
    title: "Hire Rate",
    icon: TrendingUp,
    value: "hireRate",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  // Fetch jobs from Supabase
  const { data: jobs, isLoading: jobsLoading } = useQuery<SupabaseJob[]>({
    queryKey: ["supabase-jobs"],
    queryFn: fetchJobsFromSupabase,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 60000, // 1 minute
  });

  // Fetch candidates from Supabase
  const { data: candidates, isLoading: candidatesLoading } = useQuery<SupabaseCandidate[]>({
    queryKey: ["supabase-candidates"],
    queryFn: fetchCandidatesFromSupabase,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
  });

  const stats = {
    jobs: jobs?.length || 0,
    candidates: candidates?.length || 0,
    interviews: candidates?.filter((c) => c.stage === "interview_scheduled").length || 0,
    hireRate: 85,
  };

  // Map Supabase ai_recommendation values to dashboard categories
  const passedCount = candidates?.filter((c) => 
    c.ai_recommendation === "interview" || 
    c.ai_recommendation === "hire" || 
    c.ai_recommendation === "strong-maybe"
  ).length || 0;
  
  const onHoldCount = candidates?.filter((c) => 
    c.ai_recommendation === "hold" || 
    c.ai_recommendation === "on-hold" || 
    c.ai_recommendation === "weak-maybe"
  ).length || 0;
  
  const rejectedCount = candidates?.filter((c) => 
    c.ai_recommendation === "reject" || 
    c.ai_recommendation === "rejected"
  ).length || 0;

  const recentJobs = jobs?.slice(0, 4) || [];
  const topCandidates = candidates?.filter(c => c.ai_score && c.ai_score >= 70).slice(0, 5) || [];

  const isLoading = jobsLoading || candidatesLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:bg-gradient-to-br dark:from-black dark:via-slate-950 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-emerald-600/10 dark:bg-gradient-to-r dark:from-gray-900/50 dark:via-black/30 dark:to-slate-900/50"></div>
        <div className="relative px-6 pt-8 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto"
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-emerald-800 dark:bg-gradient-to-r dark:from-white dark:via-gray-200 dark:to-slate-300 bg-clip-text text-transparent mb-4" data-testid="text-dashboard-title">
                Welcome back, {user?.username?.split(" ")[0] || "there"}! 👨‍💻
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Your AI-powered hiring command center. Track, analyze, and optimize your recruitment pipeline.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link href="/jobs">
                <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300" data-testid="button-add-job">
                  <Plus className="h-5 w-5" />
                  Add New Job
                </Button>
              </Link>
              <Link href="/candidates">
                <Button variant="outline" size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Users className="h-5 w-5" />
                  View Candidates
                </Button>
              </Link>
              <Link href="/hiring-analytics">
                <Button variant="outline" size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
                  <BarChart3 className="h-5 w-5" />
                  Analytics
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-6 pb-12 max-w-7xl mx-auto space-y-8">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="group"
            >
              <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-black/60 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:bg-gradient-to-br dark:from-gray-900/50 dark:to-black/30"></div>
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      {isLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <p className="text-3xl font-bold" data-testid={`stat-${stat.value}`}>
                          {stat.value === "hireRate"
                            ? `${stats[stat.value]}%`
                            : stats[stat.value as keyof typeof stats]}
                        </p>
                      )}
                    </div>
                    <div className={`p-4 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Jobs & Pipeline */}
          <div className="xl:col-span-2 space-y-8">
            {/* Active Jobs */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-black/60 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                        Active Job Openings
                      </CardTitle>
                      <CardDescription>Manage your current positions and track applications</CardDescription>
                    </div>
                    <Link href="/jobs">
                      <Button variant="ghost" size="sm" className="gap-1" data-testid="link-view-all-jobs">
                        View All
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="p-4 rounded-xl border bg-muted/30">
                          <Skeleton className="h-6 w-32 mb-2" />
                          <Skeleton className="h-4 w-24 mb-3" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : recentJobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recentJobs.map((job, index) => (
                        <motion.div
                          key={job.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                          <Link href={`/jobs/${job.id}`}>
                            <div
                              className="p-4 rounded-xl border bg-gradient-to-br from-white to-slate-50/50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-black/50 hover:shadow-md transition-all duration-300 cursor-pointer group"
                              data-testid={`card-job-${job.id}`}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-sm truncate group-hover:text-blue-600 transition-colors">
                                    {job.title}
                                  </h3>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {job.department || "General"} • {job.location || "Remote"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="text-xs">
                                  {candidates?.filter(c => c.job_id === job.id).length || 0} applicants
                                </Badge>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Briefcase className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No job openings yet</h3>
                      <p className="text-muted-foreground mb-6">Create your first job posting to start receiving applications</p>
                      <Link href="/jobs">
                        <Button className="gap-2">
                          <Plus className="h-4 w-4" />
                          Create Job Opening
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Pipeline Overview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-black/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Candidate Pipeline
                  </CardTitle>
                  <CardDescription>AI-powered screening results and recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-6">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:bg-gradient-to-br dark:from-gray-900/80 dark:to-black/60 border border-emerald-200/50 dark:border-gray-700/50">
                        <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400" data-testid="stat-passed">
                          {passedCount}
                        </div>
                        <div className="text-sm font-medium text-emerald-600">Interview Ready</div>
                      </div>
                      
                      <div className="text-center p-6 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:bg-gradient-to-br dark:from-gray-900/80 dark:to-black/60 border border-amber-200/50 dark:border-gray-700/50">
                        <Clock className="h-8 w-8 text-amber-600 mx-auto mb-3" />
                        <div className="text-2xl font-bold text-amber-700 dark:text-amber-400" data-testid="stat-on-hold">
                          {onHoldCount}
                        </div>
                        <div className="text-sm font-medium text-amber-600">On Hold</div>
                      </div>
                      
                      <div className="text-center p-6 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100/50 dark:bg-gradient-to-br dark:from-gray-900/80 dark:to-black/60 border border-rose-200/50 dark:border-gray-700/50">
                        <AlertCircle className="h-8 w-8 text-rose-600 mx-auto mb-3" />
                        <div className="text-2xl font-bold text-rose-700 dark:text-rose-400" data-testid="stat-rejected">
                          {rejectedCount}
                        </div>
                        <div className="text-sm font-medium text-rose-600">Not Suitable</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Top Candidates & Quick Actions */}
          <div className="space-y-8">
            {/* Top Candidates */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-black/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Top Candidates
                  </CardTitle>
                  <CardDescription>Highest scoring applicants</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : topCandidates.length > 0 ? (
                    <div className="space-y-4">
                      {topCandidates.map((candidate, index) => (
                        <motion.div
                          key={candidate.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                          <Link href="/candidates">
                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                {candidate.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate group-hover:text-blue-600 transition-colors">
                                  {candidate.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    Score: {candidate.ai_score}
                                  </Badge>
                                  {candidate.ai_recommendation && (
                                    <span className="text-xs text-muted-foreground capitalize">
                                      {candidate.ai_recommendation}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                      <Link href="/candidates">
                        <Button variant="outline" className="w-full mt-4 gap-2">
                          View All Candidates
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-sm text-muted-foreground">No candidates yet</p>
                      <p className="text-xs text-muted-foreground">Start receiving applications to see top performers</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Hiring Analytics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-100/50 dark:bg-gradient-to-br dark:from-emerald-950/30 dark:to-teal-950/20 border-emerald-200/50 dark:border-emerald-700/50">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Hiring Analytics</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Executive insights and pipeline performance metrics for data-driven decisions
                  </p>
                  {candidates && candidates.length > 0 ? (
                    <Link href="/hiring-analytics">
                      <Button className="gap-2 shadow-lg bg-emerald-600 hover:bg-emerald-700" data-testid="button-view-analytics">
                        <BarChart3 className="h-4 w-4" />
                        View Analytics Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/jobs">
                      <Button className="gap-2 shadow-lg bg-emerald-600 hover:bg-emerald-700" data-testid="button-start-hiring">
                        <Plus className="h-4 w-4" />
                        Start Hiring Process
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
