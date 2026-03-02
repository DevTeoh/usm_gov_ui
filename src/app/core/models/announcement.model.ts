export interface AnnouncementSummary {
  readonly id: string;
  readonly title: string;
  readonly summary?: string;
  readonly createdAt?: string;
}

export interface AnnouncementDetail extends AnnouncementSummary {
  readonly content?: string;
}

