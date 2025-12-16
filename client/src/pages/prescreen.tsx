import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  UserCheck,
  Phone,
  Calendar,
  Send,
  Clock,
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

const defaultCallTemplate = `Hi {name},

This is a quick note to let you know that we'd like to schedule a brief pre-screening call regarding your application for {position}.

The call will be approximately 15-20 minutes to discuss your background and answer any initial questions.

Proposed time: {date} at {time}

Please confirm your availability.

Best,
HR Team`;

export default function PrescreenPage() {
  const { toast } = useToast();
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [callMessage, setCallMessage] = useState(defaultCallTemplate);

  const { data: candidates, isLoading: candidatesLoading } = useQuery<Candidate[]>({
    queryKey: ["/api/candidates"],
  });

  const { data: jobs } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const schedulePrescreenMutation = useMutation({
    mutationFn: async (data: { candidateIds: string[]; date: string; time: string; message: string }) => {
      return apiRequest("POST", "/api/prescreen/schedule", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      setSelectedCandidates(new Set());
      setScheduleDate("");
      setScheduleTime("");
      toast({
        title: "Pre-screen calls scheduled!",
        description: "Candidates have been notified about the HR call.",
      });
    },
  });

  const onHoldCandidates = candidates?.filter(
    (c) => c.recommendation === "on-hold" || c.status === "pending"
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
    if (onHoldCandidates) {
      setSelectedCandidates(new Set(onHoldCandidates.map((c) => c.id)));
    }
  };

  const handleSchedule = () => {
    if (selectedCandidates.size === 0) {
      toast({
        title: "No candidates selected",
        description: "Please select at least one candidate.",
        variant: "destructive",
      });
      return;
    }
    if (!scheduleDate || !scheduleTime) {
      toast({
        title: "Missing schedule details",
        description: "Please select a date and time.",
        variant: "destructive",
      });
      return;
    }

    schedulePrescreenMutation.mutate({
      candidateIds: Array.from(selectedCandidates),
      date: scheduleDate,
      time: scheduleTime,
      message: callMessage,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:bg-gradient-to-br dark:from-black dark:via-slate-950 dark:to-gray-900">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-prescreen-title">
          <UserCheck className="h-6 w-6 text-primary" />
          Pre-Screen Calls
        </h1>
        <p className="text-muted-foreground mt-1">
          Schedule HR screening calls for candidates who need further evaluation
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
                  <CardTitle className="text-lg">On-Hold Candidates</CardTitle>
                  <CardDescription>
                    Candidates requiring additional screening
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
              ) : onHoldCandidates && onHoldCandidates.length > 0 ? (
                onHoldCandidates.map((candidate) => (
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{candidate.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {getJobTitle(candidate.jobId)} • Score: {candidate.resumeScore}/100
                      </p>
                    </div>
                    <Badge variant="outline" className="border-amber-300 text-amber-600 dark:text-amber-400">
                      On Hold
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No on-hold candidates.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Candidates marked as on-hold will appear here.
                  </p>
                  <Link href="/analysis">
                    <Button variant="outline" className="mt-4 gap-2">
                      View AI Analysis
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
              <CardTitle className="text-lg">Schedule HR Call</CardTitle>
              <CardDescription>
                Set up pre-screening calls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Call Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    data-testid="input-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Call Time</Label>
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

              <div className="space-y-2">
                <Label>Message Template</Label>
                <Textarea
                  value={callMessage}
                  onChange={(e) => setCallMessage(e.target.value)}
                  className="min-h-48 text-sm"
                  data-testid="input-message"
                />
              </div>

              <Button
                className="w-full gap-2"
                onClick={handleSchedule}
                disabled={selectedCandidates.size === 0 || schedulePrescreenMutation.isPending}
                data-testid="button-schedule"
              >
                {schedulePrescreenMutation.isPending ? (
                  <>
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4" />
                    Schedule {selectedCandidates.size > 0 ? `(${selectedCandidates.size})` : ""} Calls
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      </div>
    </div>
  );
}
