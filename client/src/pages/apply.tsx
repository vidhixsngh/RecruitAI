import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  MapPin,
  Clock,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { fetchJobByIdFromSupabase, type SupabaseJob } from "@/lib/supabase";
import { motion } from "framer-motion";

interface ApplicationForm {
  candidate_name: string;
  email: string;
  whatsapp_number: string;
  resume: File | null;
}

export default function ApplyPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { toast } = useToast();
  
  const [form, setForm] = useState<ApplicationForm>({
    candidate_name: "",
    email: "",
    whatsapp_number: "",
    resume: null,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Fetch job details
  const { data: job, isLoading: jobLoading, error: jobError } = useQuery<SupabaseJob | null>({
    queryKey: ["job", jobId],
    queryFn: () => fetchJobByIdFromSupabase(jobId!),
    enabled: !!jobId,
  });

  const handleInputChange = (field: keyof ApplicationForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (file: File | null) => {
    setForm(prev => ({ ...prev, resume: file }));
  };
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.endsWith('.pdf')) {
        handleFileChange(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.candidate_name || !form.email || !form.whatsapp_number || !form.resume) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields and upload your resume.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Starting form submission...');
      console.log('Job ID:', jobId);
      console.log('Job Title:', job?.title);
      console.log('Form data:', form);

      const formData = new FormData();
      
      // Job Information (all details from HR)
      formData.append('job_id', jobId!);
      formData.append('job_title', job!.title);
      formData.append('job_description', job!.description_text);
      formData.append('job_department', job!.department);
      formData.append('job_requirements', job!.requirements || '');
      formData.append('job_location', job!.location || '');
      formData.append('job_type', job!.type);
      formData.append('job_status', job!.status);
      
      // Candidate Information
      formData.append('candidate_name', form.candidate_name);
      formData.append('email', form.email);
      formData.append('whatsapp_number', form.whatsapp_number);
      formData.append('resume', form.resume);

      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      console.log('Sending request to backend proxy...');
      const response = await fetch('/webhook/submit-application', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to submit application'}`);
      }

      const responseData = await response.text();
      console.log('Success response:', responseData);

      setIsSubmitted(true);
      setForm({
        candidate_name: "",
        email: "",
        whatsapp_number: "",
        resume: null,
      });

      toast({
        title: "Application submitted!",
        description: "Thank you for your application. We'll be in touch soon.",
      });

    } catch (error) {
      console.error('Submission error:', error);
      
      let errorMessage = "There was an error submitting your application. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Submission failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (jobLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">Job Not Found</h3>
            <p className="text-muted-foreground">
              The job you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="max-w-md">
            <CardContent className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold mb-2">Application Submitted!</h3>
              <p className="text-muted-foreground mb-4">
                Thank you for applying to <strong>{job.title}</strong>. We've received your application and will review it shortly.
              </p>
              <Button onClick={() => setIsSubmitted(false)} variant="outline">
                Submit Another Application
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Job Details Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{job.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {job.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location || "Remote"}
                    </span>
                    <Badge variant="outline">{job.type}</Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Job Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{job.description_text}</p>
              </div>
              {job.requirements && (
                <div>
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{job.requirements}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Form */}
          <Card>
            <CardHeader>
              <CardTitle>Apply for this Position</CardTitle>
              <CardDescription>
                Fill out the form below to submit your application. All fields are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={form.candidate_name}
                      onChange={(e) => handleInputChange('candidate_name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={form.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={form.whatsapp_number}
                    onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                    required
                  />
                </div>

                {/* Resume Upload */}
                <div className="space-y-2">
                  <Label>Resume (PDF) *</Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-muted-foreground/50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {form.resume ? (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">{form.resume.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFileChange(null)}
                          className="ml-2"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Drop your resume here, or click to browse</p>
                          <p className="text-xs text-muted-foreground">PDF files only, max 10MB</p>
                        </div>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileChange(file);
                            }
                          }}
                          className="hidden"
                          id="resume-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('resume-upload')?.click()}
                        >
                          Choose File
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting Application...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}