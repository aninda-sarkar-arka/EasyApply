import Dexie, { type EntityTable } from 'dexie';

export type ApplicationStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';

export interface ActivityLogEntry {
  action: string;
  timestamp: string; // ISO string
}

export interface InterviewNote {
  id: string; // UUID generated client-side
  question: string;
  answer: string;
  feedback: string;
  date: string; // ISO string
}

export interface AiFeedback {
  resumeReview?: string;
  jobMatch?: string;
  coverLetter?: string;
  interviewQuestions?: string[];
}

export interface Application {
  id?: number; // Dexie auto-increment primary key
  linkedInJobId?: string; // from LinkedIn URL; used for dedup
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedDate: string; // ISO string
  deadline?: string;
  interviewDate?: string;
  jobLink?: string;
  jobDescription?: string;
  salary?: string;
  notes?: string;
  resumeId?: number; // FK to resumes table
  activityLog: ActivityLogEntry[];
  interviewNotes: InterviewNote[];
  aiFeedback?: AiFeedback;
}

export interface Resume {
  id?: number;
  filename: string;
  originalName: string;
  textContent?: string; // extracted by pdf.js
  uploadDate: string; // ISO string
}

export interface Setting {
  key: string; // primary key
  value: string;
}

class EasyApplyDatabase extends Dexie {
  applications!: EntityTable<Application, 'id'>;
  resumes!: EntityTable<Resume, 'id'>;
  settings!: EntityTable<Setting, 'key'>;

  constructor() {
    super('EasyApplyDB');
    this.version(1).stores({
      applications: '++id, linkedInJobId, status, appliedDate, company',
      resumes: '++id, uploadDate',
      settings: 'key',
    });
  }
}

export const db = new EasyApplyDatabase();
