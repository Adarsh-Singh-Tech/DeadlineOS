/**
 * Shared Type Definitions for DeadlineOS
 */

export enum PlanTier {
  STARTER = "starter",
  GROWTH = "growth",
  BUSINESS = "business",
}

export type BusinessType = "Pvt Ltd" | "LLP" | "Sole Prop" | "Partnership" | "OPC";

export type ObligationCategory = "GST" | "TDS" | "Income Tax" | "ROC" | "PF & ESIC" | "Corporate";

export type FrequencyType = "monthly" | "quarterly" | "annual";

export type DeadlineStatus = "upcoming" | "due_soon" | "filed" | "overdue";

export interface Workspace {
  id: string;
  name: string;
  owner_user_id: string;
  plan_tier: PlanTier;
  created_at: string;
}

export interface Entity {
  id: string;
  workspace_id: string;
  name: string;
  gstin?: string;
  pan?: string;
  tan?: string;
  business_type: BusinessType;
  state_code: string;
  is_active: boolean;
  created_at: string;
}

export interface ObligationType {
  id: string;
  name: string;
  category: ObligationCategory;
  frequency: FrequencyType;
  governing_body: string;
  applicable_entity_types: BusinessType[];
  typical_due_offset_days: number;
}

export interface EntityObligation {
  id: string;
  entity_id: string;
  obligation_type_id: string;
  is_active: boolean;
  custom_due_offset: number;
  created_at: string;
}

export interface Deadline {
  id: string;
  entity_obligation_id: string;
  due_date: string; // ISO Date YYYY-MM-DD
  period_label: string; // e.g. "April 2026", "Q1 FY2026"
  status: DeadlineStatus;
  readiness_score: number; // 0 to 100
  created_at: string;
  
  // Enriched fields for easy UI binding:
  entity_name?: string;
  obligation_name?: string;
  category?: ObligationCategory;
  governing_body?: string;
  days_until?: number;
  filing_record?: FilingRecord;
}

export interface FilingRecord {
  id: string;
  deadline_id: string;
  filed_at: string;
  filed_by: string;
  ack_number: string;
  notes?: string;
}

export interface Document {
  id: string;
  entity_id: string;
  deadline_id?: string;
  filename: string;
  s3_key: string;
  document_type: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface Notification {
  id: string;
  workspace_id: string;
  deadline_id?: string;
  channel: "email" | "whatsapp" | "in_app";
  status: "pending" | "sent" | "failed";
  sent_at: string;
  message_content: string;
}

export interface AuditLog {
  id: string;
  workspace_id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  payload?: any;
  created_at: string;
}

export interface AdvisorRelationship {
  id: string;
  advisor_user_id: string;
  client_workspace_id: string;
  access_level: "read" | "annotate";
  status: "pending" | "active" | "rejected";
  invited_at: string;
  accepted_at?: string;
  
  // Enriched fields:
  client_workspace_name?: string;
  owner_email?: string;
}

export interface DashboardSummary {
  overdueCount: number;
  dueThisWeek: number;
  dueThisMonth: number;
  complianceScore: number;
}
