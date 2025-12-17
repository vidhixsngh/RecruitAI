import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Target,
  BarChart3,
  PieChart,
  Calendar,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { fetchCandidatesFromSupabase, type SupabaseCandidate } from "@/lib/supabase";

// Color schemes for charts
const SCORE_COLORS = ["#ef4444", "#f59e0b", "#10b981", "#059669"];
const STATUS_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

export default function HiringAnalyticsPage() {
  // Fetch candidates from Supabase
  const { data: candidates, isLoading, error } = useQuery<SupabaseCandidate[]>({
    queryKey: ["supabase-candidates"],
    queryFn: fetchCandidatesFromSupabase,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
  });

  // Calculate executive summary metrics
  const executiveMetrics = useMemo(() => {
    if (!candidates) return null;

    // Card 1: Active Talent Pool (Volume)
    const activeCandidates = candidates.filter(
      (c) => c.stage?.toLowerCase() !== "rejected" && c.status?.toLowerCase() !== "rejected"
    );

    // Card 2: Average Candidate Quality
    const candidatesWithScores = candidates.filter((c) => c.ai_score !== null);
    const avgScore = candidatesWithScores.length > 0
      ? candidatesWithScores.reduce((sum, c) => sum + (c.ai_score || 0), 0) / candidatesWithScores.length
      : 0;

    // Card 3: Action Required (HR Bottleneck)
    const pendingReview = candidates.filter(
      (c) => c.stage?.toLowerCase() === "screened" || 
             (c.ai_score !== null && !c.stage?.toLowerCase().includes("interview") && 
              c.stage?.toLowerCase() !== "rejected" && c.status?.toLowerCase() !== "rejected")
    );

    return {
      activeCandidates: activeCandidates.length,
      avgScore: Math.round(avgScore),
      pendingReview: pendingReview.length,
    };
  }, [candidates]);

  // Prepare AI Score Distribution data
  const scoreDistribution = useMemo(() => {
    if (!candidates) return [];

    const buckets = [
      { range: "0-50", min: 0, max: 50, count: 0, color: "#ef4444" },
      { range: "51-70", min: 51, max: 70, count: 0, color: "#f59e0b" },
      { range: "71-85", min: 71, max: 85, count: 0, color: "#10b981" },
      { range: "86-100", min: 86, max: 100, count: 0, color: "#059669" },
    ];

    candidates.forEach((candidate) => {
      if (candidate.ai_score !== null) {
        const score = candidate.ai_score;
        const bucket = buckets.find((b) => score >= b.min && score <= b.max);
        if (bucket) bucket.count++;
      }
    });

    return buckets;
  }, [candidates]);

  // Prepare Pipeline Health data
  const pipelineHealth = useMemo(() => {
    if (!candidates) return [];

    const statusGroups: { [key: string]: number } = {};
    
    candidates.forEach((candidate) => {
      const stage = candidate.stage?.toLowerCase() || "new";
      const status = candidate.status?.toLowerCase() || "new";
      
      let category = "New";
      if (stage.includes("screened") || stage.includes("analyzed")) {
        category = "Screened";
      } else if (stage.includes("interview") || status.includes("interview")) {
        category = "Interviewing";
      } else if (stage.includes("rejected") || status.includes("rejected")) {
        category = "Rejected";
      } else if (stage.includes("hired") || status.includes("hired")) {
        category = "Hired";
      }
      
      statusGroups[category] = (statusGroups[category] || 0) + 1;
    });

    return Object.entries(statusGroups).map(([name, value], index) => ({
      name,
      value,
      color: STATUS_COLORS[index % STATUS_COLORS.length],
    }));
  }, [candidates]);

  // Prepare Application Velocity data (last 30 days)
  const applicationVelocity = useMemo(() => {
    if (!candidates) return [];

    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: 0,
      };
    });

    candidates.forEach((candidate) => {
      const candidateDate = new Date(candidate.created_at).toISOString().split('T')[0];
      const dayData = last30Days.find((day) => day.date === candidateDate);
      if (dayData) {
        dayData.count++;
      }
    });

    return last30Days;
  }, [candidates]);

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-rose-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 75) return "bg-emerald-50 border-emerald-200";
    if (score >= 60) return "bg-amber-50 border-amber-200";
    return "bg-rose-50 border-rose-200";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:bg-gradient-to-br dark:from-black dark:via-slate-950 dark:to-gray-900">
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:bg-gradient-to-br dark:from-black dark:via-slate-950 dark:to-gray-900">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-red-600">Error Loading Analytics</h3>
            <p className="text-muted-foreground">
              {error.message || 'Failed to fetch candidate data'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:bg-gradient-to-br dark:from-black dark:via-slate-950 dark:to-gray-900">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Hiring Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Executive insights and pipeline performance metrics
          </p>
        </motion.div>

        {/* Tier 1: Executive Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Card 1: Active Talent Pool */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Active Candidates in Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {executiveMetrics?.activeCandidates || 0}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Candidates actively being considered
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Average Quality Score */}
          <Card className={`border-2 ${executiveMetrics ? getScoreBg(executiveMetrics.avgScore) : 'bg-gray-50 dark:bg-gray-800'}`}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-sm font-medium flex items-center gap-2 ${
                executiveMetrics && executiveMetrics.avgScore >= 75 
                  ? 'text-emerald-700 dark:text-emerald-300' 
                  : executiveMetrics && executiveMetrics.avgScore >= 60 
                  ? 'text-amber-700 dark:text-amber-300' 
                  : 'text-rose-700 dark:text-rose-300'
              }`}>
                <Award className="h-4 w-4" />
                Avg. AI Quality Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${executiveMetrics ? getScoreColor(executiveMetrics.avgScore) : 'text-gray-500'}`}>
                {executiveMetrics?.avgScore || 0}%
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Progress 
                  value={executiveMetrics?.avgScore || 0} 
                  className="flex-1 h-2"
                />
                <Badge 
                  variant={executiveMetrics && executiveMetrics.avgScore >= 75 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {executiveMetrics && executiveMetrics.avgScore >= 75 ? "Excellent" : 
                   executiveMetrics && executiveMetrics.avgScore >= 60 ? "Good" : "Needs Improvement"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Action Required */}
          <Card className={`border-2 ${executiveMetrics && executiveMetrics.pendingReview > 10 ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50' : 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50'}`}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-sm font-medium flex items-center gap-2 ${executiveMetrics && executiveMetrics.pendingReview > 10 ? 'text-orange-700 dark:text-orange-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
                <Clock className="h-4 w-4" />
                Pending HR Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${executiveMetrics && executiveMetrics.pendingReview > 10 ? 'text-orange-900 dark:text-orange-100' : 'text-emerald-900 dark:text-emerald-100'}`}>
                {executiveMetrics?.pendingReview || 0}
              </div>
              <p className={`text-xs mt-1 ${executiveMetrics && executiveMetrics.pendingReview > 10 ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {executiveMetrics && executiveMetrics.pendingReview > 10 ? 'High volume - action needed' : 'Manageable workload'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tier 2: Visual Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Chart A: AI Score Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                AI Score Distribution
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Quality assessment of candidate pool
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="range" 
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    className="text-slate-600 dark:text-slate-300"
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    className="text-slate-600 dark:text-slate-300"
                  />
                  <Tooltip 
                    formatter={(value) => [value, "Candidates"]}
                    labelFormatter={(label) => `Score Range: ${label}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {scoreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart B: Pipeline Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Pipeline Health
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Current distribution of candidate stages
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    dataKey="value"
                    data={pipelineHealth}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pipelineHealth.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value, "Candidates"]}
                    labelFormatter={(label) => `Stage: ${label}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      fontSize: '12px',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tier 3: Trend Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Application Velocity (Last 30 Days)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Daily application volume trends and patterns
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={applicationVelocity}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="displayDate" 
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    interval="preserveStartEnd"
                    className="text-slate-600 dark:text-slate-300"
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    className="text-slate-600 dark:text-slate-300"
                  />
                  <Tooltip 
                    formatter={(value) => [value, "Applications"]}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "#3b82f6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="text-center text-sm text-muted-foreground"
        >
          <p>
            Analytics based on {candidates?.length || 0} total candidates • 
            Last updated: {new Date().toLocaleString()}
          </p>
        </motion.div>
      </div>
    </div>
  );
}