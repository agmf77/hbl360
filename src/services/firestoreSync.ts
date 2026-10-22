import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Loan, Employee, Repayment, Provision, BankAdvice, PbsSettings, UserSession } from '../types';

export class FirestoreSyncService {
  // Sync or save user profile to Firestore
  static async syncUserProfile(user: any): Promise<UserSession> {
    const path = `users/${user.uid}`;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userDocRef);

      const isBootstrappedAdmin = user.email === 'agmf.npbs1@gmail.com';
      const role = isBootstrappedAdmin ? 'admin' : (snap.exists() ? snap.data().role : 'accounts');
      const payId = snap.exists() ? snap.data().payId || '0102' : '0102';

      const profileData = {
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL || '',
        role,
        payId,
        createdAt: snap.exists() ? snap.data().createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(userDocRef, profileData, { merge: true });

      // Also ensure /admins document exists for bootstrapped admin
      if (isBootstrappedAdmin) {
        try {
          await setDoc(doc(db, 'admins', user.uid), {
            email: user.email,
            assignedAt: new Date().toISOString()
          }, { merge: true });
        } catch {
          // Non-fatal
        }
      }

      return {
        id: user.uid,
        payId,
        nameBn: user.displayName || (isBootstrappedAdmin ? 'নাজমুন নাহার (এজিএম অর্থ-হিসাব)' : 'হিসাব কর্মকর্তা'),
        nameEn: user.displayName || user.email || 'PBS Official',
        role,
        designation: isBootstrappedAdmin ? 'এজিএম (অর্থ-হিসাব)' : 'হিসাব কর্মকর্তা',
        department: 'অর্থ ও হিসাব শাখা'
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  // Seed Firestore if empty when user is authenticated
  static async seedIfEmpty(initialData: {
    employees: Employee[];
    loans: Loan[];
    settings: PbsSettings;
  }) {
    // Only attempt Firestore seed if an authenticated user is present
    if (!auth.currentUser) {
      return;
    }

    try {
      const loansSnap = await getDocs(collection(db, 'loans'));
      if (loansSnap.empty) {
        for (const loan of initialData.loans) {
          await setDoc(doc(db, 'loans', loan.id), loan);
        }
        for (const emp of initialData.employees) {
          await setDoc(doc(db, 'employees', emp.id), emp);
        }
        await setDoc(doc(db, 'settings', 'main'), initialData.settings);
        console.log('[Firestore] Successfully seeded initial PBS loan data to Firestore.');
      }
    } catch (err) {
      console.warn('[Firestore] Seed notice:', err);
    }
  }

  // Push all existing state to Firestore once user signs in
  static async syncAllToFirestore(data: {
    loans: Loan[];
    repayments: Repayment[];
    provisions: Provision[];
    bankAdvices: BankAdvice[];
    settings: PbsSettings;
  }) {
    if (!auth.currentUser) return;
    try {
      for (const loan of data.loans) {
        await setDoc(doc(db, 'loans', loan.id), loan);
      }
      for (const rep of data.repayments) {
        await setDoc(doc(db, 'repayments', rep.id), rep);
      }
      for (const prov of data.provisions) {
        await setDoc(doc(db, 'provisions', prov.id), prov);
      }
      for (const adv of data.bankAdvices) {
        await setDoc(doc(db, 'bankAdvices', adv.id), adv);
      }
      await setDoc(doc(db, 'settings', 'main'), data.settings);
      console.log('[Firestore] Synced active records to Firestore cloud database.');
    } catch (err) {
      console.warn('[Firestore] Sync all notice:', err);
    }
  }

  // Save Loan to Firestore
  static async saveLoan(loan: Loan) {
    if (!auth.currentUser) return;
    const path = `loans/${loan.id}`;
    try {
      await setDoc(doc(db, 'loans', loan.id), loan);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  // Save Repayment to Firestore and update Loan balance
  static async saveRepayment(repayment: Repayment, updatedLoan: Loan) {
    if (!auth.currentUser) return;
    const repPath = `repayments/${repayment.id}`;
    const loanPath = `loans/${updatedLoan.id}`;
    try {
      await setDoc(doc(db, 'repayments', repayment.id), repayment);
      await setDoc(doc(db, 'loans', updatedLoan.id), updatedLoan);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${repPath} & ${loanPath}`);
    }
  }

  // Save Multiple Repayments (Batch) to Firestore and update Loan balance
  static async saveMultiRepayments(repayments: Repayment[], updatedLoan: Loan) {
    if (!auth.currentUser) return;
    try {
      for (const repayment of repayments) {
        await setDoc(doc(db, 'repayments', repayment.id), repayment);
      }
      await setDoc(doc(db, 'loans', updatedLoan.id), updatedLoan);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `batch repayments & loans/${updatedLoan.id}`);
    }
  }

  // Save Provision to Firestore
  static async saveProvision(provision: Provision, updatedLoan?: Loan) {
    if (!auth.currentUser) return;
    const path = `provisions/${provision.id}`;
    try {
      await setDoc(doc(db, 'provisions', provision.id), provision);
      if (updatedLoan) {
        await setDoc(doc(db, 'loans', updatedLoan.id), updatedLoan);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  // Save Bank Advice to Firestore
  static async saveBankAdvice(advice: BankAdvice) {
    if (!auth.currentUser) return;
    const path = `bankAdvices/${advice.id}`;
    try {
      await setDoc(doc(db, 'bankAdvices', advice.id), advice);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  // Save Settings to Firestore
  static async saveSettings(settings: PbsSettings) {
    if (!auth.currentUser) return;
    const path = 'settings/main';
    try {
      await setDoc(doc(db, 'settings', 'main'), settings);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  // Subscribe to Realtime Firestore Collections
  static subscribeLoans(onUpdate: (loans: Loan[]) => void, onError?: (err: any) => void) {
    if (!auth.currentUser) return () => {};
    const path = 'loans';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Loan));
        onUpdate(items);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  }

  static subscribeRepayments(onUpdate: (repayments: Repayment[]) => void, onError?: (err: any) => void) {
    if (!auth.currentUser) return () => {};
    const path = 'repayments';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Repayment));
        onUpdate(items);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  }

  static subscribeProvisions(onUpdate: (provisions: Provision[]) => void, onError?: (err: any) => void) {
    if (!auth.currentUser) return () => {};
    const path = 'provisions';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Provision));
        onUpdate(items);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  }

  static subscribeBankAdvices(onUpdate: (advices: BankAdvice[]) => void, onError?: (err: any) => void) {
    if (!auth.currentUser) return () => {};
    const path = 'bankAdvices';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as BankAdvice));
        onUpdate(items);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  }
}
