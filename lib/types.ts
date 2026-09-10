/**
 * Domain types matching the SentinelScan API (`sentinelscan-api`) contracts.
 *
 * Source of truth:
 * - TargetRepository / PublicTarget (`modules/targets`)
 * - ScanRepository / PublicScan (`modules/scans`)
 * - FindingRepository / PublicFinding (`modules/findings`)
 * - AnalysisRepository / PublicSecurityAnalysis (`modules/analysis`)
 */

// --- Targets ---------------------------------------------------------------

export type TargetStatus = "active" | "inactive";

export interface Target {
  id: string;
  name: string;
  url: string;
  description: string | null;
  status: TargetStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTargetInput {
  name: string;
  url: string;
  description?: string;
}

export interface UpdateTargetInput {
  name?: string;
  url?: string;
  description?: string | null;
  status?: TargetStatus;
}

// --- Scans -----------------------------------------------------------------

export type ScanStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export interface Scan {
  id: string;
  targetId: string;
  status: ScanStatus;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListScansQuery {
  status?: ScanStatus;
  targetId?: string;
  limit?: number;
  offset?: number;
}

export interface ListScansResponse {
  scans: Scan[];
  limit: number;
  offset: number;
  hasMore: boolean;
}

// --- Findings --------------------------------------------------------------

export type FindingSeverity = "critical" | "high" | "medium" | "low" | "informational";
export type FindingConfidence = "high" | "medium" | "low" | "unknown";

export const FINDING_CATEGORIES = [
  "injection",
  "authentication",
  "authorization",
  "cryptography",
  "security-misconfiguration",
  "sensitive-data-exposure",
  "security-header",
  "client-side",
  "server-side",
  "information-disclosure",
  "other",
] as const;

export type FindingCategory = (typeof FINDING_CATEGORIES)[number];

export interface FindingInstance {
  id: string;
  url: string;
  method: string | null;
  parameter: string | null;
  attack: string | null;
  evidence: string | null;
  createdAt: string;
}

export interface Finding {
  id: string;
  scanId: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  confidence: FindingConfidence;
  category: string;
  cweId: number | null;
  wascId: number | null;
  remediation: string | null;
  references: string[];
  source: string;
  sourceRuleId: string | null;
  createdAt: string;
  updatedAt: string;
  instances: FindingInstance[];
}

export interface FindingCounts {
  critical: number;
  high: number;
  medium: number;
  low: number;
  informational: number;
  total: number;
}

export interface ListFindingsQuery {
  severity?: FindingSeverity;
  confidence?: FindingConfidence;
  category?: string;
  source?: string;
  limit?: number;
  offset?: number;
}

export interface ListFindingsResponse {
  findings: Finding[];
  counts: FindingCounts;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// --- AI Security Analysis --------------------------------------------------

export type AnalysisStatus = "queued" | "running" | "completed" | "failed";
export type OverallRisk = "critical" | "high" | "medium" | "low" | "informational";
export type AssessmentPriority = "critical" | "high" | "medium" | "low" | "informational";
export type AnalysisConfidence = "high" | "medium" | "low" | "unknown";
export type FalsePositiveLikelihood = "low" | "medium" | "high" | "unknown";

export const CORRELATION_RELATIONSHIPS = [
  "related",
  "duplicate-symptom",
  "attack-chain",
  "shared-root-cause",
  "amplifies-risk",
] as const;

export type CorrelationRelationship = (typeof CORRELATION_RELATIONSHIPS)[number];

export interface FindingAssessment {
  id: string;
  findingId: string;
  priority: AssessmentPriority;
  riskAssessment: string;
  confidence: AnalysisConfidence;
  reasoning: string;
  businessImpact: string | null;
  technicalImpact: string | null;
  remediationPriority: AssessmentPriority;
  falsePositiveLikelihood: FalsePositiveLikelihood;
  createdAt: string;
  updatedAt: string;
}

export interface FindingCorrelation {
  id: string;
  findingAId: string;
  findingBId: string;
  relationship: CorrelationRelationship | string;
  confidence: AnalysisConfidence;
  explanation: string;
  createdAt: string;
}

export interface SecurityAnalysis {
  id: string;
  scanId: string;
  status: AnalysisStatus;
  model: string | null;
  promptVersion: string;
  overallRisk: OverallRisk | null;
  executiveSummary: string | null;
  methodologySummary: string | null;
  limitations: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  errorMessage: string | null;
  assessments: FindingAssessment[];
  correlations: FindingCorrelation[];
}
