import express from 'express';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, increment } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());

// Read Firebase Config safely
const configPath = path.resolve('./firebase-applet-config.json');
let firebaseConfig: any = {};
if (fs.existsSync(configPath)) {
  try {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (e) {
    console.error('Error reading firebase-applet-config.json:', e);
  }
}

// Initialize Firebase
const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// Seed initial B2B licenses
async function seedB2BLicenses() {
  try {
    const defaultLicenses = [
      { id: 'ENGLISHFIRST2026', code: 'ENGLISHFIRST2026', institutionName: 'English First (EF)', maxUses: 500, currentUses: 0, status: 'active', createdAt: new Date().toISOString() },
      { id: 'BIMBELVIP2026', code: 'BIMBELVIP2026', institutionName: 'Bimbel Bahasa Inggris VIP', maxUses: 200, currentUses: 0, status: 'active', createdAt: new Date().toISOString() },
      { id: 'DIGLOSAB2B', code: 'DIGLOSAB2B', institutionName: 'Lisensi Mitra Kursus Diglosa', maxUses: 1000, currentUses: 0, status: 'active', createdAt: new Date().toISOString() }
    ];
    for (const lic of defaultLicenses) {
      const ref = doc(db, 'b2b_licenses', lic.id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, lic);
      }
    }
  } catch (e) {
    console.error('B2B seed error:', e);
  }
}
seedB2BLicenses();

// API Routes
app.post('/api/payment/create', async (req, res) => {
  try {
    const { email, paymentMethod, amount = 49000 } = req.body;
    const txId = 'DIG-PAY-' + Math.floor(100000 + Math.random() * 900000);
    const vipCode = 'DIG-VIP-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
    
    const purchaseData = {
      vipCode,
      email: email || 'pembeli@diglosa.com',
      paymentMethod: paymentMethod || 'qris',
      paymentAmount: amount,
      transactionId: txId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'vip_purchases', txId), purchaseData);

    const vaNumber = '88012' + Math.floor(100000000 + Math.random() * 900000000);

    res.json({
      success: true,
      transactionId: txId,
      vipCode,
      amount,
      paymentMethod,
      qrisUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021226580014ID.GO.QRIS.WWW01189360091430000000000215${txId}5204581253033605405490005802ID5915DIGLOSA%20OFFICIAL6007JAKARTA61051211062070703A016304C2B1`,
      vaNumber,
      bankName: paymentMethod === 'bank_transfer' ? 'Virtual Account Bank Central' : 'QRIS (All e-Wallet & m-Banking)'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/payment/sandbox-confirm', async (req, res) => {
  try {
    const { transactionId } = req.body;
    if (!transactionId) return res.status(400).json({ success: false, error: 'Transaction ID missing' });

    const ref = doc(db, 'vip_purchases', transactionId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return res.status(404).json({ success: false, error: 'Transaksi tidak ditemukan' });
    }

    const data = snap.data();
    await updateDoc(ref, { status: 'completed' });

    res.json({
      success: true,
      message: 'Pembayaran Berhasil Dikonfirmasi!',
      vipCode: data.vipCode,
      email: data.email
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/payment/webhook', async (req, res) => {
  try {
    const { order_id, transaction_status } = req.body;
    if (order_id) {
      const ref = doc(db, 'vip_purchases', order_id);
      if (transaction_status === 'settlement' || transaction_status === 'capture') {
        await updateDoc(ref, { status: 'completed' });
      } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
        await updateDoc(ref, { status: 'failed' });
      }
    }
    res.json({ status: 'ok' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/license/claim', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Kode lisensi harus diisi.' });

    const cleanCode = String(code).trim().toUpperCase();
    const ref = doc(db, 'b2b_licenses', cleanCode);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return res.status(404).json({ success: false, message: 'Kode Lisensi B2B tidak ditemukan. Periksa kembali ejaan kode Anda.' });
    }

    const lic = snap.data();
    if (lic.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Kode Lisensi sudah tidak aktif.' });
    }

    if (lic.currentUses >= lic.maxUses) {
      return res.status(400).json({ success: false, message: 'Batas kuota penggunaan Kode Lisensi ini sudah penuh.' });
    }

    await updateDoc(ref, { currentUses: increment(1) });

    res.json({
      success: true,
      message: `Selamat! Kode Lisensi B2B dari ${lic.institutionName} berhasil diaktivasi.`,
      institutionName: lic.institutionName,
      vipCode: cleanCode
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/license/restore', async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) return res.status(400).json({ success: false, message: 'Masukkan Email atau Kode VIP/Lisensi Anda.' });

    const inputKey = String(key).trim();

    // Check VIP purchases by VIP code or Email
    const qVipCode = query(collection(db, 'vip_purchases'), where('vipCode', '==', inputKey.toUpperCase()), where('status', '==', 'completed'));
    const snapCode = await getDocs(qVipCode);
    if (!snapCode.empty) {
      const docData = snapCode.docs[0].data();
      return res.json({ success: true, isVip: true, vipCode: docData.vipCode, email: docData.email, source: 'Pembelian VIP' });
    }

    const qEmail = query(collection(db, 'vip_purchases'), where('email', '==', inputKey.toLowerCase()), where('status', '==', 'completed'));
    const snapEmail = await getDocs(qEmail);
    if (!snapEmail.empty) {
      const docData = snapEmail.docs[0].data();
      return res.json({ success: true, isVip: true, vipCode: docData.vipCode, email: docData.email, source: 'Pembelian VIP' });
    }

    // Check B2B licenses
    const b2bRef = doc(db, 'b2b_licenses', inputKey.toUpperCase());
    const b2bSnap = await getDoc(b2bRef);
    if (b2bSnap.exists() && b2bSnap.data().status === 'active') {
      return res.json({ success: true, isVip: true, vipCode: inputKey.toUpperCase(), source: b2bSnap.data().institutionName });
    }

    res.status(404).json({ success: false, message: 'Tidak ditemukan riwayat transaksi atau kode lisensi aktif dengan data tersebut.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Serve Vite middleware & static files
async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;
  
  try {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } catch (err) {
    console.error('Vite middleware error, falling back to static:', err);
  }

  app.use(express.static('.'));
  app.use(express.static('dist'));

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Diglosa full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
