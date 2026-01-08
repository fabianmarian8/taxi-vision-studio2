export interface TaxiService {
  name: string;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
}

export type SuggestionStatus = 'pending' | 'approved' | 'rejected';

export interface Suggestion {
  id: string;
  citySlug: string;
  taxiService: TaxiService;
  status: SuggestionStatus;
  timestamp: string;
  approvedAt?: string;
  rejectedAt?: string;
}

export interface SuggestionsData {
  lastUpdated: string;
  suggestions: Suggestion[];
}

export interface GBPScraperResult {
  name: string;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
}

export interface GBPScraperResponse {
  success: boolean;
  city: string;
  count: number;
  results: GBPScraperResult[];
}
