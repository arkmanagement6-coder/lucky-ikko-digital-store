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
    const { amount, planName, payerName, payerEmail, payerMobile, env } = body || {};

    if (!amount || !payerName || !payerEmail || !payerMobile) {
      return res.status(400).json({ error: 'Please fill out your Name, Email, and Mobile number.' });
    }

    const clientCode = 'ARKM1';
    const authKey = 'sp_P4FN07lSTKNxqbLdT2SN5ZvKCzBTxasI0PgsMaM7_Og';
    const authIV = 'sec_C-0PTD_nPJ2Q4j7JDGDqhmqQLYyNEXTLkiJgp_dAAMU';
    
    // SabPaisa clientTxnId must be 10-18 alphanumeric characters
    const clientTxnId = ('AK' + Date.now()).substring(0, 15);
    const transDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

    const host = req.headers.host || 'lucky-ikko-digital-store.vercel.app';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const callbackUrl = `${protocol}://${host}/services.html?payment=complete`;

    // Construct SabPaisa plain request string
    const requestStr = `payerName=${payerName.trim()}&payerEmail=${payerEmail.trim()}&payerMobile=${payerMobile.trim()}&clientTxnId=${clientTxnId}&amount=${amount}&clientCode=${clientCode}&transUserName=${clientCode}&transUserPassword=${authIV}&callbackUrl=${callbackUrl}&channelId=W&transDate=${transDate}`;

    // AES-256-CBC Encryption using authKey (32 bytes) as Key and authIV (16 bytes) as IV
    const key = Buffer.from(authKey.padEnd(32, '0').substring(0, 32), 'utf8');
    const iv = Buffer.from(authIV.padEnd(16, '0').substring(0, 16), 'utf8');

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encData = cipher.update(requestStr, 'utf8', 'hex');
    encData += cipher.final('hex');

    const targetUrl = env === 'stage'
      ? 'https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1'
      : 'https://securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1';

    return res.status(200).json({
      success: true,
      action: targetUrl,
      params: {
        clientCode: clientCode,
        encData: encData
      }
    });

  } catch (err) {
    console.error('SabPaisa Backend Error:', err);
    return res.status(500).json({ error: err.message || 'Payment initiation failed' });
  }
};
