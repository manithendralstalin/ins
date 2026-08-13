export type Category = "Health" | "Life" | "Motor" | "Travel" | "Home";

export interface Customer {
  customerId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface Policy {
  policyId: string;
  customerId: string;
  policyName: string;
  category: Category | string;
  coverage: number;
  premium: number;
  duration: string;
  status: "Active" | "Pending" | "Lapsed" | "Expired" | string;
  startDate: string;
  endDate: string;
  nominee: string;
  createdAt: string;
}

export interface Claim {
  claimId: string;
  policyId: string;
  customerName: string;
  claimType: string;
  incidentDate: string;
  description: string;
  amount: number;
  status: "Submitted" | "Under Review" | "Approved" | "Rejected" | string;
  submittedDate: string;
  documentName: string;
}

export interface Payment {
  paymentId: string;
  policyId: string;
  amount: number;
  date: string;
  status: "Success" | "Failed" | "Pending" | string;
  last4: string;
  method: string;
  reference: string;
}

export interface Agent {
  agentId: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  rating: number;
}

export interface DocumentRecord {
  documentId: string;
  policyId: string;
  name: string;
  type: string;
  uploadedDate: string;
}

/** Static product catalog (Insurance Plans) */
export interface Plan {
  id: string;
  name: string;
  category: Category;
  tagline: string;
  coverage: number;
  premium: number; // monthly premium (base)
  duration: string;
  popular?: boolean;
  benefits: string[];
  features: { label: string; value: string }[];
  eligibility: string[];
  documentsRequired: string[];
  terms: string[];
  brochureUrl?: string;
}
