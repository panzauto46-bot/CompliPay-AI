import { ComplianceChecks, ComplianceDecision, ComplianceResult } from '../types';

export interface ComplianceInput {
  amount: number;
  recipient: string;
  recipientKycVerified: boolean;
  travelRuleReady: boolean;
}

function toScore(checks: ComplianceChecks): number {
  const values = Object.values(checks).map((status) => {
    if (status === 'pass') return 25;
    if (status === 'review') return 15;
    return 0;
  });
  return values.reduce<number>((total, current) => total + current, 0);
}

function resolveDecision(checks: ComplianceChecks): ComplianceDecision {
  const statuses = Object.values(checks);
  if (statuses.includes('fail')) return 'block';
  if (statuses.includes('review')) return 'review';
  return 'allow';
}

export function evaluateCompliance(input: ComplianceInput): ComplianceResult {
  const recipient = input.recipient.toLowerCase();
  const checks: ComplianceChecks = {
    kyc: input.recipientKycVerified ? 'pass' : 'fail',
    kyt: input.amount > 500_000 ? 'review' : 'pass',
    aml: recipient.includes('sanction') || recipient.includes('blocked') ? 'fail' : 'pass',
    travelRule: input.amount > 250_000 && !input.travelRuleReady ? 'review' : 'pass',
  };

  const reasons: string[] = [];
  if (checks.kyc === 'fail') reasons.push('Recipient KYC is not verified.');
  if (checks.kyt === 'review') reasons.push('Transaction amount crossed enhanced due diligence threshold.');
  if (checks.aml === 'fail') reasons.push('Recipient matched an AML/sanctions risk indicator.');
  if (checks.travelRule === 'review') reasons.push('Travel Rule metadata is incomplete for this transfer size.');
  if (reasons.length === 0) reasons.push('All mandatory compliance checks passed.');

  return {
    decision: resolveDecision(checks),
    score: toScore(checks),
    checks,
    reasons,
    evaluatedAt: new Date(),
  };
}

