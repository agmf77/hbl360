export type UserRole = 'admin' | 'accounts' | 'employee';

export interface Employee {
  id: string;
  payId: string; // 4-digit or standard Pay ID e.g. "0101"
  nameBn: string; // বাংলা নাম
  nameEn: string; // English Name
  designation: string; // পদবী
  department: string; // শাখা/বিভাগ
  presentPbs: string; // বর্তমান পবিস
  phone: string;
  email: string;
  role: UserRole;
  password?: string;
  isActive: boolean;
  createdAt: string;
  isDeleted?: boolean;
}

export type LoanSource = 'own' | 'other';
export type LoanStatus = 'active' | 'suspended' | 'closed';

export interface Loan {
  id: string;
  employeeId: string;
  payId: string;
  employeeNameBn: string;
  employeeDesignation: string;
  loanNo: string; // e.g. HL-2019-0101
  loanSource: LoanSource; // 'own' (নিজস্ব পবিস) or 'other' (অন্যান্য পবিস)
  lendingPbs: string; // e.g. "ঢাকা পবিস-১" if other, or current PBS
  allocationNo: string; // "১ম বরাদ্দ", "২য় বরাদ্দ/সম্প্রসারণ"
  disbursementAmount: number;
  disbursementDate: string; // YYYY-MM-DD
  interestRatePre2020: number; // default 8%
  interestRatePost2020: number; // default 7%
  monthlyInstallment: number;
  principalBalance: number;
  interestBalance: number;
  advanceBalance: number;
  asOfDate: string; // YYYY-MM-DD
  status: LoanStatus;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Repayment {
  id: string;
  loanId: string;
  employeeId: string;
  payId: string;
  employeeNameBn: string;
  repaymentMonth: string; // YYYY-MM
  repaymentDate: string; // YYYY-MM-DD
  voucherNo: string;
  totalAmount: number;
  principalPaid: number;
  interestPaid: number;
  advancePaid: number;
  sourceType: 'payroll' | 'inter_pbs' | 'manual';
  notes: string;
  createdBy: string;
  createdAt: string;
  isDeleted?: boolean;
}

export interface Provision {
  id: string;
  loanId: string;
  loanNo: string;
  employeeId: string;
  payId: string;
  employeeNameBn: string;
  provisionMonth: string; // YYYY-MM
  principalAmount: number;
  interestRate: number; // 8 or 7
  monthlyInterestAmount: number;
  status: 'posted' | 'draft';
  createdAt: string;
  isDeleted?: boolean;
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
  isDeleted?: boolean;
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

export type RealTimeEventType =
  | 'repayment:created'
  | 'repayment:batch_created'
  | 'provision:run'
  | 'loan:created'
  | 'loan:updated'
  | 'loan:status_changed'
  | 'remittance:created'
  | 'recycle:restored'
  | 'simulation:event'
  | 'system:stats_updated'
  | 'user:presence_updated';

export interface RealTimeMessage {
  type: RealTimeEventType;
  payload: any;
  timestamp: string;
  sourceUser?: string;
}
