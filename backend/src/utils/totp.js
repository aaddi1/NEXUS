const crypto = require('crypto');
const qrcode = require('qrcode');

const B32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buffer) {
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += B32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += B32_CHARS[(value << (5 - bits)) & 31];
  }
  return output;
}

function base32Decode(input) {
  let cleaned = String(input || '').toUpperCase().replace(/=+$/, '');
  let bits = 0;
  let value = 0;
  let output = [];
  for (let i = 0; i < cleaned.length; i++) {
    let idx = B32_CHARS.indexOf(cleaned[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(output);
}

function generateSecret(length = 20) {
  return base32Encode(crypto.randomBytes(length));
}

function generateTOTP(secret, timeStep = Math.floor(Date.now() / 1000 / 30)) {
  const key = base32Decode(secret);
  const timeBuf = Buffer.alloc(8);
  timeBuf.writeBigInt64BE(BigInt(timeStep), 0);

  const hmac = crypto.createHmac('sha1', key).update(timeBuf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = ((hmac[offset] & 0x7f) << 24) |
               ((hmac[offset + 1] & 0xff) << 16) |
               ((hmac[offset + 2] & 0xff) << 8) |
               (hmac[offset + 3] & 0xff);

  return (code % 1000000).toString().padStart(6, '0');
}

function verifyTOTP(secret, token, window = 1) {
  if (!secret || !token) return false;
  const cleanedToken = String(token).trim().replace(/\s+/g, '');
  const currentStep = Math.floor(Date.now() / 1000 / 30);

  for (let i = -window; i <= window; i++) {
    if (generateTOTP(secret, currentStep + i) === cleanedToken) {
      return true;
    }
  }
  return false;
}

function generateOtpAuthUri(accountEmail, secret, issuer = 'NEXUS') {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(accountEmail);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

async function generateQrCodeDataUrl(otpAuthUri) {
  return qrcode.toDataURL(otpAuthUri, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 200,
    color: {
      dark: '#0D1116',
      light: '#FFFFFF'
    }
  });
}

function generateBackupCodes(count = 6) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
}

module.exports = {
  generateSecret,
  generateTOTP,
  verifyTOTP,
  generateOtpAuthUri,
  generateQrCodeDataUrl,
  generateBackupCodes
};
