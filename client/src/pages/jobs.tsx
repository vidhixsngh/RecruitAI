import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Briefcase,
  Plus,
  Search,
  MapPin,
  Users,
  Clock,
  MoreVertical,
  Bot,
  FileText,
  Trash2,
  Eye,
  Copy,
  Check,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { createJobInSupabase, fetchJobsFromSupabase, type SupabaseJob, type InsertJob as SupabaseInsertJob } from "@/lib/supabase";


export default function JobsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isScreeningDialogOpen, setIsScreeningDialogOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<SupabaseJob | null>(null);
  const [createdJob, setCreatedJob] = useState<SupabaseJob | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null);
  const [newJob, setNewJob] = useState<Partial<SupabaseInsertJob>>({
    title: "",
    department: "",
    description_text: "",
    requirements: "",
    location: "",
    type: "full-time",
    status: "active",
  });

  const { data: jobs, isLoading } = useQuery<SupabaseJob[]>({
    queryKey: ["supabase-jobs"],
    queryFn: fetchJobsFromSupabase,
  });

  const createJobMutation = useMutation({
    mutationFn: async (job: SupabaseInsertJob) => {
      return createJobInSupabase(job);
    },
    onSuccess: (createdJobData) => {
      queryClient.invalidateQueries({ queryKey: ["supabase-jobs"] });
      setIsAddDialogOpen(false);
      setCreatedJob(createdJobData);
      setIsSuccessModalOpen(true);
      setNewJob({
        title: "",
        department: "",
        description_text: "",
        requirements: "",
        location: "",
        type: "full-time",
        status: "active",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return apiRequest("DELETE", `/api/jobs/${jobId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Job deleted",
        description: "The job opening has been removed.",
      });
    },
  });

  const startScreeningMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return apiRequest("POST", `/api/jobs/${jobId}/screen`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      setIsScreeningDialogOpen(false);
      setSelectedJob(null);
      toast({
        title: "Screening complete!",
        description: "AI has analyzed all candidates. Check the Analysis page for results.",
      });
    },
  });

  const filteredJobs = jobs?.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateJob = () => {
    if (!newJob.title || !newJob.department || !newJob.description_text) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createJobMutation.mutate(newJob as SupabaseInsertJob);
  };

  const getPublicApplicationLink = (jobId: string) => {
    return `${window.location.origin}/apply/${jobId}`;
  };

  const copyLinkToClipboard = async () => {
    if (createdJob) {
      const link = getPublicApplicationLink(createdJob.id);
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

  const handleStartScreening = () => {
    if (selectedJob) {
      startScreeningMutation.mutate(selectedJob.id);
    }
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
          <h1 className="text-2xl font-bold" data-testid="text-jobs-title">
            Job Openings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your open positions and start screening candidates
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-add-job">
              <Plus className="h-4 w-4" />
              Add New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Job Opening</DialogTitle>
              <DialogDescription>
                Add a new position to start receiving applications
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Senior Software Engineer"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  data-testid="input-job-title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    placeholder="e.g., Engineering"
                    value={newJob.department}
                    onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                    data-testid="input-department"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Mumbai, Remote"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    data-testid="input-location"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Job Type</Label>
                <Select
                  value={newJob.type}
                  onValueChange={(value) => setNewJob({ ...newJob, type: value })}
                >
                  <SelectTrigger data-testid="select-job-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  value={newJob.description_text}
                  onChange={(e) => setNewJob({ ...newJob, description_text: e.target.value })}
                  className="min-h-24"
                  data-testid="input-description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  placeholder="List the required skills, experience, and qualifications..."
                  value={newJob.requirements}
                  onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                  className="min-h-20"
                  data-testid="input-requirements"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateJob}
                disabled={createJobMutation.isPending}
                data-testid="button-create-job"
              >
                {createJobMutation.isPending ? "Creating..." : "Create Job"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs by title or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-jobs"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredJobs && filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="hover-elevate transition-colors" data-testid={`card-job-${job.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{job.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span>{job.department}</span>
                        <span className="text-muted-foreground/50">•</span>
                        <Badge variant="outline" className="text-xs">
                          {job.type}
                        </Badge>
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`button-job-menu-${job.id}`}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/jobs/${job.id}`}>
                          <DropdownMenuItem data-testid={`link-view-job-${job.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem
                          onClick={async () => {
                            const link = getPublicApplicationLink(job.id);
                            try {
                              await navigator.clipboard.writeText(link);
                              toast({
                                title: "Application link copied!",
                                description: "Share this link with candidates to receive applications.",
                              });
                            } catch (error) {
                              toast({
                                title: "Failed to copy",
                                description: "Please copy the link manually.",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Application Link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteJobMutation.mutate(job.id)}
                          data-testid={`button-delete-job-${job.id}`}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location || "Remote"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{job.applicantsCount} applicants</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {job.description_text}
                  </p>

                  {/* Public Application Link */}
                  <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Public Application Link</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-6 px-2 text-xs ${copiedJobId === job.id ? 'text-green-600' : ''}`}
                        onClick={async () => {
                          const link = getPublicApplicationLink(job.id);
                          try {
                            await navigator.clipboard.writeText(link);
                            setCopiedJobId(job.id);
                            setTimeout(() => setCopiedJobId(null), 2000);
                            toast({
                              title: "Link copied!",
                              description: "Application link copied to clipboard.",
                            });
                          } catch (error) {
                            toast({
                              title: "Failed to copy",
                              description: "Please copy the link manually.",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        {copiedJobId === job.id ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-background px-2 py-1 rounded border truncate">
                        {getPublicApplicationLink(job.id)}
                      </code>
                      <Link href={`/apply/${job.id}`} target="_blank">
                        <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 gap-2"
                      onClick={() => {
                        setSelectedJob(job);
                        setIsScreeningDialogOpen(true);
                      }}
                      data-testid={`button-screen-${job.id}`}
                    >
                      <Bot className="h-4 w-4" />
                      Start Screening
                    </Button>
                    <Link href={`/jobs/${job.id}`}>
                      <Button variant="outline" size="icon" data-testid={`button-details-${job.id}`}>
                        <FileText className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="text-center py-12">
            <CardContent>
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No job openings yet</h3>
              <p className="text-muted-foreground mb-6">
                Let's add your first one and start receiving applications.
              </p>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="gap-2"
                data-testid="button-add-first-job"
              >
                <Plus className="h-4 w-4" />
                Add Your First Job
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Dialog open={isScreeningDialogOpen} onOpenChange={setIsScreeningDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Start AI Screening
            </DialogTitle>
            <DialogDescription>
              Our AI will analyze all resumes for "{selectedJob?.title}" and provide scores,
              rationale, and recommended actions for each candidate.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 rounded-lg bg-muted/30 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{selectedJob?.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedJob?.department} • {selectedJob?.applicantsCount} applicants
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>The AI will:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Compare each resume against the job description</li>
                <li>Calculate a match score (0-100)</li>
                <li>Provide rationale for each score</li>
                <li>Recommend: Interview, On-Hold, or Reject</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScreeningDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleStartScreening}
              disabled={startScreeningMutation.isPending}
              className="gap-2"
              data-testid="button-confirm-screening"
            >
              {startScreeningMutation.isPending ? (
                <>
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4" />
                  Start Screening
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal with Public Application Link */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              Job Created Successfully!
            </DialogTitle>
            <DialogDescription>
              Your job opening has been created and is now live. Share the application link below to start receiving applications.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted/30 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{createdJob?.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {createdJob?.department} • {createdJob?.type}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Public Application Link</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={createdJob ? getPublicApplicationLink(createdJob.id) : ''}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyLinkToClipboard}
                  className={linkCopied ? "text-green-600" : ""}
                >
                  {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this link with candidates to receive applications directly to your ATS.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSuccessModalOpen(false)}>
              Close
            </Button>
            <Link href={createdJob ? `/apply/${createdJob.id}` : '#'}>
              <Button>
                Preview Application Page
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
