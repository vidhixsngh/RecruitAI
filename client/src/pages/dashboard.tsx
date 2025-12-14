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
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import type { Job, Candidate } from "@shared/schema";
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

  const { data: jobs, isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const { data: candidates, isLoading: candidatesLoading } = useQuery<Candidate[]>({
    queryKey: ["/api/candidates"],
  });

  const stats = {
    jobs: jobs?.length || 0,
    candidates: candidates?.length || 0,
    interviews: candidates?.filter((c) => c.status === "interview_scheduled").length || 0,
    hireRate: candidates?.length
      ? Math.round(
          ((candidates.filter((c) => c.recommendation === "interview").length / candidates.length) *
            100)
        )
      : 0,
  };

  const passedCount = candidates?.filter((c) => c.recommendation === "interview").length || 0;
  const onHoldCount = candidates?.filter((c) => c.recommendation === "on-hold").length || 0;
  const rejectedCount = candidates?.filter((c) => c.recommendation === "reject").length || 0;

  const recentJobs = jobs?.slice(0, 3) || [];

  const isLoading = jobsLoading || candidatesLoading;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">
            Welcome back, {user?.username?.split(" ")[0] || "there"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your hiring pipeline
          </p>
        </div>
        <Link href="/jobs">
          <Button className="gap-2" data-testid="button-add-job">
            <Plus className="h-4 w-4" />
            Add New Job
          </Button>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold mt-1" data-testid={`stat-${stat.value}`}>
                        {stat.value === "hireRate"
                          ? `${stats[stat.value]}%`
                          : stats[stat.value as keyof typeof stats]}
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
              <div>
                <CardTitle className="text-lg">Recent Job Openings</CardTitle>
                <CardDescription>Your latest positions awaiting candidates</CardDescription>
              </div>
              <Link href="/jobs">
                <Button variant="ghost" size="sm" className="gap-1" data-testid="link-view-all-jobs">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))
              ) : recentJobs.length > 0 ? (
                recentJobs.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`}>
                    <div
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover-elevate cursor-pointer transition-colors"
                      data-testid={`card-job-${job.id}`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{job.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {job.department} • {job.location}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {job.applicantsCount} applicant{job.applicantsCount !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No job openings yet.</p>
                  <p className="text-sm text-muted-foreground">Let's add your first one.</p>
                  <Link href="/jobs">
                    <Button variant="outline" className="mt-4 gap-2">
                      <Plus className="h-4 w-4" />
                      Add Job Opening
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
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Candidate Pipeline</CardTitle>
              <CardDescription>Current screening status overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-medium">Call for Interview</span>
                      </div>
                      <span className="text-sm font-semibold" data-testid="stat-passed">
                        {passedCount}
                      </span>
                    </div>
                    <Progress value={passedCount * 10} className="h-2 bg-emerald-100 dark:bg-emerald-950" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium">On Hold</span>
                      </div>
                      <span className="text-sm font-semibold" data-testid="stat-on-hold">
                        {onHoldCount}
                      </span>
                    </div>
                    <Progress value={onHoldCount * 10} className="h-2 bg-amber-100 dark:bg-amber-950" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-rose-500" />
                        <span className="text-sm font-medium">Rejected</span>
                      </div>
                      <span className="text-sm font-semibold" data-testid="stat-rejected">
                        {rejectedCount}
                      </span>
                    </div>
                    <Progress value={rejectedCount * 10} className="h-2 bg-rose-100 dark:bg-rose-950" />
                  </div>

                  {candidates && candidates.length > 0 ? (
                    <Link href="/analysis">
                      <Button variant="outline" className="w-full gap-2 mt-4" data-testid="button-view-analysis">
                        <Bot className="h-4 w-4" />
                        View AI Analysis
                      </Button>
                    </Link>
                  ) : (
                    <div className="text-center pt-4">
                      <p className="text-sm text-muted-foreground">
                        Start screening to see candidate insights
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-background border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Ready to screen candidates?</h3>
                  <p className="text-sm text-muted-foreground">
                    Let AI analyze resumes and recommend the best matches for your roles.
                  </p>
                </div>
              </div>
              <Link href="/jobs">
                <Button className="gap-2" data-testid="button-start-screening">
                  Start Screening
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
