export interface ApplicationHistoryItem {
  id: string;
  jobTitle: string;
  companyName: string;
  appliedDate: string; // ISO string
  status: "Applied" | "Under Review" | "Accepted" | "Rejected" | "Withdrawn";
}

export interface ApplicationHistoryResponse {
  items: ApplicationHistoryItem[];
  page: number;
  size: number;
  totalPages: number;
  totalItems: number;
}
