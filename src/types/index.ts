export interface User {
  id: string;
  name: string;
  email: string;
  institution: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  role: 'admin' | 'operator' | 'viewer';
}

export type ComplianceDecision = 'allow' | 'review' | 'block';
export type ComplianceCheckStatus = 'pass' | 'review' | 'fail';

export interface ComplianceChecks {
  kyc: ComplianceCheckStatus;
  kyt: ComplianceCheckStatus;
  aml: ComplianceCheckStatus;
  travelRule: ComplianceCheckStatus;
}

export interface ComplianceResult {
  decision: ComplianceDecision;
  score: number;
  checks: ComplianceChecks;
  reasons: string[];
  evaluatedAt: Date;
}

export interface Transaction {
  id: string;
  type: 'payment' | 'escrow' | 'subscription' | 'treasury';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'processing';
  sender: string;
  receiver: string;
  timestamp: Date;
  txHash: string;
  complianceStatus: 'passed' | 'flagged' | 'review';
  explorerUrl?: string;
  network?: string;
  simulated?: boolean;
}

export interface ProgrammablePayment {
  id: string;
  name: string;
  type: 'escrow' | 'milestone' | 'subscription' | 'automated';
  amount: number;
  currency: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  conditions: string[];
  createdAt: Date;
  nextExecution?: Date;
  recipient: string;
  recipientKycVerified?: boolean;
  travelRuleReady?: boolean;
  complianceResult?: ComplianceResult;
  lastTxHash?: string;
  updatedAt?: Date;
}

export interface ComplianceAlert {
  id: string;
  type: 'kyc' | 'kyt' | 'aml' | 'travel_rule';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  status: 'open' | 'resolved' | 'investigating';
  transactionId?: string;
  paymentId?: string;
}

export interface AIAgentTask {
  id: string;
  type: 'payment_execution' | 'treasury_optimization' | 'fx_conversion' | 'risk_monitoring';
  status: 'running' | 'completed' | 'paused' | 'scheduled';
  description: string;
  lastRun?: Date;
  nextRun?: Date;
  savings?: number;
}

export interface WalletInfo {
  address: string;
  balance: number;
  currency: string;
  provider: 'fireblocks' | 'internal';
  status: 'connected' | 'disconnected';
}

export interface AuditEvent {
  id: string;
  category: 'payment' | 'compliance' | 'execution' | 'ai';
  action: string;
  message: string;
  timestamp: Date;
  paymentId?: string;
  transactionId?: string;
}
