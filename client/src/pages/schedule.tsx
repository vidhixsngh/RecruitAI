import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearch, Link } from "wouter";
import {
  Calendar,
  Clock,
  Mail,
  Phone,
  Send,
  CheckCircle,
  Users,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Candidate, Job } from "@shared/schema";
import { motion } from "framer-motion";

const defaultEmailTemplate = `Dear {name},

We are pleased to inform you that after reviewing your application for the {position} role, we would like to invite you for an interview.

Interview Details:
- Date: {date}
- Time: {time}
- Format: Video Call (link will be shared)

Please confirm your availability by replying to this email.

We look forward to speaking with you!

Best regards,
HR Team`;

const defaultWhatsAppTemplate = `Hi {name}! 👋

Great news! We'd like to invite you for an interview for the {position} position.

📅 Date: {date}
⏰ Time: {time}

Please confirm if this works for you.

Looking forward to connecting!`;

export default function SchedulePage() {
  const { toast } = useToast();
  const searchParams = useSearch();
  const candidateIdParam = new URLSearchParams(searchParams).get("candidate");

  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(
    candidateIdParam ? new Set([candidateIdParam]) : new Set()
  );
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [emailMessage, setEmailMessage] = useState(defaultEmailTemplate);
  const [whatsAppMessage, setWhatsAppMessage] = useState(defaultWhatsAppTemplate);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const { data: candidates, isLoading: candidatesLoading } = useQuery<Candidate[]>({
    queryKey: ["/api/candidates"],
  });

  const { data: jobs } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const scheduleInterviewsMutation = useMutation({
    mutationFn: async (data: { candidateIds: string[]; date: string; time: string; emailMessage: string; whatsAppMessage: string }) => {
      return apiRequest("POST", "/api/interviews/schedule", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/interviews"] });
      setSelectedCandidates(new Set());
      setScheduleDate("");
      setScheduleTime("");
      toast({
        title: "Interviews scheduled!",
        description: "Great! Interviews scheduled — kudos to team!",
      });
    },
  });

  const eligibleCandidates = candidates?.filter(
    (c) => c.recommendation === "interview" && c.status !== "interview_scheduled"
  );

  const getJobTitle = (jobId: string) => {
    return jobs?.find((j) => j.id === jobId)?.title || "Unknown Position";
  };

  const toggleCandidate = (id: string) => {
    setSelectedCandidates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (eligibleCandidates) {
      setSelectedCandidates(new Set(eligibleCandidates.map((c) => c.id)));
    }
  };

  const handleSchedule = () => {
    if (selectedCandidates.size === 0) {
      toast({
        title: "No candidates selected",
        description: "Please select at least one candidate to schedule.",
        variant: "destructive",
      });
      return;
    }
    if (!scheduleDate || !scheduleTime) {
      toast({
        title: "Missing schedule details",
        description: "Please select a date and time for the interviews.",
        variant: "destructive",
      });
      return;
    }

    scheduleInterviewsMutation.mutate({
      candidateIds: Array.from(selectedCandidates),
      date: scheduleDate,
      time: scheduleTime,
      emailMessage,
      whatsAppMessage,
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-schedule-title">
          <Calendar className="h-6 w-6 text-primary" />
          Schedule Interviews
        </h1>
        <p className="text-muted-foreground mt-1">
          Select candidates and schedule interviews with automated notifications
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle className="text-lg">Eligible Candidates</CardTitle>
                  <CardDescription>
                    Candidates recommended for interviews
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {selectedCandidates.size} selected
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAll}
                    data-testid="button-select-all"
                  >
                    Select All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {candidatesLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))
              ) : eligibleCandidates && eligibleCandidates.length > 0 ? (
                eligibleCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-colors cursor-pointer ${
                      selectedCandidates.has(candidate.id)
                        ? "bg-primary/5 border border-primary/20"
                        : "bg-muted/30 hover-elevate"
                    }`}
                    onClick={() => toggleCandidate(candidate.id)}
                    data-testid={`candidate-row-${candidate.id}`}
                  >
                    <Checkbox
                      checked={selectedCandidates.has(candidate.id)}
                      onCheckedChange={() => toggleCandidate(candidate.id)}
                      data-testid={`checkbox-${candidate.id}`}
                    />
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{candidate.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {getJobTitle(candidate.jobId)} • Score: {candidate.resumeScore}/100
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No candidates eligible for scheduling.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Run AI screening to get interview recommendations.
                  </p>
                  <Link href="/jobs">
                    <Button variant="outline" className="mt-4 gap-2">
                      Go to Job Openings
                      <ArrowRight className="h-4 w-4" />
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
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="sticky top-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Schedule Details</CardTitle>
              <CardDescription>
                Set interview date, time, and messages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Interview Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    data-testid="input-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Interview Time</Label>
                  <Select value={scheduleTime} onValueChange={setScheduleTime}>
                    <SelectTrigger data-testid="select-time">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"].map(
                        (time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs defaultValue="email" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="email" className="flex-1 gap-1" data-testid="tab-email">
                    <Mail className="h-4 w-4" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="whatsapp" className="flex-1 gap-1" data-testid="tab-whatsapp">
                    <Phone className="h-4 w-4" />
                    WhatsApp
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="email" className="mt-4">
                  <div className="space-y-2">
                    <Label>Email Message</Label>
                    <Textarea
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      className="min-h-40 text-sm"
                      data-testid="input-email-message"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="whatsapp" className="mt-4">
                  <div className="space-y-2">
                    <Label>WhatsApp Message</Label>
                    <Textarea
                      value={whatsAppMessage}
                      onChange={(e) => setWhatsAppMessage(e.target.value)}
                      className="min-h-40 text-sm"
                      data-testid="input-whatsapp-message"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <Button
                className="w-full gap-2"
                onClick={handleSchedule}
                disabled={selectedCandidates.size === 0 || scheduleInterviewsMutation.isPending}
                data-testid="button-schedule"
              >
                {scheduleInterviewsMutation.isPending ? (
                  <>
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Schedule {selectedCandidates.size > 0 ? `(${selectedCandidates.size})` : ""} Interviews
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
