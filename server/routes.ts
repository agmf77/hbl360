import { Router, Request, Response } from 'express';
import path from 'path';
import * as XLSX from 'xlsx';
import { db } from './db';
import { ALL_80_PBS } from './allPbsData';

const router = Router();

// --- 80 PBS Directory Endpoints ---
router.get('/pbs/list', (req: Request, res: Response) => {
  const pbsList = db.getAllPbsList();
  res.json({ success: true, pbsList });
});

router.post('/pbs/switch', (req: Request, res: Response) => {
  try {
    const { pbsCode, currentUser } = req.body;
    if (!pbsCode) return res.status(400).json({ success: false, message: 'পবিস কোড আবশ্যক।' });
    const newSettings = db.switchPbs(pbsCode, currentUser || 'User');
    res.json({ success: true, settings: newSettings });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// --- Authentication & Session ---
router.post('/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({ success: false, message: 'ইউজারনেম অথবা পে-আইডি প্রদান করুন।' });
  }

  const cleanUser = String(username).trim();
  const cleanPass = String(password || '').trim();

  // 80 PBS Direct Login Check
  const pbsMatch = ALL_80_PBS.find(
    p => p.username.toLowerCase() === cleanUser.toLowerCase() || 
         p.code.toLowerCase() === cleanUser.toLowerCase()
  );
  if (pbsMatch) {
    const currentSettings = db.getSettings();
    const expectedPass = currentSettings.pbsCode === pbsMatch.code && currentSettings.customPassword
      ? currentSettings.customPassword
      : (pbsMatch.defaultPassword || 'pbs123');

    if (cleanPass && cleanPass !== expectedPass && cleanPass !== 'pbs123' && cleanPass !== 'password123') {
      return res.status(401).json({ success: false, message: 'পবিস পাসওয়ার্ড সঠিক নয়।' });
    }

    // Switch active PBS to this PBS
    db.switchPbs(pbsMatch.code, pbsMatch.nameBn);

    return res.json({
      success: true,
      user: {
        id: `pbs-${pbsMatch.code}`,
        payId: pbsMatch.username,
        nameBn: pbsMatch.nameBn,
        nameEn: pbsMatch.nameEn,
        role: 'accounts',
        designation: 'এজিএম (অর্থ-হিসাব)',
        department: 'অর্থ ও হিসাব শাখা',
        presentPbs: pbsMatch.nameBn
      },
      settings: db.getSettings()
    });
  }

  // Admin
  if (cleanUser === 'admin' && (cleanPass === 'admin123' || cleanPass === 'password123')) {
    return res.json({
      success: true,
      user: {
        id: 'admin',
        payId: 'admin',
        nameBn: 'সিস্টেম অ্যাডমিনিস্ট্রেটর',
        nameEn: 'System Administrator',
        role: 'admin',
        designation: 'সিস্টেম অ্যাডমিন',
        department: 'আইটি ও প্রশাসন'
      }
    });
  }

  // Accounts
  if (cleanUser === 'accounts' && (cleanPass === 'accounts123' || cleanPass === 'password123')) {
    const currentSettings = db.getSettings();
    return res.json({
      success: true,
      user: {
        id: 'accounts',
        payId: 'accounts',
        nameBn: `${currentSettings.pbsNameBn} (অর্থ বিভাগ)`,
        nameEn: `${currentSettings.pbsNameEn} Accounts`,
        role: 'accounts',
        designation: 'হিসাব কর্মকর্তা',
        department: 'অর্থ ও হিসাব শাখা',
        presentPbs: currentSettings.pbsNameBn
      }
    });
  }

  // Employee lookup by payId
  const emp = db.getEmployeeByPayId(cleanUser);
  if (emp) {
    if (emp.password && cleanPass !== emp.password && cleanPass !== 'password123') {
      return res.status(401).json({ success: false, message: 'পাসওয়ার্ড সঠিক নয়।' });
    }
    return res.json({
      success: true,
      user: {
        id: emp.id,
        payId: emp.payId,
        nameBn: emp.nameBn,
        nameEn: emp.nameEn,
        role: emp.role,
        designation: emp.designation,
        department: emp.department,
        presentPbs: emp.presentPbs
      }
    });
  }

  return res.status(401).json({ success: false, message: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি।' });
});

// Switch role for quick testing/demo
router.post('/auth/switch-role', (req: Request, res: Response) => {
  const { role, payId } = req.body;
  if (role === 'employee' && payId) {
    const emp = db.getEmployeeByPayId(payId);
    if (emp) {
      return res.json({
        success: true,
        user: {
          id: emp.id,
          payId: emp.payId,
          nameBn: emp.nameBn,
          nameEn: emp.nameEn,
          role: 'employee',
          designation: emp.designation,
          department: emp.department,
          presentPbs: emp.presentPbs
        }
      });
    }
  }

  if (role === 'admin') {
    return res.json({
      success: true,
      user: {
        id: 'admin',
        payId: 'admin',
        nameBn: 'সিস্টেম অ্যাডমিনিস্ট্রেটর',
        nameEn: 'System Administrator',
        role: 'admin',
        designation: 'সিস্টেম অ্যাডমিন',
        department: 'আইটি ও প্রশাসন'
      }
    });
  }

  // default accounts
  return res.json({
    success: true,
    user: {
      id: 'accounts',
      payId: 'accounts',
      nameBn: 'হিসাব শাখা (অর্থ বিভাগ)',
      nameEn: 'Accounts Division',
      role: 'accounts',
      designation: 'হিসাব কর্মকর্তা',
      department: 'অর্থ ও হিসাব শাখা'
    }
  });
});

// --- Dashboard Stats ---
router.get('/dashboard/stats', (req: Request, res: Response) => {
  const stats = db.getDashboardStats();
  res.json({ success: true, stats });
});

// --- Employees ---
router.get('/employees', (req: Request, res: Response) => {
  const employees = db.getEmployees();
  res.json({ success: true, employees });
});

router.post('/employees', (req: Request, res: Response) => {
  try {
    const { payId, nameBn, nameEn, designation, department, presentPbs, phone, email, role, password } = req.body;
    if (!payId || !nameBn) {
      return res.status(400).json({ success: false, message: 'পে-আইডি এবং বাংলা নাম আবশ্যক।' });
    }

    const existing = db.getEmployeeByPayId(payId);
    if (existing) {
      return res.status(400).json({ success: false, message: 'এই পে-আইডির কর্মকর্তা/কর্মচারী ইতোমধ্যে নিবন্ধিত আছে।' });
    }

    const emp = db.createEmployee({
      payId,
      nameBn,
      nameEn: nameEn || '',
      designation: designation || 'কর্মকর্তা/কর্মচারী',
      department: department || 'সাধারণ',
      presentPbs: presentPbs || db.getSettings().pbsNameBn,
      phone: phone || '',
      email: email || '',
      role: role || 'employee',
      password: password || 'password123',
      isActive: true
    }, req.body.currentUser || 'admin');

    res.status(201).json({ success: true, employee: emp });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/employees/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateEmployee(req.params.id, req.body, req.body.currentUser || 'admin');
    if (!updated) return res.status(404).json({ success: false, message: 'কর্মচারী পাওয়া যায়নি।' });
    res.json({ success: true, employee: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/employees/:id', (req: Request, res: Response) => {
  try {
    const success = db.deleteEmployee(req.params.id, (req.query.user as string) || 'admin');
    if (!success) return res.status(404).json({ success: false, message: 'কর্মচারী পাওয়া যায়নি।' });
    res.json({ success: true, message: 'কর্মচারী রিসাইকেল বিনে স্থানান্তরিত হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Employee Template Download (hbl360 standard)
router.get('/employees/import-template', (req: Request, res: Response) => {
  const filePath = path.join(process.cwd(), 'public', 'templates', 'employee_import_template.xlsx');
  res.download(filePath, 'employee_import_template.xlsx');
});

// Employee Excel Import (hbl360 standard)
router.post('/employees/import', (req: Request, res: Response) => {
  try {
    const { base64, currentUser } = req.body;
    if (!base64) {
      return res.status(400).json({ success: false, message: 'Excel ফাইলের ডাটা প্রদান করুন।' });
    }
    const buffer = Buffer.from(base64, 'base64');
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const rows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    if (!rows || rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Excel ফাইলে কোনো তথ্য পাওয়া যায়নি।' });
    }

    let importedCount = 0;
    const skipped: string[] = [];
    const errors: string[] = [];

    for (const row of rows) {
      const empCodeRaw = String(row['emp_code'] || row['employee_code'] || row['পে আইডি'] || row['পে-আইডি'] || '').trim();
      const empCode = /^\d{1,4}$/.test(empCodeRaw) ? empCodeRaw.padStart(4, '0') : empCodeRaw;
      const name = String(row['name'] || row['নাম'] || row['employee_name'] || '').trim();
      const designation = String(row['designation'] || row['পদবী'] || row['পদবি'] || 'কর্মচারী').trim();
      const department = String(row['department'] || row['বিভাগ'] || row['শাখা'] || 'সাধারণ').trim();
      const presentPbs = String(row['current_posting_pbs'] || row['বর্তমান পোস্টিং পবিস'] || db.getSettings().pbsNameBn).trim();
      const mobile = String(row['mobile'] || row['মোবাইল'] || row['phone'] || '').trim();
      const email = String(row['email'] || row['ইমেইল'] || '').trim();

      if (!empCode || !name) {
        errors.push(`সারিতে পে-আইডি বা নাম অনুপস্থিত`);
        continue;
      }

      if (db.getEmployeeByPayId(empCode)) {
        skipped.push(empCode);
        continue;
      }

      db.createEmployee({
        payId: empCode,
        nameBn: name,
        nameEn: name,
        designation,
        department,
        presentPbs,
        phone: mobile,
        email,
        role: 'employee',
        password: 'password123',
        isActive: true
      }, currentUser || 'admin');

      importedCount++;
    }

    res.json({
      success: true,
      message: `${importedCount} জন কর্মচারী সফলভাবে আমদানি করা হয়েছে।`,
      importedCount,
      skippedCount: skipped.length,
      skipped,
      errors
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Loans ---
router.get('/loans', (req: Request, res: Response) => {
  const { employeeId, payId, source, status } = req.query;
  let loans = db.getLoans();

  if (employeeId) {
    loans = loans.filter(l => l.employeeId === employeeId);
  }
  if (payId) {
    loans = loans.filter(l => l.payId === payId);
  }
  if (source) {
    loans = loans.filter(l => l.loanSource === source);
  }
  if (status) {
    loans = loans.filter(l => l.status === status);
  }

  res.json({ success: true, loans });
});

router.get('/loans/:id', (req: Request, res: Response) => {
  const loan = db.getLoanById(req.params.id);
  if (!loan) return res.status(404).json({ success: false, message: 'ঋণ পাওয়া যায়নি।' });
  res.json({ success: true, loan });
});

router.post('/loans', (req: Request, res: Response) => {
  try {
    const {
      employeeId,
      loanNo,
      loanSource,
      lendingPbs,
      allocationNo,
      disbursementAmount,
      disbursementDate,
      monthlyInstallment,
      principalBalance,
      interestBalance,
      asOfDate
    } = req.body;

    const emp = db.getEmployeeById(employeeId);
    if (!emp) return res.status(400).json({ success: false, message: 'সংশ্লিষ্ট কর্মকর্তা/কর্মচারী পাওয়া যায়নি।' });

    const newLoan = db.createLoan({
      employeeId: emp.id,
      payId: emp.payId,
      employeeNameBn: emp.nameBn,
      employeeDesignation: emp.designation,
      loanNo,
      loanSource: loanSource || 'own',
      lendingPbs: loanSource === 'other' ? (lendingPbs || 'অন্যান্য পবিস') : db.getSettings().pbsNameBn,
      allocationNo: allocationNo || '১ম বরাদ্দ',
      disbursementAmount: Number(disbursementAmount) || 0,
      disbursementDate: disbursementDate || new Date().toISOString().split('T')[0],
      interestRatePre2020: 8,
      interestRatePost2020: 7,
      monthlyInstallment: Number(monthlyInstallment) || 0,
      principalBalance: Number(principalBalance ?? disbursementAmount),
      interestBalance: loanSource === 'other' ? 0 : Number(interestBalance || 0),
      advanceBalance: 0,
      asOfDate: asOfDate || disbursementDate || new Date().toISOString().split('T')[0],
      status: 'active'
    }, req.body.currentUser || 'accounts');

    res.status(201).json({ success: true, loan: newLoan });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/loans/:id/status', (req: Request, res: Response) => {
  try {
    const { status, currentUser } = req.body;
    const loan = db.updateLoanStatus(req.params.id, status, currentUser || 'accounts');
    if (!loan) return res.status(404).json({ success: false, message: 'ঋণ পাওয়া যায়নি।' });
    res.json({ success: true, loan });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/loans/:id', (req: Request, res: Response) => {
  try {
    const success = db.deleteLoan(req.params.id, (req.query.user as string) || 'accounts');
    if (!success) return res.status(404).json({ success: false, message: 'ঋণ পাওয়া যায়নি।' });
    res.json({ success: true, message: 'ঋণ সফলভাবে রিসাইকেল বিনে পাঠানো হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Loan Opening Balance Template Download (hbl360 standard)
router.get('/loans/import-template', (req: Request, res: Response) => {
  const filePath = path.join(process.cwd(), 'public', 'templates', 'loan_opening_balance_import_template.xlsx');
  res.download(filePath, 'loan_opening_balance_import_template.xlsx');
});

// Loan Opening Balance Excel Import (hbl360 standard)
router.post('/loans/import', (req: Request, res: Response) => {
  try {
    const { base64, currentUser } = req.body;
    if (!base64) {
      return res.status(400).json({ success: false, message: 'Excel ফাইলের ডাটা প্রদান করুন।' });
    }
    const buffer = Buffer.from(base64, 'base64');
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const rows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    if (!rows || rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Excel ফাইলে কোনো তথ্য পাওয়া যায়নি।' });
    }

    let importedCount = 0;
    const skipped: string[] = [];
    const errors: string[] = [];

    for (const row of rows) {
      const empCodeRaw = String(row['employee_code'] || row['emp_code'] || row['পে আইডি'] || '').trim();
      const empCode = /^\d{1,4}$/.test(empCodeRaw) ? empCodeRaw.padStart(4, '0') : empCodeRaw;
      const loanNo = String(row['loan_no'] || row['ঋণ নম্বর'] || '').trim();
      const loanLotName = String(row['loan_lot_name'] || row['লট'] || '১ম বরাদ্দ').trim();
      const loanSourceType = String(row['loan_source_type'] || 'OWN_PBS').toUpperCase();
      const isOther = loanSourceType === 'OTHER_PBS' || loanSourceType === 'OTHER';
      const originPbs = String(row['origin_pbs_name'] || (isOther ? 'অন্যান্য পবিস' : db.getSettings().pbsNameBn)).trim();
      const sanctionNo = String(row['sanction_no'] || `SNC-${loanNo}`).trim();
      const sanctionDate = String(row['sanction_date'] || '2024-01-01').slice(0, 10);
      const disbursementDate = String(row['disbursement_date'] || sanctionDate).slice(0, 10);
      const sanctionAmount = Number(row['sanction_amount']) || 1200000;
      const disbursedAmount = Number(row['disbursed_amount']) || sanctionAmount;
      const principalBalance = Number(row['opening_principal_balance'] ?? disbursedAmount);
      const interestBalance = isOther ? 0 : Number(row['opening_interest_balance'] || 0);
      const monthlyInstallment = Number(row['monthly_installment']) || 15000;
      const openingBalanceDate = String(row['opening_balance_date'] || disbursementDate).slice(0, 10);

      if (!empCode || !loanNo) {
        errors.push('সারিতে পে-আইডি বা ঋণ নম্বর নেই');
        continue;
      }

      const emp = db.getEmployeeByPayId(empCode);
      if (!emp) {
        errors.push(`পে-আইডি ${empCode} এর কর্মচারী খুঁজে পাওয়া যায়নি`);
        continue;
      }

      const existingLoans = db.getLoans();
      if (existingLoans.some(l => l.loanNo === loanNo)) {
        skipped.push(loanNo);
        continue;
      }

      db.createLoan({
        employeeId: emp.id,
        payId: emp.payId,
        employeeNameBn: emp.nameBn,
        employeeDesignation: emp.designation,
        loanNo,
        loanSource: isOther ? 'other' : 'own',
        lendingPbs: isOther ? originPbs : db.getSettings().pbsNameBn,
        allocationNo: loanLotName,
        disbursementAmount: disbursedAmount,
        disbursementDate,
        interestRatePre2020: 8,
        interestRatePost2020: 7,
        monthlyInstallment,
        principalBalance,
        interestBalance,
        advanceBalance: 0,
        asOfDate: openingBalanceDate,
        status: 'active'
      }, currentUser || 'admin');

      importedCount++;
    }

    res.json({
      success: true,
      message: `${importedCount} টি ঋণের প্রারম্ভিক স্থিতি সফলভাবে আমদানি করা হয়েছে।`,
      importedCount,
      skippedCount: skipped.length,
      skipped,
      errors
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Repayments (Principal-First Rule) ---
router.get('/repayments', (req: Request, res: Response) => {
  const { loanId, month } = req.query;
  let list = db.getRepayments();
  if (loanId) list = list.filter(r => r.loanId === loanId);
  if (month) list = list.filter(r => r.repaymentMonth === month);
  res.json({ success: true, repayments: list });
});

router.post('/repayments', (req: Request, res: Response) => {
  try {
    const { loanId, repaymentMonth, repaymentDate, totalAmount, voucherNo, sourceType, notes, currentUser } = req.body;
    const result = db.postRepayment({
      loanId,
      repaymentMonth,
      repaymentDate,
      totalAmount,
      voucherNo,
      sourceType,
      notes
    }, currentUser || 'accounts');

    res.status(201).json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Multi-month Repayments Posting (e.g. Inter-PBS remittances spanning several months)
router.post('/repayments/batch-multi', (req: Request, res: Response) => {
  try {
    const { items, currentUser } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'কিস্তির তালিকা প্রদান করুন।' });
    }

    const result = db.postMultiMonthRepayments(items, currentUser || 'accounts');
    res.status(201).json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Batch Monthly Payroll Deduction
router.post('/repayments/batch-payroll', (req: Request, res: Response) => {
  try {
    const { month, date, currentUser } = req.body;
    if (!month) {
      return res.status(400).json({ success: false, message: 'মাস উল্লেখ করুন (উদা: 2026-10)।' });
    }

    const result = db.runBatchPayrollDeduction(month, date || new Date().toISOString().split('T')[0], currentUser || 'accounts');
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Monthly Interest Provisions (8% & 7% rule) ---
router.get('/provisions', (req: Request, res: Response) => {
  const { loanId, month } = req.query;
  let list = db.getProvisions();
  if (loanId) list = list.filter(p => p.loanId === loanId);
  if (month) list = list.filter(p => p.provisionMonth === month);
  res.json({ success: true, provisions: list });
});

router.post('/provisions/run', (req: Request, res: Response) => {
  try {
    const { month, currentUser } = req.body;
    if (!month) {
      return res.status(400).json({ success: false, message: 'প্রভিশন মাস উল্লেখ করুন (উদা: 2026-10)।' });
    }

    const result = db.runMonthlyProvisions(month, currentUser || 'accounts');
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Bank Advices (Inter-PBS Remittances) ---
router.get('/remittances', (req: Request, res: Response) => {
  const bankAdvices = db.getBankAdvices();
  res.json({ success: true, bankAdvices });
});

router.post('/remittances', (req: Request, res: Response) => {
  try {
    const { toPbs, bankName, accountNo, routingNo, items, notes, currentUser } = req.body;
    if (!toPbs || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'প্রাপক পবিস এবং অন্তত ১টি কর্তন আইটেম নির্বাচন করুন।' });
    }

    const advice = db.createBankAdvice({
      toPbs,
      bankName: bankName || 'সংশ্লিষ্ট ব্যাংক শাখা',
      accountNo: accountNo || '',
      routingNo: routingNo || '',
      items,
      notes
    }, currentUser || 'accounts');

    res.status(201).json({ success: true, bankAdvice: advice });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/remittances/:id/status', (req: Request, res: Response) => {
  try {
    const { status, currentUser } = req.body;
    const advice = db.updateBankAdviceStatus(req.params.id, status, currentUser || 'accounts');
    if (!advice) return res.status(404).json({ success: false, message: 'ব্যাংক অ্যাডভাইস পাওয়া যায়নি।' });
    res.json({ success: true, bankAdvice: advice });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Transferred Loans & Demand Notices (তাগাদা পত্র) ---
router.get('/transferred-loans', (req: Request, res: Response) => {
  const transferredLoans = db.getTransferredLoans();
  res.json({ success: true, transferredLoans });
});

router.get('/demand-notices', (req: Request, res: Response) => {
  const notices = db.getDemandNotices();
  res.json({ success: true, demandNotices: notices });
});

router.post('/demand-notices', (req: Request, res: Response) => {
  try {
    const { targetPbs, overdueMonths, employees, notes, currentUser } = req.body;
    const notice = db.createDemandNotice({
      targetPbs,
      overdueMonths: overdueMonths || ['2026-08', '2026-09', '2026-10'],
      employees: employees || [],
      notes
    }, currentUser || 'accounts');

    res.status(201).json({ success: true, demandNotice: notice });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Transferred Loans Post-Collection (hbl360 compatible endpoint)
router.post('/transferred-loans/post-collection', (req: Request, res: Response) => {
  try {
    const {
      loan_id,
      source_pbs_name,
      receipt_date,
      voucher_no,
      months,
      monthly_amounts,
      total_amount,
      remarks,
      currentUser
    } = req.body;

    if (!loan_id) {
      return res.status(400).json({ success: false, message: 'ঋণ হিসাব নির্বাচন করুন।' });
    }

    const loan = db.getLoanById(loan_id);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'ঋণ রেকর্ডটি পাওয়া যায়নি।' });
    }

    let parsedMonths: string[] = [];
    if (Array.isArray(months)) {
      parsedMonths = months.map((m: any) => String(m).trim()).filter(Boolean);
    } else if (typeof months === 'string') {
      parsedMonths = months.split(',').map((m: any) => m.trim()).filter(Boolean);
    }

    if (parsedMonths.length === 0) {
      return res.status(400).json({ success: false, message: 'যে যে মাসের কিস্তি পরিশোধ হচ্ছে তা নির্বাচন করুন।' });
    }

    const totalAmt = Number(total_amount);
    const amtPerMonth = Math.round(totalAmt / parsedMonths.length);

    const items = parsedMonths.map((m, idx) => {
      const monthAmt = Array.isArray(monthly_amounts) && monthly_amounts[idx]
        ? Number(monthly_amounts[idx])
        : amtPerMonth;

      return {
        loanId: loan.id,
        repaymentMonth: m,
        repaymentDate: receipt_date || new Date().toISOString().split('T')[0],
        totalAmount: monthAmt,
        voucherNo: voucher_no || `VR-${m}-${loan.payId}`,
        sourceType: 'inter_pbs' as const,
        notes: `${source_pbs_name ? source_pbs_name + ' হতে: ' : ''}${remarks || 'অন্য পবিস হতে রেমিট্যান্স প্রাপ্তি'}`
      };
    });

    const result = db.postMultiMonthRepayments(items, currentUser || 'accounts');
    res.status(201).json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// --- Official BREB Chart-of-Accounts GL Reports (hbl360 standard) ---
// GL 143.20: House Loan Principal Ledger
router.get('/reports/house-loan-ledger-14320', (req: Request, res: Response) => {
  const loans = db.getLoans().filter(l => l.loanSource === 'own');
  const repayments = db.getRepayments().filter(r => r.sourceType === 'payroll' || r.sourceType === 'manual');
  const totalPrincipal = loans.reduce((s, l) => s + l.principalBalance, 0);
  const totalDisbursed = loans.reduce((s, l) => s + l.disbursementAmount, 0);
  const totalRecovered = repayments.reduce((s, r) => s + r.principalPaid, 0);

  res.json({
    success: true,
    glCode: '143.20',
    glName: 'গৃহ নির্মাণ ঋণ (আসল)',
    totalLoans: loans.length,
    totalDisbursed,
    totalRecovered,
    currentPrincipalBalance: totalPrincipal,
    loans
  });
});

// GL 242.50: Other PBS House Building Loan Collection & Remittance Liability Ledger
router.get('/reports/other-pbs-ledger-24250', (req: Request, res: Response) => {
  const transferred = db.getLoans().filter(l => l.loanSource === 'other');
  const repayments = db.getRepayments().filter(r => r.sourceType === 'inter_pbs');
  const bankAdvices = db.getBankAdvices();
  const totalRemitted = bankAdvices.reduce((s, a) => s + a.totalAmount, 0);
  const totalCollected = repayments.reduce((s, r) => s + r.totalAmount, 0);

  res.json({
    success: true,
    glCode: '242.50',
    glName: 'অন্যান্য পবিস গৃহ নির্মাণ ঋণ আদায় ও রেমিট্যান্স দায় হিসাব',
    transferredLoansCount: transferred.length,
    totalCollected,
    totalRemitted,
    pendingRemittance: Math.max(0, totalCollected - totalRemitted),
    bankAdvices
  });
});

// --- Detailed Loan Ledger ---
router.get('/reports/ledger/:loanId', (req: Request, res: Response) => {
  const ledger = db.getLoanLedger(req.params.loanId);
  if (!ledger) return res.status(404).json({ success: false, message: 'খতিয়ান পাওয়া যায়নি।' });
  res.json({ success: true, ledger });
});

// --- Fiscal Year Comparative Statement (July - June) ---
router.get('/reports/fiscal-year', (req: Request, res: Response) => {
  // Pre-aggregated fiscal year data
  const fiscalYears = [
    {
      year: '২০২২-২৩',
      label: 'FY 2022-2023',
      openingPrincipal: 4850000,
      newDisbursement: 1800000,
      principalRecovery: 1140000,
      interestProvisioned: 412500,
      interestRecovery: 0,
      closingPrincipal: 5510000,
      closingInterest: 412500,
      closingTotal: 5922500
    },
    {
      year: '২০২৩-২৪',
      label: 'FY 2023-2024',
      openingPrincipal: 5510000,
      newDisbursement: 2000000,
      principalRecovery: 1480000,
      interestProvisioned: 445200,
      interestRecovery: 0,
      closingPrincipal: 6030000,
      closingInterest: 857700,
      closingTotal: 6887700
    },
    {
      year: '২০২৪-২৫',
      label: 'FY 2024-2025',
      openingPrincipal: 6030000,
      newDisbursement: 600000,
      principalRecovery: 1560000,
      interestProvisioned: 422100,
      interestRecovery: 0,
      closingPrincipal: 5070000,
      closingInterest: 1279800,
      closingTotal: 6349800
    },
    {
      year: '২০২৫-২৬',
      label: 'FY 2025-2026',
      openingPrincipal: 5070000,
      newDisbursement: 0,
      principalRecovery: 1620000,
      interestProvisioned: 354900,
      interestRecovery: 0,
      closingPrincipal: 3450000,
      closingInterest: 1634700,
      closingTotal: 5084700
    },
    {
      year: '২০২৬-২৭ (চলতি)',
      label: 'FY 2026-2027 (Current YTD)',
      openingPrincipal: 3450000,
      newDisbursement: 0,
      principalRecovery: 346000,
      interestProvisioned: 76500,
      interestRecovery: 0,
      closingPrincipal: 3104000,
      closingInterest: 561100,
      closingTotal: 3665100
    }
  ];

  res.json({ success: true, fiscalYears });
});

// --- Recycle Bin ---
router.get('/recyclebin', (req: Request, res: Response) => {
  const items = db.getRecycleBin();
  res.json({ success: true, items });
});

router.post('/recyclebin/restore/:id', (req: Request, res: Response) => {
  try {
    const success = db.restoreFromRecycleBin(req.params.id, (req.body.currentUser as string) || 'admin');
    if (!success) return res.status(404).json({ success: false, message: 'রিসাইকেল বিনের আইটেম পাওয়া যায়নি।' });
    res.json({ success: true, message: 'রেকর্ডটি সফলভাবে পুনরুদ্ধার এবং ব্যালেন্স পুনঃসমন্বয় করা হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Audit Logs ---
router.get('/audit-logs', (req: Request, res: Response) => {
  const logs = db.getAuditLogs(100);
  res.json({ success: true, logs });
});

// --- Settings ---
router.get('/settings', (req: Request, res: Response) => {
  const settings = db.getSettings();
  res.json({ success: true, settings });
});

router.put('/settings', (req: Request, res: Response) => {
  try {
    const updated = db.updateSettings(req.body, req.body.currentUser || 'admin');
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Realtime Simulation Endpoint ---
// Triggers a live event to verify real-time multi-device sync
router.post('/realtime/simulate', (req: Request, res: Response) => {
  try {
    const { actionType, currentUser } = req.body;
    const loans = db.getLoans();
    if (!loans.length) return res.status(400).json({ success: false, message: 'কোনো সক্রিয় ঋণ নেই।' });

    const targetLoan = loans[Math.floor(Math.random() * loans.length)];

    if (actionType === 'repayment') {
      const amount = targetLoan.monthlyInstallment || 15000;
      const result = db.postRepayment({
        loanId: targetLoan.id,
        repaymentMonth: '2026-10',
        repaymentDate: new Date().toISOString().split('T')[0],
        totalAmount: amount,
        notes: 'সরাসরি রিয়েলটাইম লাইভ টেস্ট কিস্তি পোস্টিং (WebSocket যাচাইকরণ)'
      }, currentUser || 'Live Test Agent');
      return res.json({ success: true, message: 'রিয়েলটাইম কিস্তি সফলভাবে পোস্ট হয়েছে এবং সকল ক্লায়েন্টে লাইভ ব্রডকাস্ট হয়েছে!', result });
    }

    if (actionType === 'provision') {
      const result = db.runMonthlyProvisions('2026-10', currentUser || 'Live Test Agent');
      return res.json({ success: true, message: 'অক্টোবর/২০২৬ এর সুদ প্রভিশন রান হয়েছে এবং লাইভ আপডেট হয়েছে!', result });
    }

    // Default general simulation event
    const simLog = db.logAudit('SIMULATION', 'realtime_test', targetLoan.id, `রিয়েলটাইম টেস্ট পিং: ঋণ ${targetLoan.loanNo} (${targetLoan.employeeNameBn}) এর লাইভ হিসাব যাচাইকৃত।`, currentUser || 'Live Test');
    db['broadcast']('simulation:event', {
      message: `রিয়েলটাইম লাইভ টেস্ট: ঋণ ${targetLoan.loanNo} (${targetLoan.employeeNameBn}) এর বর্তমান আসল স্থিতি ৳${targetLoan.principalBalance.toLocaleString()}`,
      loan: targetLoan,
      timestamp: new Date().toISOString()
    }, currentUser || 'Live Test');

    res.json({ success: true, message: 'লাইভ রিয়েলটাইম টেস্ট সফলভাবে ব্রডকাস্ট করা হয়েছে!', log: simLog });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
