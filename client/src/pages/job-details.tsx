import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  Users,
  FileText,
  Bot,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import type { Job } from "@shared/schema";
import { motion } from "framer-motion";

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const { data: job, isLoading } = useQuery<Job>({
    queryKey: ["/api/jobs", id],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Job not found</p>
        <Link href="/jobs">
          <Button variant="link">Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link href="/jobs">
          <Button variant="ghost" className="gap-2 mb-4" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl" data-testid="text-job-title">
                    {job.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-3 mt-1 flex-wrap">
                    <span>{job.department}</span>
                    <span className="text-muted-foreground/50">•</span>
                    <Badge variant="outline">{job.type}</Badge>
                    <Badge
                      variant={job.status === "active" ? "default" : "secondary"}
                    >
                      {job.status}
                    </Badge>
                  </CardDescription>
                </div>
              </div>
              <Link href={`/analysis?job=${job.id}`}>
                <Button className="gap-2" data-testid="button-view-candidates">
                  <Bot className="h-4 w-4" />
                  View Candidates
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{job.location || "Remote"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{job.applicantsCount} applicants</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{job.type}</span>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4" />
                Job Description
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap" data-testid="text-job-description">
                {job.description}
              </p>
            </div>

            {job.requirements && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">Requirements</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap" data-testid="text-job-requirements">
                    {job.requirements}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
