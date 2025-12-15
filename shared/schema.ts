import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  companyName: text("company_name").notNull(),
  role: text("role").notNull(),
  email: text("email").notNull(),
});

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  department: text("department").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("active"),
  applicantsCount: integer("applicants_count").notNull().default(0),
});

export const candidates = sqliteTable("candidates", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  jobId: text("job_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  resumeScore: integer("resume_score").notNull(),
  rationale: text("rationale").notNull(),
  recommendation: text("recommendation").notNull(),
  status: text("status").notNull().default("pending"),
  appliedDate: text("applied_date").notNull(),
  lastUpdated: text("last_updated").notNull(),
});

export const interviews = sqliteTable("interviews", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  candidateId: text("candidate_id").notNull(),
  jobId: text("job_id").notNull(),
  type: text("type").notNull(),
  scheduledDate: text("scheduled_date").notNull(),
  scheduledTime: text("scheduled_time").notNull(),
  message: text("message").notNull(),
  channel: text("channel").notNull(),
  status: text("status").notNull().default("scheduled"),
});

export const emailTemplates = sqliteTable("email_templates", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  type: text("type").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, applicantsCount: true });
export const insertCandidateSchema = createInsertSchema(candidates).omit({ id: true });
export const insertInterviewSchema = createInsertSchema(interviews).omit({ id: true });
export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({ id: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidates.$inferSelect;

export type InsertInterview = z.infer<typeof insertInterviewSchema>;
export type Interview = typeof interviews.$inferSelect;

export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
