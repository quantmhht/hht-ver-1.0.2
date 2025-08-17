// KHAI BÁO VÀ EXPORT 2 KIỂU DỮ LIỆU BỊ THIẾU
export type ReportStatus = 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected' | 'overdue';
export type ReportPriority = 'low' | 'medium' | 'high';

export enum QuestionType {
  SHORT_ANSWER = 'short_answer',
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
}

export interface QuestionOption {
  id: string;
  value: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  isRequired: boolean;
  options?: QuestionOption[];
}

export interface Answer {
  questionId: string;
  value: string | string[]; 
}

export interface ReportHistory {
  action: 'created' | 'submitted' | 'approved' | 'rejected' | 'in_progress';
  actor: {
    zaloId: string;
    name: string;
  };
  timestamp: number;
  notes?: string;
}

export interface Report {
  id: string;
  title: string;
  questions: Question[];
  
  assignedTo: {
    tdpId: string;
    zaloId: string;
    tdpName: string;
  };
  assignedBy: {
    zaloId: string;
    name: string;
  };
  // SỬ DỤNG 2 KIỂU DỮ LIỆU MỚI
  status: ReportStatus;
  priority: ReportPriority;

  dueDate: number;
  
  submittedAnswers?: Answer[];
  submittedAt?: number;
  
  history: ReportHistory[];
}

export interface TDPInfo {
  id: string;
  name: string;
  leaderZaloId: string;
  leaderName: string;
  leaderPhone: string;
  address: string;
  description?: string;
  householdCount: number;
  populationCount: number;
  active: boolean;
  createdAt?: Date;
}