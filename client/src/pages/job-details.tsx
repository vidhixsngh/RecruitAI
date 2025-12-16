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
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { fetchJobByIdFromSupabase, type SupabaseJob } from "@/lib/supabase";
import { motion } from "framer-motion";
import { useState } from "react";

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [linkCopied, setLinkCopied] = useState(false);

  const { data: job, isLoading } = useQuery<SupabaseJob | null>({
    queryKey: ["job", id],
    queryFn: () => fetchJobByIdFromSupabase(id!),
    enabled: !!id,
  });

  const getPublicApplicationLink = (jobId: string) => {
    return `${window.location.origin}/apply/${jobId}`;
  };

  const copyLinkToClipboard = async () => {
    if (job) {
      const link = getPublicApplicationLink(job.id);
      try {
        await navigator.clipboard.writeText(link);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
        toast({
          title: "Link copied!",
          description: "The application link has been copied to your clipboard.",
        });
      } catch (error) {
        toast({
          title: "Failed to copy",
          description: "Please copy the link manually.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:bg-gradient-to-br dark:from-black dark:via-slate-950 dark:to-gray-900">
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
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:bg-gradient-to-br dark:from-black dark:via-slate-950 dark:to-gray-900">
        <div className="p-6 text-center">
        <p className="text-muted-foreground">Job not found</p>
        <Link href="/jobs">
          <Button variant="link">Back to Jobs</Button>
        </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:bg-gradient-to-br dark:from-black dark:via-slate-950 dark:to-gray-900">
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={copyLinkToClipboard}
                >
                  {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {linkCopied ? "Copied!" : "Copy Application Link"}
                </Button>
                <Link href={`/apply/${job.id}`} target="_blank">
                  <Button variant="outline" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Preview Application Page
                  </Button>
                </Link>
                <Link href={`/analysis?job=${job.id}`}>
                  <Button className="gap-2" data-testid="button-view-candidates">
                    <Bot className="h-4 w-4" />
                    View Candidates
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{job.location || "Remote"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{job.type}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                <span>Created: {new Date(job.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <Separator />

            {/* Public Application Link Section */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Public Application Link
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Share this link with candidates to receive applications directly to your ATS.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-background px-3 py-2 rounded border">
                  {getPublicApplicationLink(job.id)}
                </code>
                <Button
                  variant="outline"
                  onClick={copyLinkToClipboard}
                  className={linkCopied ? "text-green-600" : ""}
                >
                  {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4" />
                Job Description
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap" data-testid="text-job-description">
                {job.description_text}
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
    </div>
  );
}
