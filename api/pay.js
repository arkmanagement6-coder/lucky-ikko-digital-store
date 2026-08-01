const crypto = require('crypto');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) {}
    }
    const { amount, planName, payerName, payerEmail, payerMobile } = body || {};

    if (!amount || !payerName || !payerEmail || !payerMobile) {
      return res.status(400).json({ error: 'Please enter Name, Email, and Mobile number.' });
    }

    const clientCode = 'ARKM1';
    const apiKey = 'sp_P4FN07lSTKNxqbLdT2SN5ZvKCzBTxasI0PgsMaM7_Og';
    const secretKey = 'sec_C-0PTD_nPJ2Q4j7JDGDqhmqQLYyNEXTLkiJgp_dAAMU';
    const clientTxnId = `ARKM1_TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const host = req.headers.host || 'lucky-ikko-digital-store.vercel.app';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const callbackUrl = `${protocol}://${host}/services.html?payment=complete`;

    const payload = {
      merchantId: clientCode,
      merchantTxnId: clientTxnId,
      amount: parseFloat(amount),
      currency: 'INR',
      customerName: payerName,
      customerEmail: payerEmail,
      customerPhone: payerMobile,
      productName: planName || 'ARK Digital Service Plan',
      callbackUrl: callbackUrl,
      timestamp: Math.floor(Date.now() / 1000)
    };

    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');

    // Attempt official SabPaisa PG 3.0 API
    try {
      const response = await fetch('https://txns.sabpaisa.in/api/v2/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey,
          'X-Merchant-Id': clientCode,
          'X-Signature': signature
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data && (data.checkoutUrl || data.redirectUrl || data.paymentUrl)) {
        return res.status(200).json({
          success: true,
          checkoutUrl: data.checkoutUrl || data.redirectUrl || data.paymentUrl
        });
      }
    } catch (apiErr) {
      console.log('PG 3.0 call attempted:', apiErr.message);
    }

    // Encrypt request for SabPaisa encData initiation
    const requestStr = `payerName=${payerName}&payerEmail=${payerEmail}&payerMobile=${payerMobile}&clientTxnId=${clientTxnId}&amount=${amount}&clientCode=${clientCode}&callbackUrl=${callbackUrl}`;
    
    const keyBuf = Buffer.from(secretKey.substring(0, 16).padEnd(16, '0'));
    const ivBuf = Buffer.from(secretKey.substring(0, 16).padEnd(16, '0'));

    const cipher = crypto.createCipheriv('aes-128-cbc', keyBuf, ivBuf);
    let encData = cipher.update(requestStr, 'utf8', 'hex');
    encData += cipher.final('hex');

    return res.status(200).json({
      success: true,
      action: 'https://securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1',
      params: {
        clientCode: clientCode,
        encData: encData
      }
    });

  } catch (err) {
    console.error('Payment API Error:', err);
    return res.status(500).json({ error: err.message || 'Payment initiation failed' });
  }
};
