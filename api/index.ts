import type { Request, Response } from 'express';
import express from 'express';

const app = express();
app.use(express.json());

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_studentplug_mock_secret_key';

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'StudentPlug NG Vercel API',
    time: new Date().toISOString(),
  });
});

// Paystack payment initialization
app.post('/api/paystack/initialize', async (req: Request, res: Response) => {
  try {
    const { amount, email, orderId, orderNumber, metadata } = req.body;
    if (!amount || !email) {
      res.status(400).json({ success: false, error: 'Amount and email are required.' });
      return;
    }

    const amountInKobo = Math.round(Number(amount) * 100);
    const reference = `SP_PSTK_${Date.now()}_${Math.floor(100000 + Math.random() * 900000)}`;

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
          metadata: { orderId, orderNumber, ...metadata },
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
      }
      res.status(400).json({ success: false, error: data.message || 'Paystack initialization failed.' });
      return;
    }

    res.json({
      success: true,
      reference,
      access_code: `mock_access_${Date.now()}`,
      authorization_url: `https://checkout.paystack.com/mock/${reference}`,
      mode: 'sandbox_simulated',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Payment initialization error.' });
  }
});

// Paystack payment verification
app.post('/api/paystack/verify', async (req: Request, res: Response) => {
  try {
    const { reference, expectedAmount } = req.body;
    if (!reference) {
      res.status(400).json({ success: false, error: 'Payment reference is required.' });
      return;
    }

    if (process.env.PAYSTACK_SECRET_KEY && !process.env.PAYSTACK_SECRET_KEY.includes('mock')) {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      });
      const data: any = await response.json();
      if (data.status && data.data.status === 'success') {
        const verifiedAmountKobo = data.data.amount;
        const verifiedAmountNaira = verifiedAmountKobo / 100;
        res.json({
          success: true,
          status: 'Successful',
          reference: data.data.reference,
          amount: verifiedAmountNaira,
          channel: data.data.channel || 'card',
          paidAt: data.data.paid_at,
          mode: 'live_verified',
        });
        return;
      }
      res.status(400).json({ success: false, error: data.message || 'Verification failed.' });
      return;
    }

    if (reference.startsWith('SP_') || reference.startsWith('PSTK_') || reference.startsWith('TEST_')) {
      res.json({
        success: true,
        status: 'Successful',
        reference,
        amount: expectedAmount || 0,
        channel: 'card',
        paidAt: new Date().toISOString(),
        mode: 'sandbox_verified',
      });
      return;
    }

    res.status(400).json({ success: false, error: 'Invalid transaction reference.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Verification error.' });
  }
});

export default app;
