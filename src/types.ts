export type UserRole = 'admin' | 'accounts' | 'employee';

export interface UserSession {
  id: string;
  payId: string;
  nameBn: string;
  nameEn: string;
  role: UserRole;
  designation: string;
  department: string;
  presentPbs?: string;
}

export type LoanSource = 'own' | 'other';
export type LoanStatus = 'active' | 'suspended' | 'closed';

export interface Employee {
  id: string;
  payId: string;
  nameBn: string;
  nameEn: string;
  designation: string;
  department: string;
  presentPbs: string;
  phone: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Loan {
  id: string;
  employeeId: string;
  payId: string;
  employeeNameBn: string;
  employeeDesignation: string;
  loanNo: string;
  loanSource: LoanSource;
  lendingPbs: string;
  allocationNo: string;
  disbursementAmount: number;
  disbursementDate: string;
  interestRatePre2020: number;
  interestRatePost2020: number;
  monthlyInstallment: number;
  principalBalance: number;
  interestBalance: number;
  advanceBalance: number;
  asOfDate: string;
  status: LoanStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Repayment {
  id: string;
  loanId: string;
  employeeId: string;
  payId: string;
  employeeNameBn: string;
  repaymentMonth: string;
  repaymentDate: string;
  voucherNo: string;
  totalAmount: number;
  principalPaid: number;
  interestPaid: number;
  advancePaid: number;
  sourceType: 'payroll' | 'inter_pbs' | 'manual';
  notes: string;
  createdBy: string;
  createdAt: string;
}

export interface Provision {
  id: string;
  loanId: string;
  loanNo: string;
  employeeId: string;
  payId: string;
  employeeNameBn: string;
  provisionMonth: string;
  principalAmount: number;
  interestRate: number;
  monthlyInterestAmount: number;
  status: 'posted' | 'draft';
  createdAt: string;
}

export interface BankAdviceItem {
  loanId: string;
  employeeId: string;
  payId: string;
  employeeNameBn: string;
  installmentMonth: string;
  amount: number;
}

export interface BankAdvice {
  id: string;
  adviceNo: string;
  memoNo: string;
  adviceDate: string;
  fromPbs: string;
  toPbs: string;
  bankName: string;
  accountNo: string;
  routingNo: string;
  totalAmount: number;
  amountInWordsBn: string;
  status: 'draft' | 'dispatched' | 'acknowledged';
  items: BankAdviceItem[];
  agmFinanceName: string;
  dgmName: string;
  gmName: string;
  notes: string;
  createdAt: string;
}

export interface DemandNotice {
  id: string;
  noticeNo: string;
  memoNo: string;
  noticeDate: string;
  targetPbs: string;
  overdueMonths: string[];
  totalOverdueAmount: number;
  employees: {
    payId: string;
    nameBn: string;
    designation: string;
    loanNo: string;
    monthlyInstallment: number;
    dueMonthsCount: number;
    totalDue: number;
  }[];
  notes: string;
  createdAt: string;
}

export interface RecycleItem {
  id: string;
  entityType: 'loan' | 'employee' | 'repayment' | 'bank_advice';
  entityId: string;
  title: string;
  details: string;
  deletedAt: string;
  deletedBy: string;
  data: any;
}

export interface AuditLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'PROVISION' | 'REPAYMENT' | 'BANK_ADVICE' | 'SIMULATION';
  entityType: string;
  entityId: string;
  summary: string;
  user: string;
  ip: string;
  timestamp: string;
}

export interface PbsSettings {
  pbsCode: string;
  pbsNameBn: string;
  pbsNameEn: string;
  boardNameBn: string;
  boardNameEn: string;
  memoPrefix: string;
  addressBn: string;
  addressEn: string;
  phone: string;
  email: string;
  website: string;
  bankNameBn: string;
  accountNo: string;
  routingNo: string;
  agmFinanceName: string;
  dgmName: string;
  gmName: string;
  logoUrl?: string;
  customPassword?: string;
  taglineBn?: string;
  letterheadTheme?: string;
}

export interface DashboardStats {
  currentMonth: string;
  totalEmployees: number;
  totalLoans: number;
  ownLoansCount: number;
  otherLoansCount: number;
  totalDisbursed: number;
  totalPrincipalBalance: number;
  totalInterestBalance: number;
  totalAdvanceBalance: number;
  totalOutstanding: number;
  totalPrincipalCollected: number;
  totalInterestCollected: number;
  totalCollected: number;
  recoveryRatePercent: number;
  monthlyPayrollDue: number;
  currentMonthDeducted: number;
  currentMonthDeductionCount: number;
  isPayrollComplete: boolean;
  isProvisionComplete: boolean;
  currentMonthProvisionCount: number;
  currentMonthProvisionInterest: number;
  pendingRemittanceAmount: number;
  pendingRemittanceCount: number;
  bankAdvicesCount: number;
  recycleBinCount: number;
  lastUpdated: string;
}

export interface LiveEventItem {
  id: string;
  type: string;
  title: string;
  details: string;
  timestamp: string;
  sourceUser?: string;
}
