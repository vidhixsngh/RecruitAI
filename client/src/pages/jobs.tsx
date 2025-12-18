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
  Share2,
  ExternalLink,
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
import { createJobInSupabase, fetchJobsFromSupabase, fetchCandidatesFromSupabase, type SupabaseJob, type InsertJob as SupabaseInsertJob, type SupabaseCandidate } from "@/lib/supabase";


export default function JobsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isScreeningDialogOpen, setIsScreeningDialogOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isApplicantsDialogOpen, setIsApplicantsDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<SupabaseJob | null>(null);
  const [createdJob, setCreatedJob] = useState<SupabaseJob | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null);
  const [jobApplicants, setJobApplicants] = useState<SupabaseCandidate[]>([]);
  const [isSocialShareOpen, setIsSocialShareOpen] = useState(false);
  const [shareJobId, setShareJobId] = useState<string | null>(null);
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

  const handleViewApplicants = async (job: SupabaseJob) => {
    try {
      setSelectedJob(job);
      
      // Fetch all candidates and filter by job_id
      const allCandidates = await fetchCandidatesFromSupabase();
      const jobCandidates = allCandidates.filter(candidate => candidate.job_id === job.id);
      
      setJobApplicants(jobCandidates);
      setIsApplicantsDialogOpen(true);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      toast({
        title: "Error",
        description: "Failed to fetch applicants for this job.",
        variant: "destructive",
      });
    }
  };

  const handleShareOnSocial = (platform: string, jobId: string, jobTitle: string) => {
    const link = getPublicApplicationLink(jobId);
    const text = `We're hiring! Check out this opportunity: ${jobTitle}`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
        break;
      case 'indeed':
        // Indeed doesn't have a direct share URL, so we'll copy the link
        navigator.clipboard.writeText(link);
        toast({
          title: "Link Copied",
          description: "Paste this link when posting on Indeed",
        });
        return;
      case 'naukri':
        // Naukri doesn't have a direct share URL, so we'll copy the link
        navigator.clipboard.writeText(link);
        toast({
          title: "Link Copied",
          description: "Paste this link when posting on Naukri",
        });
        return;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
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
          <h1 className="text-2xl font-bold" data-testid="text-jobs-title">
            Job Openings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your open positions and view applicants for each role
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

                  {/* Share on Socials */}
                  <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Share Job Opening</span>
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-6 px-2 text-xs"
                        onClick={() => {
                          setShareJobId(job.id);
                          setSelectedJob(job);
                          setIsSocialShareOpen(true);
                        }}
                      >
                        <Share2 className="h-3 w-3 mr-1" />
                        Share it on socials
                      </Button>
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
                      onClick={() => handleViewApplicants(job)}
                      data-testid={`button-applicants-${job.id}`}
                    >
                      <Users className="h-4 w-4" />
                      View Applicants
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

      {/* Applicants Dialog */}
      <Dialog open={isApplicantsDialogOpen} onOpenChange={setIsApplicantsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Applicants for {selectedJob?.title}
            </DialogTitle>
            <DialogDescription>
              {jobApplicants.length} applicant{jobApplicants.length !== 1 ? 's' : ''} have applied for this position
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {jobApplicants.length > 0 ? (
              <div className="space-y-3">
                {jobApplicants.map((applicant, index) => (
                  <div
                    key={applicant.id}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{applicant.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{applicant.email}</p>
                      {applicant.ai_score && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            applicant.ai_score >= 70
                              ? "bg-emerald-100 text-emerald-700"
                              : applicant.ai_score >= 50
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            Score: {applicant.ai_score}/100
                          </span>
                          {applicant.ai_recommendation && (
                            <span className="text-xs text-muted-foreground capitalize">
                              • {applicant.ai_recommendation}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/candidates`}>
                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No applicants yet</h3>
                <p className="text-muted-foreground mb-4">
                  No one has applied for this position yet. Share the application link to start receiving applications.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = getPublicApplicationLink(selectedJob?.id || '');
                      navigator.clipboard.writeText(link);
                      toast({
                        title: "Link Copied",
                        description: "Application link copied to clipboard",
                      });
                    }}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy Application Link
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApplicantsDialogOpen(false)}>
              Close
            </Button>
            {jobApplicants.length > 0 && (
              <Link href="/candidates">
                <Button>
                  View All Candidates
                </Button>
              </Link>
            )}
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

      {/* Social Sharing Modal */}
      <Dialog open={isSocialShareOpen} onOpenChange={setIsSocialShareOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              Share Job Opening
            </DialogTitle>
            <DialogDescription>
              Share "{selectedJob?.title}" on social platforms to reach more candidates
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {/* LinkedIn */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => handleShareOnSocial('linkedin', shareJobId!, selectedJob?.title!)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <div className="text-left">
                <div className="font-medium">LinkedIn</div>
                <div className="text-xs text-muted-foreground">Share with professional network</div>
              </div>
              <ExternalLink className="h-4 w-4 ml-auto" />
            </Button>

            {/* Facebook */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => handleShareOnSocial('facebook', shareJobId!, selectedJob?.title!)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-500 text-white">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div className="text-left">
                <div className="font-medium">Facebook</div>
                <div className="text-xs text-muted-foreground">Share with friends and groups</div>
              </div>
              <ExternalLink className="h-4 w-4 ml-auto" />
            </Button>

            {/* Indeed */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => handleShareOnSocial('indeed', shareJobId!, selectedJob?.title!)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-700 text-white font-bold text-sm">
                i
              </div>
              <div className="text-left">
                <div className="font-medium">Indeed</div>
                <div className="text-xs text-muted-foreground">Copy link to post on Indeed</div>
              </div>
              <Copy className="h-4 w-4 ml-auto" />
            </Button>

            {/* Naukri */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => handleShareOnSocial('naukri', shareJobId!, selectedJob?.title!)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded bg-purple-600 text-white font-bold text-sm">
                N
              </div>
              <div className="text-left">
                <div className="font-medium">Naukri.com</div>
                <div className="text-xs text-muted-foreground">Copy link to post on Naukri</div>
              </div>
              <Copy className="h-4 w-4 ml-auto" />
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSocialShareOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
