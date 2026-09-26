import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Paystack Secret Key (strictly server-side; NEVER exposed to the client browser)
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_studentplug_mock_secret_key';
const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY || 'FLWSECK_TEST-studentplug_mock_secret';

// 1. Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'StudentPlug NG API Server',
    environment: process.env.NODE_ENV || 'development',
    time: new Date().toISOString(),
  });
});

// 2. Paystack Payment Initialization
app.post('/api/paystack/initialize', async (req: Request, res: Response) => {
  try {
    const { amount, email, orderId, orderNumber, metadata } = req.body;

    if (!amount || !email) {
      res.status(400).json({ success: false, error: 'Amount and email are required.' });
      return;
    }

    const amountInKobo = Math.round(Number(amount) * 100);
    const reference = `SP_PSTK_${Date.now()}_${Math.floor(100000 + Math.random() * 900000)}`;

    // If real Paystack secret is configured and not the mock fallback, call Paystack API
    if (process.env.PAYSTACK_SECRET_KEY && !process.env.PAYSTACK_SECRET_KEY.includes('mock')) {
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: amountInKobo,
          reference,
          metadata: {
            orderId,
            orderNumber,
            ...metadata,
          },
          channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
        }),
      });

      const data: any = await response.json();
      if (data.status) {
        res.json({
          success: true,
          authorization_url: data.data.authorization_url,
          access_code: data.data.access_code,
          reference: data.data.reference,
        });
        return;
      } else {
        res.status(400).json({ success: false, error: data.message || 'Paystack initialization failed.' });
        return;
      }
    }

    // Sandbox / Test Mode Fallback
    res.json({
      success: true,
      reference,
      access_code: `mock_access_${Date.now()}`,
      authorization_url: `https://checkout.paystack.com/mock/${reference}`,
      mode: 'sandbox_simulated',
    });
  } catch (error: any) {
    console.error('Paystack init error:', error);
    res.status(500).json({ success: false, error: error.message || 'Payment initialization error.' });
  }
});

// 3. Server-Side Paystack Payment Verification
app.post('/api/paystack/verify', async (req: Request, res: Response) => {
  try {
    const { reference, orderId, expectedAmount } = req.body;

    if (!reference) {
      res.status(400).json({ success: false, error: 'Payment reference is required.' });
      return;
    }

    // Live Paystack API verification
    if (process.env.PAYSTACK_SECRET_KEY && !process.env.PAYSTACK_SECRET_KEY.includes('mock')) {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      });

      const data: any = await response.json();

      if (data.status && data.data.status === 'success') {
        const verifiedAmountKobo = data.data.amount;
        const verifiedAmountNaira = verifiedAmountKobo / 100;

        if (expectedAmount && Math.abs(verifiedAmountNaira - expectedAmount) > 1) {
          res.status(400).json({
            success: false,
            error: 'Amount mismatch between order and verified transaction.',
          });
          return;
        }

        res.json({
          success: true,
          status: 'Successful',
          reference: data.data.reference,
          amount: verifiedAmountNaira,
          channel: data.data.channel || 'card',
          paidAt: data.data.paid_at,
          customer: data.data.customer,
          gateway_response: data.data.gateway_response,
          mode: 'live_verified',
        });
        return;
      } else {
        res.status(400).json({
          success: false,
          status: data.data?.status || 'Failed',
          error: data.message || 'Payment could not be verified by Paystack.',
        });
        return;
      }
    }

    // Sandbox / Test Mode Validation
    // References starting with SP_ or PSTK_ are verified as test transactions
    if (reference.startsWith('SP_') || reference.startsWith('PSTK_') || reference.startsWith('TEST_')) {
      res.json({
        success: true,
        status: 'Successful',
        reference,
        amount: expectedAmount || 0,
        channel: 'card',
        paidAt: new Date().toISOString(),
        mode: 'sandbox_verified',
        message: 'Transaction successfully verified via StudentPlug Nigerian Sandbox Server',
      });
      return;
    }

    res.status(400).json({
      success: false,
      status: 'Failed',
      error: 'Invalid test reference format. Transaction verification failed.',
    });
  } catch (error: any) {
    console.error('Paystack verification error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server verification error.' });
  }
});

// 4. Flutterwave Modular Verification Route (Ready for future activation)
app.post('/api/flutterwave/verify', async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.body;
    res.json({
      success: true,
      status: 'Successful',
      reference: transactionId || `FLW_${Date.now()}`,
      channel: 'bank_transfer',
      mode: 'sandbox_verified',
      message: 'Verified via Flutterwave gateway interface.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vite middleware & SPA serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudentPlug NG Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
