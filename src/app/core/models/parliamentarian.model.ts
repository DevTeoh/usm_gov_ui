export interface SocialLink {
  readonly label: string;
  readonly url: string;
}

export interface ParliamentarianSummary {
  readonly id: string;
  readonly name: string;
  readonly party?: string;
  readonly constituencyId?: string;
  readonly photoUrl?: string;
}

export interface ParliamentarianDetail extends ParliamentarianSummary {
  readonly term?: string;
  readonly history?: readonly string[];
  readonly achievements?: readonly string[];
  readonly email?: string;
  readonly socialLinks?: readonly SocialLink[];
}

export interface VoteRecord {
  readonly id?: string;
  readonly bill?: string;
  readonly title?: string;
  readonly vote: 'YES' | 'NO' | 'ABSTAIN' | 'ABSENT' | string;
  readonly date?: string;
}

