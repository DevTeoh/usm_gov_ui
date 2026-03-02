export interface DashboardComplaintSummary {
  readonly total: number;
  readonly pending: number;
  readonly inProgress: number;
  readonly resolved: number;
}

export interface DashboardProjectSummary {
  readonly total: number;
  readonly active: number;
  readonly completed: number;
}

export interface DashboardAnnouncementSummary {
  readonly totalRecent: number;
}

export interface DashboardParliamentarianSummary {
  readonly total: number;
}

/**
 * Minimal shape FE uses for the dashboard.
 * Backend can return more fields; FE should ignore extras.
 */
export interface DashboardResponse {
  readonly constituencyId?: string;
  readonly complaints?: Partial<DashboardComplaintSummary>;
  readonly projects?: Partial<DashboardProjectSummary>;
  readonly announcements?: Partial<DashboardAnnouncementSummary>;
  readonly parliamentarians?: Partial<DashboardParliamentarianSummary>;
}

