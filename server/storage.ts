import { 
  type User, type InsertUser, 
  type Job, type InsertJob,
  type Candidate, type InsertCandidate,
  type Interview, type InsertInterview,
  type EmailTemplate, type InsertEmailTemplate 
} from "@shared/schema";
import { randomUUID } from "crypto";
// check 
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getJobs(): Promise<Job[]>;
  getJob(id: string): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, job: Partial<Job>): Promise<Job | undefined>;
  deleteJob(id: string): Promise<boolean>;
// check2
  getCandidates(): Promise<Candidate[]>;
  getCandidate(id: string): Promise<Candidate | undefined>;
  getCandidatesByJobId(jobId: string): Promise<Candidate[]>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: string, candidate: Partial<Candidate>): Promise<Candidate | undefined>;
  deleteCandidate(id: string): Promise<boolean>;

  getInterviews(): Promise<Interview[]>;
  getInterview(id: string): Promise<Interview | undefined>;
  createInterview(interview: InsertInterview): Promise<Interview>;
  updateInterview(id: string, interview: Partial<Interview>): Promise<Interview | undefined>;

  getEmailTemplates(): Promise<EmailTemplate[]>;
  getEmailTemplate(id: string): Promise<EmailTemplate | undefined>;
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private jobs: Map<string, Job>;
  private candidates: Map<string, Candidate>;
  private interviews: Map<string, Interview>;
  private emailTemplates: Map<string, EmailTemplate>;

  constructor() {
    this.users = new Map();
    this.jobs = new Map();
    this.candidates = new Map();
    this.interviews = new Map();
    this.emailTemplates = new Map();
    
    this.seedData();
  }

  private seedData() {
    const job1: Job = {
      id: "job-1",
      title: "Senior Frontend Developer",
      department: "Engineering",
      description: "We are looking for an experienced Frontend Developer to join our team. You will be responsible for building user interfaces and improving user experience across our products. Experience with React, TypeScript, and modern CSS is essential.",
      requirements: "5+ years of frontend development experience\nProficiency in React and TypeScript\nExperience with modern CSS and component libraries\nFamiliarity with testing frameworks\nStrong problem-solving skills",
      location: "Mumbai, Hybrid",
      type: "full-time",
      status: "active",
      applicantsCount: 12,
    };
    
    const job2: Job = {
      id: "job-2",
      title: "Product Manager",
      department: "Product",
      description: "We are seeking a Product Manager to drive product strategy and roadmap. You will work closely with engineering, design, and stakeholders to deliver exceptional products that solve real customer problems.",
      requirements: "3+ years of product management experience\nStrong analytical and communication skills\nExperience with agile methodologies\nAbility to translate business needs into product requirements",
      location: "Bangalore, Remote",
      type: "full-time",
      status: "active",
      applicantsCount: 8,
    };
    
    const job3: Job = {
      id: "job-3",
      title: "UX Designer",
      department: "Design",
      description: "Join our design team as a UX Designer. You will create intuitive and beautiful user experiences, conduct user research, and collaborate with product and engineering teams.",
      requirements: "4+ years of UX design experience\nProficiency in Figma or similar tools\nPortfolio demonstrating user-centered design\nExperience with design systems",
      location: "Mumbai, Remote",
      type: "full-time",
      status: "active",
      applicantsCount: 6,
    };
    
    this.jobs.set(job1.id, job1);
    this.jobs.set(job2.id, job2);
    this.jobs.set(job3.id, job3);

    const candidates: Candidate[] = [
      {
        id: "cand-1",
        jobId: "job-1",
        name: "Priya Sharma",
        email: "priya.sharma@email.com",
        phone: "+91 98765 43210",
        resumeScore: 92,
        rationale: "Excellent match with 6+ years of React experience. Strong portfolio demonstrating complex UI implementations. Previous experience at a SaaS company aligns well with our tech stack.",
        recommendation: "interview",
        status: "pending",
        appliedDate: "2024-12-10",
        lastUpdated: "2024-12-14",
      },
      {
        id: "cand-2",
        jobId: "job-1",
        name: "Rahul Verma",
        email: "rahul.verma@email.com",
        phone: "+91 87654 32109",
        resumeScore: 85,
        rationale: "Strong technical background with 5 years of frontend experience. Good knowledge of React and modern JavaScript. Could benefit from more TypeScript exposure but overall a solid candidate.",
        recommendation: "interview",
        status: "pending",
        appliedDate: "2024-12-11",
        lastUpdated: "2024-12-14",
      },
      {
        id: "cand-3",
        jobId: "job-1",
        name: "Anita Desai",
        email: "anita.desai@email.com",
        phone: "+91 76543 21098",
        resumeScore: 78,
        rationale: "Good frontend skills with 4 years of experience. Has worked with React but limited TypeScript experience. Portfolio shows creative work but may need mentoring on enterprise-level applications.",
        recommendation: "interview",
        status: "pending",
        appliedDate: "2024-12-09",
        lastUpdated: "2024-12-14",
      },
      {
        id: "cand-4",
        jobId: "job-1",
        name: "Vikram Singh",
        email: "vikram.singh@email.com",
        phone: "+91 65432 10987",
        resumeScore: 65,
        rationale: "3 years of experience with mixed frontend and backend work. React knowledge is present but not deep. May be better suited for a mid-level position. Consider for future openings.",
        recommendation: "on-hold",
        status: "pending",
        appliedDate: "2024-12-08",
        lastUpdated: "2024-12-14",
      },
      {
        id: "cand-5",
        jobId: "job-1",
        name: "Meera Patel",
        email: "meera.patel@email.com",
        phone: "+91 54321 09876",
        resumeScore: 68,
        rationale: "Interesting background in design and frontend development. 4 years of experience but more focused on design than development. Could be a good culture fit but technical skills need evaluation.",
        recommendation: "on-hold",
        status: "pending",
        appliedDate: "2024-12-12",
        lastUpdated: "2024-12-14",
      },
      {
        id: "cand-6",
        jobId: "job-1",
        name: "Arjun Kumar",
        email: "arjun.kumar@email.com",
        phone: "+91 43210 98765",
        resumeScore: 72,
        rationale: "Solid experience in web development but primarily with Angular. React experience is limited to personal projects. Strong potential but may require ramp-up time.",
        recommendation: "on-hold",
        status: "pending",
        appliedDate: "2024-12-07",
        lastUpdated: "2024-12-14",
      },
      {
        id: "cand-7",
        jobId: "job-1",
        name: "Deepak Reddy",
        email: "deepak.reddy@email.com",
        phone: "+91 32109 87654",
        resumeScore: 70,
        rationale: "Has frontend development experience but primarily in Vue.js. Transferable skills are present but specific React expertise is lacking. Consider for training investment.",
        recommendation: "on-hold",
        status: "pending",
        appliedDate: "2024-12-06",
        lastUpdated: "2024-12-14",
      },
      {
        id: "cand-8",
        jobId: "job-1",
        name: "Sneha Iyer",
        email: "sneha.iyer@email.com",
        phone: "+91 21098 76543",
        resumeScore: 62,
        rationale: "Has frontend development experience but primarily in Vue.js. Transferable skills are present but specific React expertise is lacking.",
        recommendation: "on-hold",
        status: "pending",
        appliedDate: "2024-12-05",
        lastUpdated: "2024-12-14",
      },
      {
        id: "cand-9",
        jobId: "job-1",
        name: "Karan Malhotra",
        email: "karan.malhotra@email.com",
        phone: "+91 10987 65432",
        resumeScore: 42,
        rationale: "2 years of experience, primarily in backend development. Frontend skills are basic and do not meet the senior-level requirements. Resume shows gaps that need clarification.",
        recommendation: "reject",
        status: "pending",
        appliedDate: "2024-12-04",
        lastUpdated: "2024-12-14",
      },
      {
        id: "cand-10",
        jobId: "job-1",
        name: "Divya Nair",
        email: "divya.nair@email.com",
        phone: "+91 09876 54321",
        resumeScore: 35,
        rationale: "Recent graduate with internship experience only. Skills listed are academic and lack professional depth. Would be suitable for junior positions in the future.",
        recommendation: "reject",
        status: "pending",
        appliedDate: "2024-12-03",
        lastUpdated: "2024-12-14",
      },
      {
        id: "cand-11",
        jobId: "job-2",
        name: "Amit Kapoor",
        email: "amit.kapoor@email.com",
        phone: "+91 98123 45678",
        resumeScore: 88,
        rationale: "Strong product management background with 4 years at a B2B SaaS company. Experience with agile methodologies and cross-functional team leadership. Great cultural fit.",
        recommendation: "interview",
        status: "pending",
        appliedDate: "2024-12-11",
        lastUpdated: "2024-12-14",
      },
      {
        id: "cand-12",
        jobId: "job-3",
        name: "Neha Gupta",
        email: "neha.gupta@email.com",
        phone: "+91 87234 56789",
        resumeScore: 90,
        rationale: "Exceptional UX portfolio with work for major tech companies. 5 years of experience with strong user research skills. Design thinking approach aligns perfectly with our needs.",
        recommendation: "interview",
        status: "pending",
        appliedDate: "2024-12-10",
        lastUpdated: "2024-12-14",
      },
    ];

    candidates.forEach((c) => this.candidates.set(c.id, c));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values());
  }

  async getJob(id: string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = randomUUID();
    const job: Job = { ...insertJob, id, applicantsCount: 0 };
    this.jobs.set(id, job);
    return job;
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    const updated = { ...job, ...updates };
    this.jobs.set(id, updated);
    return updated;
  }

  async deleteJob(id: string): Promise<boolean> {
    return this.jobs.delete(id);
  }

  async getCandidates(): Promise<Candidate[]> {
    return Array.from(this.candidates.values());
  }

  async getCandidate(id: string): Promise<Candidate | undefined> {
    return this.candidates.get(id);
  }

  async getCandidatesByJobId(jobId: string): Promise<Candidate[]> {
    return Array.from(this.candidates.values()).filter(c => c.jobId === jobId);
  }

  async createCandidate(insertCandidate: InsertCandidate): Promise<Candidate> {
    const id = randomUUID();
    const candidate: Candidate = { ...insertCandidate, id };
    this.candidates.set(id, candidate);
    
    const job = this.jobs.get(insertCandidate.jobId);
    if (job) {
      this.jobs.set(job.id, { ...job, applicantsCount: job.applicantsCount + 1 });
    }
    
    return candidate;
  }

  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate | undefined> {
    const candidate = this.candidates.get(id);
    if (!candidate) return undefined;
    const updated = { ...candidate, ...updates, lastUpdated: new Date().toISOString().split("T")[0] };
    this.candidates.set(id, updated);
    return updated;
  }

  async deleteCandidate(id: string): Promise<boolean> {
    const candidate = this.candidates.get(id);
    if (candidate) {
      const job = this.jobs.get(candidate.jobId);
      if (job) {
        this.jobs.set(job.id, { ...job, applicantsCount: Math.max(0, job.applicantsCount - 1) });
      }
    }
    return this.candidates.delete(id);
  }

  async getInterviews(): Promise<Interview[]> {
    return Array.from(this.interviews.values());
  }

  async getInterview(id: string): Promise<Interview | undefined> {
    return this.interviews.get(id);
  }

  async createInterview(insertInterview: InsertInterview): Promise<Interview> {
    const id = randomUUID();
    const interview: Interview = { ...insertInterview, id };
    this.interviews.set(id, interview);
    return interview;
  }

  async updateInterview(id: string, updates: Partial<Interview>): Promise<Interview | undefined> {
    const interview = this.interviews.get(id);
    if (!interview) return undefined;
    const updated = { ...interview, ...updates };
    this.interviews.set(id, updated);
    return updated;
  }

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return Array.from(this.emailTemplates.values());
  }

  async getEmailTemplate(id: string): Promise<EmailTemplate | undefined> {
    return this.emailTemplates.get(id);
  }

  async createEmailTemplate(insertTemplate: InsertEmailTemplate): Promise<EmailTemplate> {
    const id = randomUUID();
    const template: EmailTemplate = { ...insertTemplate, id };
    this.emailTemplates.set(id, template);
    return template;
  }
}

export const storage = new MemStorage();
