const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Register API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/repayments', require('./routes/repayments'));
app.use('/api/provisions', require('./routes/provisions'));
app.use('/api/remittances', require('./routes/remittances'));
app.use('/api/transferred-loans', require('./routes/transferredLoans'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/recyclebin', require('./routes/recyclebin'));
app.use('/api/settings', require('./routes/settings'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'PBS House Loan Management System',
    timestamp: new Date().toISOString()
  });
});

// SPA fallback: send index.html for non-API routes
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'এপিআই এন্ডপয়েন্ট পাওয়া যায়নি।' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`পবিস কর্মকর্তা-কর্মচারী গৃহ ঋণ ব্যবস্থাপনা সিস্টেম`);
  console.log(`PBS House Loan Management System Server running on: http://localhost:${PORT}`);
  console.log(`Offline-ready SQLite DB loaded successfully.`);

  // Auto-sync monthly interest provisions for active loans
  try {
    const { autoSyncAllPendingProvisions } = require('./services/provisionService');
    const syncRes = autoSyncAllPendingProvisions();
    if (syncRes.totalProcessed > 0) {
      console.log(`[Auto-Provision] Synced ${syncRes.totalProcessed} loan provisions (${syncRes.totalInterestAdded} BDT) across months: ${syncRes.processedMonths.join(', ')}`);
    } else {
      console.log(`[Auto-Provision] All active loans are fully provisioned up to date.`);
    }
  } catch (err) {
    console.warn(`[Auto-Provision] Startup sync note:`, err.message);
  }

  console.log(`================================================================`);
  console.log(`ব্রাউজারে প্রবেশ করুন: http://localhost:${PORT}`);
  console.log(`================================================================`);

  // Automatically open default browser on Windows
  if (process.platform === 'win32' && !process.env.NO_AUTO_OPEN) {
    require('child_process').exec(`start http://localhost:${PORT}`);
  }
});
