import fs from 'fs';
import path from 'path';
import {
  Employee,
  Loan,
  Repayment,
  Provision,
  BankAdvice,
  DemandNotice,
  RecycleItem,
  AuditLog,
  PbsSettings,
  RealTimeMessage,
  RealTimeEventType
} from './types';
import { amountToWordsBn } from './numberToWordsBn';
import { ALL_80_PBS, PbsInfo } from './allPbsData';

export type BroadcastFn = (event: RealTimeEventType, payload: any, sourceUser?: string) => void;

interface DatabaseSchema {
  employees: Employee[];
  loans: Loan[];
  repayments: Repayment[];
  provisions: Provision[];
  bankAdvices: BankAdvice[];
  demandNotices: DemandNotice[];
  recycleBin: RecycleItem[];
  auditLogs: AuditLog[];
  settings: PbsSettings;
  pbsSettingsMap?: { [pbsCode: string]: PbsSettings };
  activePbsCode?: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Default initial settings: Gazipur Palli Bidyut Samity-2 (গাজীপুর পল্লী বিদ্যুৎ সমিতি-২)
const defaultSettings: PbsSettings = {
  pbsCode: 'gazipur-2',
  pbsNameBn: 'গাজীপুর পল্লী বিদ্যুৎ সমিতি-২',
  pbsNameEn: 'Gazipur Palli Bidyut Samity-2',
  boardNameBn: 'বাংলাদেশ পল্লী বিদ্যুতায়ন বোর্ড',
  boardNameEn: 'Bangladesh Rural Electrification Board',
  memoPrefix: '২৭.১২.৩৩০০.৫৪২.০১.০২৪',
  addressBn: 'রাজেন্দ্রপুর, গাজীপুর',
  addressEn: 'Rajendrapur, Gazipur',
  phone: '০২-৯২৬৩২২২',
  email: 'gazipurpbs2@gmail.com',
  website: 'pbs2.gazipur.gov.bd',
  bankNameBn: 'জনতা ব্যাংক পিএলসি, রাজেন্দ্রপুর শাখা',
  accountNo: '৩৩০২-০৫১২০৩-৭',
  routingNo: '১৩৫২৬০৮৮৯',
  agmFinanceName: 'নাজমুন নাহার',
  dgmName: 'প্রকৌশলী মো: রফিকুল ইসলাম',
  gmName: 'প্রকৌশলী এ. কে. এম. সামসুল আলম',
  logoUrl: '',
  customPassword: 'pbs123',
  taglineBn: 'আলোর ফেরিওয়ালা — ঘরে ঘরে বিদ্যুৎ',
  letterheadTheme: 'standard'
};

// Seed authentic employees
const defaultEmployees: Employee[] = [
  {
    id: 'emp-01',
    payId: '0101',
    nameBn: 'রফিকুল ইসলাম',
    nameEn: 'Md. Rafiqul Islam',
    designation: 'ডিজিএম (কারিগরি)',
    department: 'কারিগরি শাখা',
    presentPbs: 'নরসিংদী পল্লী বিদ্যুৎ সমিতি-১',
    phone: '০১৭০১-১০০১০১',
    email: 'rafiqul.pbs@breb.gov.bd',
    role: 'employee',
    password: 'password123',
    isActive: true,
    createdAt: '2019-01-10T09:00:00.000Z'
  },
  {
    id: 'emp-02',
    payId: '0102',
    nameBn: 'নাজমুন নাহার',
    nameEn: 'Nazmun Nahar',
    designation: 'এজিএম (অর্থ-হিসাব)',
    department: 'অর্থ ও হিসাব শাখা',
    presentPbs: 'নরসিংদী পল্লী বিদ্যুৎ সমিতি-১',
    phone: '০১৭০১-১০০১০২',
    email: 'nazmun.fin@breb.gov.bd',
    role: 'accounts',
    password: 'password123',
    isActive: true,
    createdAt: '2020-02-15T09:00:00.000Z'
  },
  {
    id: 'emp-03',
    payId: '0103',
    nameBn: 'জহিরুল হক',
    nameEn: 'Md. Jahirul Haque',
    designation: 'সহকারী প্রকৌশলী',
    department: 'প্রকৌশল ও নির্মাণ',
    presentPbs: 'নরসিংদী পল্লী বিদ্যুৎ সমিতি-১',
    phone: '০১৭০১-১০০১০৩',
    email: 'jahirul.pbs@breb.gov.bd',
    role: 'employee',
    password: 'password123',
    isActive: true,
    createdAt: '2021-07-01T09:00:00.000Z'
  },
  {
    id: 'emp-04',
    payId: '0112',
    nameBn: 'আরিফুল ইসলাম',
    nameEn: 'Ariful Islam',
    designation: 'জুনিয়র ইঞ্জিনিয়ার (আইটি)',
    department: 'আইটি শাখা',
    presentPbs: 'নরসিংদী পল্লী বিদ্যুৎ সমিতি-১',
    phone: '০১৭০১-১০০১১২',
    email: 'ariful.it@breb.gov.bd',
    role: 'employee',
    password: 'password123',
    isActive: true,
    createdAt: '2023-05-10T09:00:00.000Z'
  },
  {
    id: 'emp-admin',
    payId: 'admin',
    nameBn: 'সিস্টেম অ্যাডমিনিস্ট্রেটর',
    nameEn: 'System Administrator',
    designation: 'সিস্টেম অ্যাডমিন',
    department: 'আইটি সেল',
    presentPbs: 'নরসিংদী পল্লী বিদ্যুৎ সমিতি-১',
    phone: '০১৭০১-০০০০০০',
    email: 'admin@pbs1.gov.bd',
    role: 'admin',
    password: 'admin123',
    isActive: true,
    createdAt: '2019-01-01T00:00:00.000Z'
  },
  {
    id: 'emp-accounts',
    payId: 'accounts',
    nameBn: 'হিসাব শাখা (অর্থ বিভাগ)',
    nameEn: 'Accounts & Finance Division',
    designation: 'হিসাব কর্মকর্তা',
    department: 'অর্থ ও হিসাব শাখা',
    presentPbs: 'নরসিংদী পল্লী বিদ্যুৎ সমিতি-১',
    phone: '০১৭০১-০০০০০১',
    email: 'accounts@pbs1.gov.bd',
    role: 'accounts',
    password: 'accounts123',
    isActive: true,
    createdAt: '2019-01-01T00:00:00.000Z'
  }
];

// Seed authentic loans with correct pre/post 2020 rules and principal-first state
const defaultLoans: Loan[] = [
  {
    id: 'loan-01',
    employeeId: 'emp-01',
    payId: '0101',
    employeeNameBn: 'রফিকুল ইসলাম',
    employeeDesignation: 'ডিজিএম (কারিগরি)',
    loanNo: 'HL-2019-0101',
    loanSource: 'own',
    lendingPbs: 'নরসিংদী পল্লী বিদ্যুৎ সমিতি-১',
    allocationNo: '১ম বরাদ্দ',
    disbursementAmount: 1500000,
    disbursementDate: '2019-05-15',
    interestRatePre2020: 8,
    interestRatePost2020: 7,
    monthlyInstallment: 15000,
    principalBalance: 690000,
    interestBalance: 245000,
    advanceBalance: 0,
    asOfDate: '2026-10-01',
    status: 'active',
    createdAt: '2019-05-15T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z'
  },
  {
    id: 'loan-02',
    employeeId: 'emp-01',
    payId: '0101',
    employeeNameBn: 'রফিকুল ইসলাম',
    employeeDesignation: 'ডিজিএম (কারিগরি)',
    loanNo: 'HL-2024-0101-B',
    loanSource: 'own',
    lendingPbs: 'নরসিংদী পল্লী বিদ্যুৎ সমিতি-১',
    allocationNo: '২য় বরাদ্দ (সম্প্রসারণ)',
    disbursementAmount: 600000,
    disbursementDate: '2024-01-20',
    interestRatePre2020: 8,
    interestRatePost2020: 7,
    monthlyInstallment: 8000,
    principalBalance: 472000,
    interestBalance: 32400,
    advanceBalance: 0,
    asOfDate: '2026-10-01',
    status: 'active',
    createdAt: '2024-01-20T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z'
  },
  {
    id: 'loan-03',
    employeeId: 'emp-02',
    payId: '0102',
    employeeNameBn: 'নাজমুন নাহার',
    employeeDesignation: 'এজিএম (অর্থ-হিসাব)',
    loanNo: 'HL-2022-0102',
    loanSource: 'own',
    lendingPbs: 'নরসিংদী পল্লী বিদ্যুৎ সমিতি-১',
    allocationNo: '১ম বরাদ্দ',
    disbursementAmount: 1800000,
    disbursementDate: '2022-03-10',
    interestRatePre2020: 8,
    interestRatePost2020: 7,
    monthlyInstallment: 18000,
    principalBalance: 1262000,
    interestBalance: 165200,
    advanceBalance: 0,
    asOfDate: '2026-10-01',
    status: 'active',
    createdAt: '2022-03-10T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z'
  },
  {
    id: 'loan-04',
    employeeId: 'emp-03',
    payId: '0103',
    employeeNameBn: 'জহিরুল হক',
    employeeDesignation: 'সহকারী প্রকৌশলী',
    loanNo: 'HL-2021-0103',
    loanSource: 'other',
    lendingPbs: 'ঢাকা পল্লী বিদ্যুৎ সমিতি-১',
    allocationNo: '১ম বরাদ্দ',
    disbursementAmount: 1200000,
    disbursementDate: '2021-08-12',
    interestRatePre2020: 8,
    interestRatePost2020: 7,
    monthlyInstallment: 14000,
    principalBalance: 666000,
    interestBalance: 0, // Transferred loans do NOT accrue interest in host PBS!
    advanceBalance: 0,
    asOfDate: '2026-10-01',
    status: 'active',
    createdAt: '2021-08-12T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z'
  },
  {
    id: 'loan-05',
    employeeId: 'emp-04',
    payId: '0112',
    employeeNameBn: 'আরিফুল ইসলাম',
    employeeDesignation: 'জুনিয়র ইঞ্জিনিয়ার (আইটি)',
    loanNo: 'HL-2023-0112',
    loanSource: 'own',
    lendingPbs: 'নরসিংদী পল্লী বিদ্যুৎ সমিতি-১',
    allocationNo: '১ম বরাদ্দ',
    disbursementAmount: 1400000,
    disbursementDate: '2023-06-20',
    interestRatePre2020: 8,
    interestRatePost2020: 7,
    monthlyInstallment: 14000,
    principalBalance: 1006000,
    interestBalance: 118500,
    advanceBalance: 0,
    asOfDate: '2026-10-01',
    status: 'active',
    createdAt: '2023-06-20T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z'
  }
];

// Seed recent repayments
const defaultRepayments: Repayment[] = [
  {
    id: 'rep-01',
    loanId: 'loan-01',
    employeeId: 'emp-01',
    payId: '0101',
    employeeNameBn: 'রফিকুল ইসলাম',
    repaymentMonth: '2026-09',
    repaymentDate: '2026-09-30',
    voucherNo: 'VR-2026-09-0101',
    totalAmount: 15000,
    principalPaid: 15000,
    interestPaid: 0,
    advancePaid: 0,
    sourceType: 'payroll',
    notes: 'সেপ্টেম্বর/২০২৬ মাসের বেতন হতে নিয়মিত কিস্তি কর্তন',
    createdBy: 'accounts',
    createdAt: '2026-09-30T11:00:00.000Z'
  },
  {
    id: 'rep-02',
    loanId: 'loan-02',
    employeeId: 'emp-01',
    payId: '0101',
    employeeNameBn: 'রফিকুল ইসলাম',
    repaymentMonth: '2026-09',
    repaymentDate: '2026-09-30',
    voucherNo: 'VR-2026-09-0101B',
    totalAmount: 8000,
    principalPaid: 8000,
    interestPaid: 0,
    advancePaid: 0,
    sourceType: 'payroll',
    notes: 'সেপ্টেম্বর/২০২৬ ২য় বরাদ্দ কিস্তি কর্তন',
    createdBy: 'accounts',
    createdAt: '2026-09-30T11:05:00.000Z'
  },
  {
    id: 'rep-03',
    loanId: 'loan-03',
    employeeId: 'emp-02',
    payId: '0102',
    employeeNameBn: 'নাজমুন নাহার',
    repaymentMonth: '2026-09',
    repaymentDate: '2026-09-30',
    voucherNo: 'VR-2026-09-0102',
    totalAmount: 18000,
    principalPaid: 18000,
    interestPaid: 0,
    advancePaid: 0,
    sourceType: 'payroll',
    notes: 'সেপ্টেম্বর/২০২৬ কিস্তি কর্তন',
    createdBy: 'accounts',
    createdAt: '2026-09-30T11:10:00.000Z'
  },
  {
    id: 'rep-04',
    loanId: 'loan-04',
    employeeId: 'emp-03',
    payId: '0103',
    employeeNameBn: 'জহিরুল হক',
    repaymentMonth: '2026-09',
    repaymentDate: '2026-09-30',
    voucherNo: 'VR-2026-09-0103',
    totalAmount: 14000,
    principalPaid: 14000,
    interestPaid: 0,
    advancePaid: 0,
    sourceType: 'inter_pbs',
    notes: 'ঢাকা পবিস-১ এ রেমিট্যান্সের জন্য সেপ্টেম্বর/২৬ কিস্তি কর্তন',
    createdBy: 'accounts',
    createdAt: '2026-09-30T11:15:00.000Z'
  },
  {
    id: 'rep-05',
    loanId: 'loan-05',
    employeeId: 'emp-04',
    payId: '0112',
    employeeNameBn: 'আরিফুল ইসলাম',
    repaymentMonth: '2026-09',
    repaymentDate: '2026-09-30',
    voucherNo: 'VR-2026-09-0112',
    totalAmount: 14000,
    principalPaid: 14000,
    interestPaid: 0,
    advancePaid: 0,
    sourceType: 'payroll',
    notes: 'সেপ্টেম্বর/২০২৬ কিস্তি কর্তন',
    createdBy: 'accounts',
    createdAt: '2026-09-30T11:20:00.000Z'
  }
];

// Seed recent interest provisions (Own PBS loans only!)
const defaultProvisions: Provision[] = [
  {
    id: 'prov-01',
    loanId: 'loan-01',
    loanNo: 'HL-2019-0101',
    employeeId: 'emp-01',
    payId: '0101',
    employeeNameBn: 'রফিকুল ইসলাম',
    provisionMonth: '2026-09',
    principalAmount: 705000,
    interestRate: 7, // 7% from Jan 2020 onwards
    monthlyInterestAmount: Math.round((705000 * 0.07) / 12),
    status: 'posted',
    createdAt: '2026-09-30T12:00:00.000Z'
  },
  {
    id: 'prov-02',
    loanId: 'loan-02',
    loanNo: 'HL-2024-0101-B',
    employeeId: 'emp-01',
    payId: '0101',
    employeeNameBn: 'রফিকুল ইসলাম',
    provisionMonth: '2026-09',
    principalAmount: 480000,
    interestRate: 7,
    monthlyInterestAmount: Math.round((480000 * 0.07) / 12),
    status: 'posted',
    createdAt: '2026-09-30T12:00:00.000Z'
  },
  {
    id: 'prov-03',
    loanId: 'loan-03',
    loanNo: 'HL-2022-0102',
    employeeId: 'emp-02',
    payId: '0102',
    employeeNameBn: 'নাজমুন নাহার',
    provisionMonth: '2026-09',
    principalAmount: 1280000,
    interestRate: 7,
    monthlyInterestAmount: Math.round((1280000 * 0.07) / 12),
    status: 'posted',
    createdAt: '2026-09-30T12:00:00.000Z'
  },
  {
    id: 'prov-04',
    loanId: 'loan-05',
    loanNo: 'HL-2023-0112',
    employeeId: 'emp-04',
    payId: '0112',
    employeeNameBn: 'আরিফুল ইসলাম',
    provisionMonth: '2026-09',
    principalAmount: 1020000,
    interestRate: 7,
    monthlyInterestAmount: Math.round((1020000 * 0.07) / 12),
    status: 'posted',
    createdAt: '2026-09-30T12:00:00.000Z'
  }
];

// Seed Bank Advice
const defaultBankAdvices: BankAdvice[] = [
  {
    id: 'adv-01',
    adviceNo: 'BA-2026-09-01',
    memoNo: '২৭.১২.৬৮০০.৫৪২.০১.০২৪.২৬.১০১',
    adviceDate: '2026-10-02',
    fromPbs: 'নরসিংদী পল্লী বিদ্যুৎ সমিতি-১',
    toPbs: 'ঢাকা পল্লী বিদ্যুৎ সমিতি-১',
    bankName: 'জনতা ব্যাংক পিএলসি, মাধবদী শাখা',
    accountNo: '২৪০০-১১৯২০২-৭',
    routingNo: '১৩৫২৬০৭৭৮',
    totalAmount: 14000,
    amountInWordsBn: 'চৌদ্দ হাজার টাকা মাত্র',
    status: 'dispatched',
    items: [
      {
        loanId: 'loan-04',
        employeeId: 'emp-03',
        payId: '0103',
        employeeNameBn: 'জহিরুল হক',
        installmentMonth: '2026-09',
        amount: 14000
      }
    ],
    agmFinanceName: 'নাজমুন নাহার',
    dgmName: 'রফিকুল ইসলাম',
    gmName: 'প্রকৌশলী এ. কে. এম. সামসুল আলম',
    notes: 'সহকারী প্রকৌশলী জনাব জহিরুল হক এর গৃহ ঋণ কিস্তি সেপ্টেম্বর/২০২৬ রেমিট্যান্স',
    createdAt: '2026-10-02T10:30:00.000Z'
  }
];

class DatabaseStore {
  private data: DatabaseSchema;
  private broadcaster: BroadcastFn | null = null;

  constructor() {
    this.data = this.loadData();
  }

  public setBroadcaster(fn: BroadcastFn) {
    this.broadcaster = fn;
  }

  private broadcast(event: RealTimeEventType, payload: any, sourceUser?: string) {
    if (this.broadcaster) {
      this.broadcaster(event, payload, sourceUser);
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure default is Gazipur Palli Bidyut Samity-2 if not explicitly set
        const activeCode = parsed.activePbsCode || parsed.settings?.pbsCode || 'gazipur-2';
        const currentPbs = ALL_80_PBS.find(p => p.code === activeCode) || ALL_80_PBS[0];
        
        const mergedSettings: PbsSettings = {
          ...defaultSettings,
          pbsCode: currentPbs.code,
          pbsNameBn: currentPbs.nameBn,
          pbsNameEn: currentPbs.nameEn,
          memoPrefix: currentPbs.memoPrefix,
          addressBn: currentPbs.headquartersBn,
          phone: currentPbs.phone,
          email: currentPbs.email,
          website: currentPbs.website,
          ...(parsed.settings || {})
        };

        return {
          employees: parsed.employees || defaultEmployees,
          loans: parsed.loans || defaultLoans,
          repayments: parsed.repayments || defaultRepayments,
          provisions: parsed.provisions || defaultProvisions,
          bankAdvices: parsed.bankAdvices || defaultBankAdvices,
          demandNotices: parsed.demandNotices || [],
          recycleBin: parsed.recycleBin || [],
          auditLogs: parsed.auditLogs || [],
          settings: mergedSettings,
          pbsSettingsMap: parsed.pbsSettingsMap || {},
          activePbsCode: activeCode
        };
      }
    } catch (err) {
      console.warn('[DB] Could not read existing db.json, initializing defaults:', err);
    }

    const initialData: DatabaseSchema = {
      employees: defaultEmployees,
      loans: defaultLoans,
      repayments: defaultRepayments,
      provisions: defaultProvisions,
      bankAdvices: defaultBankAdvices,
      demandNotices: [],
      recycleBin: [],
      auditLogs: [
        {
          id: 'log-init',
          action: 'CREATE',
          entityType: 'system',
          entityId: 'init',
          summary: 'গাজীপুর পল্লী বিদ্যুৎ সমিতি-২ গৃহ ঋণ ব্যবস্থাপনা সিস্টেম সফলভাবে প্রারম্ভিকীকরণ করা হয়েছে।',
          user: 'System',
          ip: '127.0.0.1',
          timestamp: new Date().toISOString()
        }
      ],
      settings: defaultSettings,
      pbsSettingsMap: {
        'gazipur-2': defaultSettings
      },
      activePbsCode: 'gazipur-2'
    };

    this.saveData(initialData);
    return initialData;
  }

  private saveData(state: DatabaseSchema = this.data) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to save database file:', err);
    }
  }

  public logAudit(action: AuditLog['action'], entityType: string, entityId: string, summary: string, user = 'accounts', ip = '127.0.0.1') {
    const log: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      action,
      entityType,
      entityId,
      summary,
      user,
      ip,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 300) {
      this.data.auditLogs.pop();
    }
    this.saveData();
    return log;
  }

  // --- 80 PBS Management & Directory ---
  public getAllPbsList() {
    const activeCode = this.data.settings.pbsCode || this.data.activePbsCode || 'gazipur-2';
    if (!this.data.pbsSettingsMap) {
      this.data.pbsSettingsMap = {};
    }

    return ALL_80_PBS.map(pbs => {
      const customConfig = this.data.pbsSettingsMap?.[pbs.code];
      return {
        ...pbs,
        isActive: pbs.code === activeCode,
        customLogoUrl: customConfig?.logoUrl || '',
        currentNameBn: customConfig?.pbsNameBn || pbs.nameBn,
        currentMemoPrefix: customConfig?.memoPrefix || pbs.memoPrefix,
        hasCustomPassword: !!customConfig?.customPassword
      };
    });
  }

  public switchPbs(pbsCode: string, user = 'admin'): PbsSettings {
    const target = ALL_80_PBS.find(p => p.code === pbsCode);
    if (!target) {
      throw new Error('নির্দিষ্ট পবিস কোড পাওয়া যায়নি।');
    }

    if (!this.data.pbsSettingsMap) {
      this.data.pbsSettingsMap = {};
    }

    // Save current active settings to map first
    if (this.data.settings.pbsCode) {
      this.data.pbsSettingsMap[this.data.settings.pbsCode] = { ...this.data.settings };
    }

    // Load or initialize target PBS settings
    const existingConfig = this.data.pbsSettingsMap[pbsCode];
    if (existingConfig) {
      this.data.settings = { ...existingConfig };
    } else {
      this.data.settings = {
        ...defaultSettings,
        pbsCode: target.code,
        pbsNameBn: target.nameBn,
        pbsNameEn: target.nameEn,
        memoPrefix: target.memoPrefix,
        addressBn: target.headquartersBn,
        addressEn: `${target.headquartersBn}, Bangladesh`,
        email: target.email,
        phone: target.phone,
        website: target.website,
        bankNameBn: `জনতা ব্যাংক পিএলসি, ${target.headquartersBn.split(',')[0]} শাখা`,
        accountNo: `৩৩০২-${Math.floor(Math.random() * 900000 + 100000)}-৭`,
        routingNo: '১৩৫২৬০৮৮৯',
        customPassword: target.defaultPassword,
        logoUrl: ''
      };
      this.data.pbsSettingsMap[pbsCode] = { ...this.data.settings };
    }

    this.data.activePbsCode = pbsCode;
    this.saveData();

    this.logAudit('UPDATE', 'pbs_switch', pbsCode, `সক্রিয় সমিতি পরিবর্তন করা হয়েছে: ${target.nameBn}`, user);
    this.broadcast('system:stats_updated', { type: 'pbs:switched', pbsCode, settings: this.data.settings }, user);

    return this.data.settings;
  }

  // --- Settings ---
  public getSettings(): PbsSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<PbsSettings>, user = 'admin'): PbsSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    if (!this.data.pbsSettingsMap) {
      this.data.pbsSettingsMap = {};
    }
    if (this.data.settings.pbsCode) {
      this.data.pbsSettingsMap[this.data.settings.pbsCode] = { ...this.data.settings };
    }
    this.saveData();
    this.logAudit('UPDATE', 'settings', this.data.settings.pbsCode || 'pbs_config', `${this.data.settings.pbsNameBn} এর সেটিংস ও লেটারহেড হালনাগাদ করা হয়েছে।`, user);
    this.broadcast('system:stats_updated', { type: 'settings', settings: this.data.settings }, user);
    return this.data.settings;
  }

  // --- Employees ---
  public getEmployees(): Employee[] {
    return this.data.employees.filter(e => !e.isDeleted);
  }

  public getEmployeeById(id: string): Employee | undefined {
    return this.data.employees.find(e => e.id === id && !e.isDeleted);
  }

  public getEmployeeByPayId(payId: string): Employee | undefined {
    return this.data.employees.find(e => e.payId === payId && !e.isDeleted);
  }

  public createEmployee(emp: Omit<Employee, 'id' | 'createdAt'>, user = 'admin'): Employee {
    const newEmp: Employee = {
      ...emp,
      id: 'emp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString()
    };
    this.data.employees.push(newEmp);
    this.saveData();
    this.logAudit('CREATE', 'employee', newEmp.id, `নতুন কর্মকর্তা/কর্মচারী নিবন্ধিত: ${newEmp.nameBn} (পে-আইডি: ${newEmp.payId})`, user);
    this.broadcast('system:stats_updated', { type: 'employee:created', employee: newEmp }, user);
    return newEmp;
  }

  public updateEmployee(id: string, updates: Partial<Employee>, user = 'admin'): Employee | null {
    const idx = this.data.employees.findIndex(e => e.id === id);
    if (idx === -1) return null;
    this.data.employees[idx] = { ...this.data.employees[idx], ...updates };
    this.saveData();
    this.logAudit('UPDATE', 'employee', id, `কর্মকর্তা/কর্মচারী তথ্য সংশোধিত: ${this.data.employees[idx].nameBn}`, user);
    this.broadcast('system:stats_updated', { type: 'employee:updated', employee: this.data.employees[idx] }, user);
    return this.data.employees[idx];
  }

  public deleteEmployee(id: string, user = 'admin'): boolean {
    const idx = this.data.employees.findIndex(e => e.id === id);
    if (idx === -1) return false;
    const emp = this.data.employees[idx];
    emp.isDeleted = true;

    this.data.recycleBin.unshift({
      id: 'rc-' + Date.now(),
      entityType: 'employee',
      entityId: emp.id,
      title: `${emp.nameBn} (${emp.payId})`,
      details: `${emp.designation}, ${emp.department}`,
      deletedAt: new Date().toISOString(),
      deletedBy: user,
      data: emp
    });

    this.saveData();
    this.logAudit('DELETE', 'employee', id, `কর্মকর্তা/কর্মচারী রিসাইকেল বিনে পাঠানো হয়েছে: ${emp.nameBn}`, user);
    this.broadcast('system:stats_updated', { type: 'employee:deleted', id }, user);
    return true;
  }

  // --- Loans ---
  public getLoans(): Loan[] {
    return this.data.loans.filter(l => !l.isDeleted);
  }

  public getLoanById(id: string): Loan | undefined {
    return this.data.loans.find(l => l.id === id && !l.isDeleted);
  }

  public getLoansByEmployeeId(empId: string): Loan[] {
    return this.data.loans.filter(l => l.employeeId === empId && !l.isDeleted);
  }

  public createLoan(loanData: Omit<Loan, 'id' | 'createdAt' | 'updatedAt'>, user = 'accounts'): Loan {
    const newLoan: Loan = {
      ...loanData,
      id: 'loan-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.loans.push(newLoan);
    this.saveData();
    this.logAudit('CREATE', 'loan', newLoan.id, `নতুন গৃহ ঋণ মঞ্জুর: ঋণ নং ${newLoan.loanNo}, প্রাপক: ${newLoan.employeeNameBn}, মূল টাকা: ৳${newLoan.disbursementAmount.toLocaleString()}`, user);
    this.broadcast('loan:created', { loan: newLoan }, user);
    return newLoan;
  }

  public updateLoanStatus(id: string, status: Loan['status'], user = 'accounts'): Loan | null {
    const loan = this.data.loans.find(l => l.id === id);
    if (!loan) return null;
    loan.status = status;
    loan.updatedAt = new Date().toISOString();
    this.saveData();
    this.logAudit('UPDATE', 'loan', id, `ঋণ স্থিতি পরিবর্তন: ${loan.loanNo} -> ${status === 'active' ? 'সক্রিয়' : status === 'suspended' ? 'কর্তন স্থগিত' : 'পরিশোধিত/বন্ধ'}`, user);
    this.broadcast('loan:status_changed', { loanId: id, status }, user);
    return loan;
  }

  public deleteLoan(id: string, user = 'accounts'): boolean {
    const loan = this.data.loans.find(l => l.id === id);
    if (!loan) return false;
    loan.isDeleted = true;

    this.data.recycleBin.unshift({
      id: 'rc-' + Date.now(),
      entityType: 'loan',
      entityId: loan.id,
      title: `ঋণ নং ${loan.loanNo} - ${loan.employeeNameBn}`,
      details: `আসল স্থিতি: ৳${loan.principalBalance.toLocaleString()}, কিস্তি: ৳${loan.monthlyInstallment.toLocaleString()}`,
      deletedAt: new Date().toISOString(),
      deletedBy: user,
      data: loan
    });

    this.saveData();
    this.logAudit('DELETE', 'loan', id, `ঋণ রিসাইকেল বিনে পাঠানো হয়েছে: ${loan.loanNo} (${loan.employeeNameBn})`, user);
    this.broadcast('system:stats_updated', { type: 'loan:deleted', id }, user);
    return true;
  }

  // --- Repayments (Principal-First Rule Implementation) ---
  /**
   * Government Rule:
   * "আসল টাকা পরিশোধ হয়ে গেলে সুদের টাকা আদায় করা হয়।"
   * 1. First pays down principalBalance.
   * 2. When principalBalance reaches 0, remaining pays down interestBalance.
   * 3. When both are 0, remaining is credited to advanceBalance.
   * Balances never go negative!
   */
  public postRepayment(params: {
    loanId: string;
    repaymentMonth: string; // YYYY-MM
    repaymentDate: string; // YYYY-MM-DD
    totalAmount: number;
    voucherNo?: string;
    sourceType?: 'payroll' | 'inter_pbs' | 'manual';
    notes?: string;
  }, user = 'accounts'): { repayment: Repayment; updatedLoan: Loan } {
    const loan = this.data.loans.find(l => l.id === params.loanId && !l.isDeleted);
    if (!loan) {
      throw new Error('নির্দিষ্ট ঋণটি পাওয়া যায়নি।');
    }

    const totalAmount = Number(params.totalAmount);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      throw new Error('কিস্তির টাকার পরিমাণ সঠিক নয়।');
    }

    let remaining = totalAmount;
    let principalPaid = 0;
    let interestPaid = 0;
    let advancePaid = 0;

    // 1. Pay off principal first
    if (loan.principalBalance > 0) {
      if (remaining <= loan.principalBalance) {
        principalPaid = remaining;
        loan.principalBalance -= remaining;
        remaining = 0;
      } else {
        principalPaid = loan.principalBalance;
        remaining -= loan.principalBalance;
        loan.principalBalance = 0;
      }
    }

    // 2. Pay off interest next
    if (remaining > 0 && loan.interestBalance > 0) {
      if (remaining <= loan.interestBalance) {
        interestPaid = remaining;
        loan.interestBalance -= remaining;
        remaining = 0;
      } else {
        interestPaid = loan.interestBalance;
        remaining -= loan.interestBalance;
        loan.interestBalance = 0;
      }
    }

    // 3. Excess goes to advance balance
    if (remaining > 0) {
      advancePaid = remaining;
      loan.advanceBalance += remaining;
      remaining = 0;
    }

    // Auto close if both principal and interest are 0
    if (loan.principalBalance === 0 && loan.interestBalance === 0) {
      loan.status = 'closed';
    }

    loan.updatedAt = new Date().toISOString();

    const voucherNo = params.voucherNo || `VR-${params.repaymentMonth}-${loan.payId}-${Date.now().toString().slice(-4)}`;

    const repayment: Repayment = {
      id: 'rep-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      loanId: loan.id,
      employeeId: loan.employeeId,
      payId: loan.payId,
      employeeNameBn: loan.employeeNameBn,
      repaymentMonth: params.repaymentMonth,
      repaymentDate: params.repaymentDate || new Date().toISOString().split('T')[0],
      voucherNo,
      totalAmount,
      principalPaid,
      interestPaid,
      advancePaid,
      sourceType: params.sourceType || 'payroll',
      notes: params.notes || `${params.repaymentMonth} কিস্তি কর্তন`,
      createdBy: user,
      createdAt: new Date().toISOString()
    };

    this.data.repayments.unshift(repayment);
    this.saveData();

    this.logAudit(
      'REPAYMENT',
      'repayment',
      repayment.id,
      `কিস্তি আদায়: ঋণ ${loan.loanNo} (${loan.employeeNameBn}), মোট ৳${totalAmount.toLocaleString()} (আসল ৳${principalPaid.toLocaleString()}, সুদ ৳${interestPaid.toLocaleString()}${advancePaid > 0 ? `, অগ্রিম ৳${advancePaid.toLocaleString()}` : ''})`,
      user
    );

    // Broadcast in real-time
    this.broadcast('repayment:created', { repayment, updatedLoan: loan }, user);

    return { repayment, updatedLoan: loan };
  }

  /**
   * Post multiple months of repayments sequentially for Inter-PBS remittances
   */
  public postMultiMonthRepayments(items: {
    loanId: string;
    repaymentMonth: string; // YYYY-MM
    repaymentDate: string; // YYYY-MM-DD
    totalAmount: number;
    voucherNo?: string;
    sourceType?: 'payroll' | 'inter_pbs' | 'manual';
    notes?: string;
  }[], user = 'accounts'): { repayments: Repayment[]; updatedLoan: Loan } {
    if (!items || items.length === 0) {
      throw new Error('কোনো কিস্তির তথ্য প্রদান করা হয়নি।');
    }

    const firstLoanId = items[0].loanId;
    const loan = this.data.loans.find(l => l.id === firstLoanId && !l.isDeleted);
    if (!loan) {
      throw new Error('নির্দিষ্ট ঋণটি পাওয়া যায়নি।');
    }

    // Sort items chronologically by repaymentMonth so principal is reduced in true chronological order
    const sorted = [...items].sort((a, b) => a.repaymentMonth.localeCompare(b.repaymentMonth));
    const createdRepayments: Repayment[] = [];
    let totalBatchAmount = 0;

    for (const item of sorted) {
      const totalAmount = Number(item.totalAmount);
      if (isNaN(totalAmount) || totalAmount <= 0) {
        continue;
      }
      totalBatchAmount += totalAmount;

      let remaining = totalAmount;
      let principalPaid = 0;
      let interestPaid = 0;
      let advancePaid = 0;

      // 1. Pay off principal first
      if (loan.principalBalance > 0) {
        if (remaining <= loan.principalBalance) {
          principalPaid = remaining;
          loan.principalBalance -= remaining;
          remaining = 0;
        } else {
          principalPaid = loan.principalBalance;
          remaining -= loan.principalBalance;
          loan.principalBalance = 0;
        }
      }

      // 2. Pay off interest next
      if (remaining > 0 && loan.interestBalance > 0) {
        if (remaining <= loan.interestBalance) {
          interestPaid = remaining;
          loan.interestBalance -= remaining;
          remaining = 0;
        } else {
          interestPaid = loan.interestBalance;
          remaining -= loan.interestBalance;
          loan.interestBalance = 0;
        }
      }

      // 3. Excess goes to advance balance
      if (remaining > 0) {
        advancePaid = remaining;
        loan.advanceBalance += remaining;
        remaining = 0;
      }

      // Auto close if both principal and interest are 0
      if (loan.principalBalance === 0 && loan.interestBalance === 0) {
        loan.status = 'closed';
      }

      const voucherNo = item.voucherNo || `VR-${item.repaymentMonth}-${loan.payId}-${Date.now().toString().slice(-4)}`;

      const repayment: Repayment = {
        id: 'rep-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        loanId: loan.id,
        employeeId: loan.employeeId,
        payId: loan.payId,
        employeeNameBn: loan.employeeNameBn,
        repaymentMonth: item.repaymentMonth,
        repaymentDate: item.repaymentDate || new Date().toISOString().split('T')[0],
        voucherNo,
        totalAmount,
        principalPaid,
        interestPaid,
        advancePaid,
        sourceType: item.sourceType || 'inter_pbs',
        notes: item.notes || `${item.repaymentMonth} কিস্তি কর্তন`,
        createdBy: user,
        createdAt: new Date().toISOString()
      };

      createdRepayments.push(repayment);
      this.data.repayments.unshift(repayment);
    }

    loan.updatedAt = new Date().toISOString();
    this.saveData();

    this.logAudit(
      'REPAYMENT',
      'repayment',
      loan.id,
      `অন্য পবিস হতে এককালীন ${createdRepayments.length} মাসের কিস্তি পোস্টিং: ঋণ ${loan.loanNo} (${loan.employeeNameBn}), সর্বমোট ৳${totalBatchAmount.toLocaleString()}`,
      user
    );

    this.broadcast('repayment:created', { repayments: createdRepayments, updatedLoan: loan }, user);
    this.broadcast('system:stats_updated', { type: 'repayments:multi_batch', count: createdRepayments.length }, user);

    return { repayments: createdRepayments, updatedLoan: loan };
  }

  /**
   * Run Batch Payroll Deduction for an entire month
   */
  public runBatchPayrollDeduction(month: string, date: string, user = 'accounts'): {
    processedCount: number;
    totalAmount: number;
    repayments: Repayment[];
  } {
    const activeLoans = this.data.loans.filter(
      l => !l.isDeleted && l.status === 'active' && (l.principalBalance > 0 || l.interestBalance > 0)
    );

    // Avoid duplicate payroll deduction in same month for same loan
    const existingThisMonth = new Set(
      this.data.repayments
        .filter(r => !r.isDeleted && r.repaymentMonth === month)
        .map(r => r.loanId)
    );

    const eligible = activeLoans.filter(l => !existingThisMonth.has(l.id));

    const results: Repayment[] = [];
    let totalBatchAmount = 0;

    for (const loan of eligible) {
      const amount = loan.monthlyInstallment;
      if (amount <= 0) continue;

      const { repayment } = this.postRepayment({
        loanId: loan.id,
        repaymentMonth: month,
        repaymentDate: date,
        totalAmount: amount,
        sourceType: loan.loanSource === 'other' ? 'inter_pbs' : 'payroll',
        notes: `${month} মাসের মাসিক বেতন হতে নিয়মিত কিস্তি কর্তন (ব্যাচ রান)`
      }, user);

      results.push(repayment);
      totalBatchAmount += amount;
    }

    this.logAudit(
      'REPAYMENT',
      'batch_payroll',
      month,
      `${month} মাসের ব্যাচ বেতন কিস্তি কর্তন সম্পন্ন: মোট ${results.length} জন, মোট টাকা: ৳${totalBatchAmount.toLocaleString()}`,
      user
    );

    this.broadcast('repayment:batch_created', {
      month,
      processedCount: results.length,
      totalAmount: totalBatchAmount,
      repayments: results
    }, user);

    return {
      processedCount: results.length,
      totalAmount: totalBatchAmount,
      repayments: results
    };
  }

  public getRepayments(): Repayment[] {
    return this.data.repayments.filter(r => !r.isDeleted);
  }

  // --- Provisions (8% pre-2020 and 7% post-2020 Simple Interest) ---
  /**
   * Government Rule:
   * - Months <= 2019-12: 8% per annum simple interest = (principal_balance * 0.08) / 12
   * - Months >= 2020-01: 7% per annum simple interest = (principal_balance * 0.07) / 12
   * - Other PBS loans: "অন্য পবিস থেকে গ্রহণকৃত লোনের উপর সুদ প্রভিশন প্রয়োজন নাই।" (Exempt)
   */
  public runMonthlyProvisions(month: string, user = 'accounts'): {
    processedCount: number;
    totalInterestAdded: number;
    provisions: Provision[];
  } {
    // Determine rate based on month cut-off 2020-01
    const isPre2020 = month <= '2019-12';
    const rate = isPre2020 ? 8 : 7;

    // Eligible: Active Own PBS loans with principal balance > 0
    const eligibleLoans = this.data.loans.filter(
      l => !l.isDeleted && l.status === 'active' && l.loanSource === 'own' && l.principalBalance > 0
    );

    // Check existing for this month
    const existing = new Set(
      this.data.provisions
        .filter(p => !p.isDeleted && p.provisionMonth === month)
        .map(p => p.loanId)
    );

    const pending = eligibleLoans.filter(l => !existing.has(l.id));

    const created: Provision[] = [];
    let totalAdded = 0;

    for (const loan of pending) {
      const monthlyInterest = Math.round((loan.principalBalance * (rate / 100)) / 12);
      if (monthlyInterest <= 0) continue;

      loan.interestBalance += monthlyInterest;
      loan.updatedAt = new Date().toISOString();

      const prov: Provision = {
        id: 'prov-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        loanId: loan.id,
        loanNo: loan.loanNo,
        employeeId: loan.employeeId,
        payId: loan.payId,
        employeeNameBn: loan.employeeNameBn,
        provisionMonth: month,
        principalAmount: loan.principalBalance,
        interestRate: rate,
        monthlyInterestAmount: monthlyInterest,
        status: 'posted',
        createdAt: new Date().toISOString()
      };

      this.data.provisions.unshift(prov);
      created.push(prov);
      totalAdded += monthlyInterest;
    }

    this.saveData();

    this.logAudit(
      'PROVISION',
      'provisions',
      month,
      `${month} মাসের সুদ প্রভিশন (${rate}% হারে) সম্পন্ন: ${created.length} টি লোন, মোট ধার্যকৃত সুদ ৳${totalAdded.toLocaleString()}`,
      user
    );

    this.broadcast('provision:run', {
      month,
      rate,
      processedCount: created.length,
      totalInterestAdded: totalAdded,
      provisions: created
    }, user);

    return {
      processedCount: created.length,
      totalInterestAdded: totalAdded,
      provisions: created
    };
  }

  public getProvisions(): Provision[] {
    return this.data.provisions.filter(p => !p.isDeleted);
  }

  // --- Bank Advices (Inter-PBS Remittances) ---
  public getBankAdvices(): BankAdvice[] {
    return this.data.bankAdvices.filter(b => !b.isDeleted);
  }

  public createBankAdvice(data: {
    toPbs: string;
    bankName: string;
    accountNo: string;
    routingNo: string;
    items: BankAdvice['items'];
    notes?: string;
  }, user = 'accounts'): BankAdvice {
    const totalAmount = data.items.reduce((sum, item) => sum + item.amount, 0);
    const dateStr = new Date().toISOString().split('T')[0];
    const year = new Date().getFullYear();
    const count = this.data.bankAdvices.length + 1;
    const memoNo = `${this.data.settings.memoPrefix}.${String(year).slice(-2)}.${String(count).padStart(3, '0')}`;
    const adviceNo = `BA-${year}-${String(count).padStart(3, '0')}`;

    const advice: BankAdvice = {
      id: 'adv-' + Date.now(),
      adviceNo,
      memoNo,
      adviceDate: dateStr,
      fromPbs: this.data.settings.pbsNameBn,
      toPbs: data.toPbs,
      bankName: data.bankName,
      accountNo: data.accountNo,
      routingNo: data.routingNo,
      totalAmount,
      amountInWordsBn: amountToWordsBn(totalAmount),
      status: 'draft',
      items: data.items,
      agmFinanceName: this.data.settings.agmFinanceName,
      dgmName: this.data.settings.dgmName,
      gmName: this.data.settings.gmName,
      notes: data.notes || '',
      createdAt: new Date().toISOString()
    };

    this.data.bankAdvices.unshift(advice);
    this.saveData();

    this.logAudit(
      'BANK_ADVICE',
      'bank_advice',
      advice.id,
      `নতুন ব্যাংক ট্রান্সফার অ্যাডভাইস প্রস্তুত: ${advice.adviceNo} (প্রাপক: ${advice.toPbs}, টাকা: ৳${totalAmount.toLocaleString()})`,
      user
    );

    this.broadcast('remittance:created', { bankAdvice: advice }, user);
    return advice;
  }

  public updateBankAdviceStatus(id: string, status: BankAdvice['status'], user = 'accounts'): BankAdvice | null {
    const advice = this.data.bankAdvices.find(b => b.id === id);
    if (!advice) return null;
    advice.status = status;
    this.saveData();
    this.logAudit('UPDATE', 'bank_advice', id, `ব্যাংক অ্যাডভাইস স্থিতি পরিবর্তন: ${advice.adviceNo} -> ${status}`, user);
    this.broadcast('system:stats_updated', { type: 'bank_advice:status', id, status }, user);
    return advice;
  }

  // --- Transferred Loans & Demand Notices (তাগাদা পত্র) ---
  public getTransferredLoans() {
    return this.data.loans.filter(l => !l.isDeleted && l.loanSource === 'other');
  }

  public createDemandNotice(data: {
    targetPbs: string;
    overdueMonths: string[];
    employees: DemandNotice['employees'];
    notes?: string;
  }, user = 'accounts'): DemandNotice {
    const year = new Date().getFullYear();
    const count = this.data.demandNotices.length + 1;
    const memoNo = `${this.data.settings.memoPrefix}.তাগাদা.${String(year).slice(-2)}.${String(count).padStart(3, '0')}`;
    const totalOverdueAmount = data.employees.reduce((sum, e) => sum + e.totalDue, 0);

    const notice: DemandNotice = {
      id: 'dn-' + Date.now(),
      noticeNo: `DN-${year}-${String(count).padStart(3, '0')}`,
      memoNo,
      noticeDate: new Date().toISOString().split('T')[0],
      targetPbs: data.targetPbs,
      overdueMonths: data.overdueMonths,
      totalOverdueAmount,
      employees: data.employees,
      notes: data.notes || '',
      createdAt: new Date().toISOString()
    };

    this.data.demandNotices.unshift(notice);
    this.saveData();
    this.logAudit('CREATE', 'demand_notice', notice.id, `তাগাদা পত্র প্রস্তুত: প্রাপক ${notice.targetPbs}, বকেয়া টাকা ৳${totalOverdueAmount.toLocaleString()}`, user);
    return notice;
  }

  public getDemandNotices(): DemandNotice[] {
    return this.data.demandNotices;
  }

  // --- Recycle Bin & Balance Auto-Reconciliation ---
  public getRecycleBin(): RecycleItem[] {
    return this.data.recycleBin;
  }

  public restoreFromRecycleBin(id: string, user = 'admin'): boolean {
    const idx = this.data.recycleBin.findIndex(r => r.id === id);
    if (idx === -1) return false;
    const item = this.data.recycleBin[idx];

    if (item.entityType === 'loan') {
      const loan = this.data.loans.find(l => l.id === item.entityId);
      if (loan) loan.isDeleted = false;
    } else if (item.entityType === 'employee') {
      const emp = this.data.employees.find(e => e.id === item.entityId);
      if (emp) emp.isDeleted = false;
    } else if (item.entityType === 'repayment') {
      const rep = this.data.repayments.find(r => r.id === item.entityId);
      if (rep) {
        rep.isDeleted = false;
        // Re-adjust loan balances correctly
        const loan = this.data.loans.find(l => l.id === rep.loanId);
        if (loan) {
          loan.principalBalance = Math.max(0, loan.principalBalance - rep.principalPaid);
          loan.interestBalance = Math.max(0, loan.interestBalance - rep.interestPaid);
          loan.advanceBalance += rep.advancePaid;
          loan.updatedAt = new Date().toISOString();
        }
      }
    } else if (item.entityType === 'bank_advice') {
      const adv = this.data.bankAdvices.find(b => b.id === item.entityId);
      if (adv) adv.isDeleted = false;
    }

    this.data.recycleBin.splice(idx, 1);
    this.saveData();

    this.logAudit('RESTORE', item.entityType, item.entityId, `রিসাইকেল বিন থেকে রেকর্ড পুনরুদ্ধার করা হয়েছে: ${item.title}`, user);
    this.broadcast('recycle:restored', { restoredItem: item }, user);
    return true;
  }

  // --- Audit Logs ---
  public getAuditLogs(limit = 100): AuditLog[] {
    return this.data.auditLogs.slice(0, limit);
  }

  // --- Aggregate Live Stats for Real-time Dashboard ---
  public getDashboardStats() {
    const activeLoans = this.data.loans.filter(l => !l.isDeleted && l.status === 'active');
    const allActiveEmployees = this.data.employees.filter(e => !e.isDeleted && e.isActive);

    const totalDisbursed = activeLoans.reduce((sum, l) => sum + l.disbursementAmount, 0);
    const totalPrincipalBalance = activeLoans.reduce((sum, l) => sum + l.principalBalance, 0);
    const totalInterestBalance = activeLoans.reduce((sum, l) => sum + l.interestBalance, 0);
    const totalAdvanceBalance = activeLoans.reduce((sum, l) => sum + l.advanceBalance, 0);
    const totalOutstanding = totalPrincipalBalance + totalInterestBalance;

    const ownLoans = activeLoans.filter(l => l.loanSource === 'own');
    const otherLoans = activeLoans.filter(l => l.loanSource === 'other');

    const totalRepayments = this.data.repayments.filter(r => !r.isDeleted);
    const totalPrincipalCollected = totalRepayments.reduce((sum, r) => sum + r.principalPaid, 0);
    const totalInterestCollected = totalRepayments.reduce((sum, r) => sum + r.interestPaid, 0);
    const totalCollected = totalPrincipalCollected + totalInterestCollected;

    // Current Month Status (e.g. 2026-10)
    const currentMonth = '2026-10';
    const currentMonthRepayments = totalRepayments.filter(r => r.repaymentMonth === currentMonth);
    const currentMonthProvisions = this.data.provisions.filter(p => !p.isDeleted && p.provisionMonth === currentMonth);

    const isPayrollComplete = currentMonthRepayments.length >= activeLoans.length && activeLoans.length > 0;
    const isProvisionComplete = currentMonthProvisions.length >= ownLoans.length && ownLoans.length > 0;

    // Pending inter-PBS remittances (deducted but not dispatched in bank advice)
    const dispatchedRepaymentIds = new Set(
      this.data.bankAdvices
        .filter(b => !b.isDeleted && b.status !== 'draft')
        .flatMap(b => b.items.map(item => `${item.loanId}-${item.installmentMonth}`))
    );

    const pendingInterPbsDeductions = totalRepayments.filter(
      r => r.sourceType === 'inter_pbs' && !dispatchedRepaymentIds.has(`${r.loanId}-${r.repaymentMonth}`)
    );
    const pendingRemittanceAmount = pendingInterPbsDeductions.reduce((sum, r) => sum + r.totalAmount, 0);

    return {
      currentMonth,
      totalEmployees: allActiveEmployees.length,
      totalLoans: activeLoans.length,
      ownLoansCount: ownLoans.length,
      otherLoansCount: otherLoans.length,
      totalDisbursed,
      totalPrincipalBalance,
      totalInterestBalance,
      totalAdvanceBalance,
      totalOutstanding,
      totalPrincipalCollected,
      totalInterestCollected,
      totalCollected,
      recoveryRatePercent: totalDisbursed > 0 ? Number(((totalPrincipalCollected / totalDisbursed) * 100).toFixed(1)) : 0,
      monthlyPayrollDue: activeLoans.reduce((sum, l) => sum + l.monthlyInstallment, 0),
      currentMonthDeducted: currentMonthRepayments.reduce((sum, r) => sum + r.totalAmount, 0),
      currentMonthDeductionCount: currentMonthRepayments.length,
      isPayrollComplete,
      isProvisionComplete,
      currentMonthProvisionCount: currentMonthProvisions.length,
      currentMonthProvisionInterest: currentMonthProvisions.reduce((sum, p) => sum + p.monthlyInterestAmount, 0),
      pendingRemittanceAmount,
      pendingRemittanceCount: pendingInterPbsDeductions.length,
      bankAdvicesCount: this.data.bankAdvices.filter(b => !b.isDeleted).length,
      recycleBinCount: this.data.recycleBin.length,
      lastUpdated: new Date().toISOString()
    };
  }

  // --- Detailed Loan Ledger Statement ---
  public getLoanLedger(loanId: string) {
    const loan = this.data.loans.find(l => l.id === loanId);
    if (!loan) return null;

    const emp = this.data.employees.find(e => e.id === loan.employeeId);
    const repayments = this.data.repayments.filter(r => r.loanId === loanId && !r.isDeleted);
    const provisions = this.data.provisions.filter(p => p.loanId === loanId && !p.isDeleted);

    // Merge transactions chronologically
    type LedgerRow = {
      date: string;
      month: string;
      description: string;
      voucherNo?: string;
      debitPrincipal: number;
      debitInterest: number;
      creditPrincipal: number;
      creditInterest: number;
      runningPrincipal: number;
      runningInterest: number;
      totalBalance: number;
    };

    const rows: LedgerRow[] = [];

    // 1. Initial Disbursement
    let runPrincipal = loan.disbursementAmount;
    let runInterest = 0;

    rows.push({
      date: loan.disbursementDate,
      month: loan.disbursementDate.slice(0, 7),
      description: `গৃহ ঋণ বিতরণ (${loan.allocationNo})`,
      debitPrincipal: loan.disbursementAmount,
      debitInterest: 0,
      creditPrincipal: 0,
      creditInterest: 0,
      runningPrincipal: runPrincipal,
      runningInterest: runInterest,
      totalBalance: runPrincipal + runInterest
    });

    // Merge provisions and repayments
    const events: { date: string; type: 'provision' | 'repayment'; data: any }[] = [];
    provisions.forEach(p => events.push({ date: p.createdAt.split('T')[0], type: 'provision', data: p }));
    repayments.forEach(r => events.push({ date: r.repaymentDate, type: 'repayment', data: r }));

    events.sort((a, b) => a.date.localeCompare(b.date));

    for (const ev of events) {
      if (ev.type === 'provision') {
        const prov: Provision = ev.data;
        runInterest += prov.monthlyInterestAmount;
        rows.push({
          date: ev.date,
          month: prov.provisionMonth,
          description: `মাসিক সুদ প্রভিশন (${prov.interestRate}% সরল সুদ)`,
          debitPrincipal: 0,
          debitInterest: prov.monthlyInterestAmount,
          creditPrincipal: 0,
          creditInterest: 0,
          runningPrincipal: runPrincipal,
          runningInterest: runInterest,
          totalBalance: runPrincipal + runInterest
        });
      } else {
        const rep: Repayment = ev.data;
        runPrincipal = Math.max(0, runPrincipal - rep.principalPaid);
        runInterest = Math.max(0, runInterest - rep.interestPaid);
        rows.push({
          date: rep.repaymentDate,
          month: rep.repaymentMonth,
          description: `${rep.repaymentMonth} কিস্তি কর্তন (আসল: ৳${rep.principalPaid.toLocaleString()}, সুদ: ৳${rep.interestPaid.toLocaleString()})`,
          voucherNo: rep.voucherNo,
          debitPrincipal: 0,
          debitInterest: 0,
          creditPrincipal: rep.principalPaid,
          creditInterest: rep.interestPaid,
          runningPrincipal: runPrincipal,
          runningInterest: runInterest,
          totalBalance: runPrincipal + runInterest
        });
      }
    }

    return {
      loan,
      employee: emp,
      rows,
      closingPrincipal: loan.principalBalance,
      closingInterest: loan.interestBalance,
      closingAdvance: loan.advanceBalance,
      totalPayable: loan.principalBalance + loan.interestBalance
    };
  }

  // --- Consolidated Multi-Loan Ledger with Excel-style Subtotals for an Employee ---
  public getEmployeeLoansLedger(payId: string) {
    const loans = this.data.loans.filter(l => l.payId === payId && !l.isDeleted);
    if (!loans || loans.length === 0) return null;

    const emp = this.data.employees.find(e => e.payId === payId && !e.isDeleted) || {
      id: loans[0].employeeId,
      payId,
      nameBn: loans[0].employeeNameBn,
      nameEn: '',
      designation: loans[0].employeeDesignation,
      department: 'সাধারণ',
      presentPbs: loans[0].lendingPbs,
      phone: '',
      email: '',
      role: 'employee' as const,
      isActive: true,
      createdAt: ''
    };

    // Calculate individual ledgers and subtotals per loan
    const ledgers = loans.map(loan => {
      const singleLedger = this.getLoanLedger(loan.id);
      const rows = singleLedger?.rows || [];

      const totalDebitPrincipal = rows.reduce((s, r) => s + r.debitPrincipal, 0);
      const totalDebitInterest = rows.reduce((s, r) => s + r.debitInterest, 0);
      const totalCreditPrincipal = rows.reduce((s, r) => s + r.creditPrincipal, 0);
      const totalCreditInterest = rows.reduce((s, r) => s + r.creditInterest, 0);

      return {
        loan,
        rows,
        subTotal: {
          totalDebitPrincipal,
          totalDebitInterest,
          totalCreditPrincipal,
          totalCreditInterest,
          closingPrincipal: loan.principalBalance,
          closingInterest: loan.interestBalance,
          closingAdvance: loan.advanceBalance,
          totalPayable: loan.principalBalance + loan.interestBalance
        },
        closingPrincipal: loan.principalBalance,
        closingInterest: loan.interestBalance,
        closingAdvance: loan.advanceBalance,
        totalPayable: loan.principalBalance + loan.interestBalance
      };
    });

    // Grand totals across all loans for this payId
    const grandTotal = {
      totalDisbursed: loans.reduce((s, l) => s + l.disbursementAmount, 0),
      totalDebitPrincipal: ledgers.reduce((s, l) => s + l.subTotal.totalDebitPrincipal, 0),
      totalDebitInterest: ledgers.reduce((s, l) => s + l.subTotal.totalDebitInterest, 0),
      totalCreditPrincipal: ledgers.reduce((s, l) => s + l.subTotal.totalCreditPrincipal, 0),
      totalCreditInterest: ledgers.reduce((s, l) => s + l.subTotal.totalCreditInterest, 0),
      closingPrincipal: loans.reduce((s, l) => s + l.principalBalance, 0),
      closingInterest: loans.reduce((s, l) => s + l.interestBalance, 0),
      closingAdvance: loans.reduce((s, l) => s + l.advanceBalance, 0),
      totalPayable: loans.reduce((s, l) => s + (l.principalBalance + l.interestBalance), 0)
    };

    return {
      employee: emp,
      loans,
      ledgers,
      grandTotal
    };
  }
}

export const db = new DatabaseStore();
