export type ProjectStatus =
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'ON_HOLD'
  | 'CANCELLED'
  | 'UNKNOWN';

export interface ProjectMilestone {
  readonly id?: string;
  readonly name: string;
  readonly date?: string;
  readonly status?: string;
}

export interface ProjectUpdate {
  readonly id?: string;
  readonly date?: string;
  readonly text: string;
  readonly mediaUrls?: readonly string[];
}

export interface ContractorInfo {
  readonly name: string;
  readonly contactEmail?: string;
  readonly contactPhone?: string;
}

export interface ProjectSummary {
  readonly id: string;
  readonly name: string;
  readonly status?: ProjectStatus | string;
  readonly progressPercent?: number;
  readonly constituencyId?: string;
}

export interface ProjectDetail extends ProjectSummary {
  readonly description?: string;
  readonly constructionStartedAt?: string;
  readonly estimatedCompletionAt?: string;
  readonly budgetAllocated?: number;
  readonly budgetCurrency?: string;
  readonly fundingSource?: string;
  readonly contractor?: ContractorInfo;
  readonly milestones?: readonly ProjectMilestone[];
  readonly updates?: readonly ProjectUpdate[];
}

