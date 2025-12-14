import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJobSchema, insertCandidateSchema, insertInterviewSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch job" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const parsed = insertJobSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const job = await storage.createJob(parsed.data);
      res.status(201).json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to create job" });
    }
  });

  app.patch("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.updateJob(req.params.id, req.body);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to update job" });
    }
  });

  app.delete("/api/jobs/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteJob(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete job" });
    }
  });

  app.post("/api/jobs/:id/screen", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      const candidates = await storage.getCandidatesByJobId(req.params.id);
      
      for (const candidate of candidates) {
        await storage.updateCandidate(candidate.id, {
          status: "screened",
          lastUpdated: new Date().toISOString().split("T")[0],
        });
      }
      
      res.json({ message: "Screening complete", candidatesProcessed: candidates.length });
    } catch (error) {
      res.status(500).json({ error: "Failed to screen candidates" });
    }
  });

  app.get("/api/candidates", async (req, res) => {
    try {
      const candidates = await storage.getCandidates();
      res.json(candidates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch candidates" });
    }
  });

  app.get("/api/candidates/:id", async (req, res) => {
    try {
      const candidate = await storage.getCandidate(req.params.id);
      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }
      res.json(candidate);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch candidate" });
    }
  });

  app.post("/api/candidates", async (req, res) => {
    try {
      const parsed = insertCandidateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const candidate = await storage.createCandidate(parsed.data);
      res.status(201).json(candidate);
    } catch (error) {
      res.status(500).json({ error: "Failed to create candidate" });
    }
  });

  app.patch("/api/candidates/:id", async (req, res) => {
    try {
      const candidate = await storage.updateCandidate(req.params.id, req.body);
      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }
      res.json(candidate);
    } catch (error) {
      res.status(500).json({ error: "Failed to update candidate" });
    }
  });

  app.get("/api/interviews", async (req, res) => {
    try {
      const interviews = await storage.getInterviews();
      res.json(interviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch interviews" });
    }
  });

  app.post("/api/interviews/schedule", async (req, res) => {
    try {
      const { candidateIds, date, time, emailMessage, whatsAppMessage } = req.body;
      
      if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
        return res.status(400).json({ error: "No candidates selected" });
      }
      
      const scheduledInterviews = [];
      
      for (const candidateId of candidateIds) {
        const candidate = await storage.getCandidate(candidateId);
        if (candidate) {
          const interview = await storage.createInterview({
            candidateId,
            jobId: candidate.jobId,
            type: "interview",
            scheduledDate: date,
            scheduledTime: time,
            message: emailMessage,
            channel: "email,whatsapp",
            status: "scheduled",
          });
          
          await storage.updateCandidate(candidateId, {
            status: "interview_scheduled",
          });
          
          scheduledInterviews.push(interview);
        }
      }
      
      res.status(201).json({ 
        message: "Interviews scheduled successfully", 
        count: scheduledInterviews.length,
        interviews: scheduledInterviews 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to schedule interviews" });
    }
  });

  app.post("/api/prescreen/schedule", async (req, res) => {
    try {
      const { candidateIds, date, time, message } = req.body;
      
      if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
        return res.status(400).json({ error: "No candidates selected" });
      }
      
      const scheduledCalls = [];
      
      for (const candidateId of candidateIds) {
        const candidate = await storage.getCandidate(candidateId);
        if (candidate) {
          const interview = await storage.createInterview({
            candidateId,
            jobId: candidate.jobId,
            type: "prescreen",
            scheduledDate: date,
            scheduledTime: time,
            message: message,
            channel: "phone",
            status: "scheduled",
          });
          
          await storage.updateCandidate(candidateId, {
            status: "prescreen_scheduled",
          });
          
          scheduledCalls.push(interview);
        }
      }
      
      res.status(201).json({ 
        message: "Pre-screen calls scheduled successfully", 
        count: scheduledCalls.length 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to schedule pre-screen calls" });
    }
  });

  app.post("/api/emails/send", async (req, res) => {
    try {
      const { candidateIds, subject, body } = req.body;
      
      if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
        return res.status(400).json({ error: "No candidates selected" });
      }
      
      for (const candidateId of candidateIds) {
        await storage.updateCandidate(candidateId, {
          status: "email_sent",
        });
      }
      
      res.json({ 
        message: "Emails sent successfully", 
        count: candidateIds.length 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to send emails" });
    }
  });

  app.get("/api/email-templates", async (req, res) => {
    try {
      const templates = await storage.getEmailTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch email templates" });
    }
  });

  return httpServer;
}
