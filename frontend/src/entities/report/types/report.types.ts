export interface Report {
  id: string;
  name: string;
  type: string;
  generatedAt: string;
  url?: string;
  size?: number;
}

export interface ReportGeneration {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  progress?: number;
  createdAt: string;
  completedAt?: string;
}