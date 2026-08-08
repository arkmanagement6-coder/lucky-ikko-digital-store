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
      return res.status(400).json({ error: 'Please fill out your Name, Email, and Mobile number.' });
    }

    const clientCode = 'ARKM1';
    const apiKey = 'sp_P4FN07lSTKNxqbLdT2SN5ZvKCzBTxasI0PgsMaM7_Og';
    const secretKey = 'sec_C-0PTD_nPJ2Q4j7JDGDqhmqQLYyNEXTLkiJgp_dAAMU';
    
    const merchantTxnId = ('AK' + Date.now()).substring(0, 15);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const amountInPaise = Math.round(parseFloat(amount) * 100);

    const host = req.headers.host || 'lucky-ikko-digital-store.vercel.app';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const returnUrl = `${protocol}://${host}/services.html?payment=complete`;

    // SabPaisa PG 3.0 HMAC-SHA256 Checksum
    const checksumMessage = `${clientCode}|${merchantTxnId}|${amountInPaise}|INR|${timestamp}`;
    const checksum = crypto
      .createHmac('sha256', secretKey)
      .update(checksumMessage)
      .digest('hex');

    const payload = {
      merchantId: clientCode,
      merchantTxnId: merchantTxnId,
      amount: amountInPaise,
      currency: 'INR',
      customerName: payerName.trim(),
      customerEmail: payerEmail.trim(),
      customerPhone: payerMobile.trim(),
      returnUrl: returnUrl,
      timestamp: timestamp,
      checksum: checksum
    };

    // Official SabPaisa PG 3.0 Payment Creation API
    const response = await fetch('https://merchant-api.sabpaisa.in/api/v2/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
        'X-Merchant-Id': clientCode
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data && data.success && data.checkoutUrl) {
      let finalCheckoutUrl = data.checkoutUrl;
      if (data.clientSecret && !finalCheckoutUrl.includes('clientSecret=')) {
        finalCheckoutUrl += (finalCheckoutUrl.includes('?') ? '&' : '?') + 'clientSecret=' + encodeURIComponent(data.clientSecret);
      }

      return res.status(200).json({
        success: true,
        checkoutUrl: finalCheckoutUrl
      });
    }

    if (data && data.error) {
      const errMsg = typeof data.error === 'string' ? data.error : (data.error.message || 'SabPaisa validation failed');
      return res.status(400).json({ error: errMsg, details: data.error });
    }

    return res.status(500).json({ error: 'Failed to generate checkout session' });

  } catch (err) {
    console.error('SabPaisa Backend Error:', err);
    return res.status(500).json({ error: err.message || 'Payment initiation failed' });
  }
};
