// ==========================================================
// SSC Note Box — Google Authenticator (TOTP RFC 6238) Service
// 100% standard TOTP compatible with Google Authenticator,
// Microsoft Authenticator, Authy, etc.
// ==========================================================

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Decode Base32 string to Uint8Array
function base32Decode(base32: string): Uint8Array {
  const clean = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_CHARS.indexOf(clean[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(output);
}

// Encode Uint8Array to Base32 string
export function base32Encode(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }

  return output;
}

// Generate a random 16-character Base32 secret for Google Authenticator
export function generateTotpSecret(): string {
  const randomBytes = new Uint8Array(10);
  crypto.getRandomValues(randomBytes);
  return base32Encode(randomBytes);
}

// Compute 6-digit TOTP code for a specific time step
async function computeCodeForStep(keyBytes: Uint8Array, step: number): Promise<string> {
  const counterBuffer = new ArrayBuffer(8);
  const counterView = new DataView(counterBuffer);
  // Big-endian 64-bit integer
  counterView.setUint32(4, step, false);

  const keyBuffer = new Uint8Array(keyBytes).buffer as ArrayBuffer;

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, counterBuffer);
  const hash = new Uint8Array(signature);

  // Dynamic truncation (RFC 4226)
  const offset = hash[hash.length - 1] & 0x0f;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

// Verify a 6-digit TOTP code with time drift window tolerance (+/- 1 step = 30 seconds)
export async function verifyTotpCode(secret: string, code: string, window = 1): Promise<boolean> {
  const cleanCode = code.trim();
  if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
    return false;
  }

  const keyBytes = base32Decode(secret);
  if (keyBytes.length === 0) return false;

  const currentStep = Math.floor(Date.now() / 1000 / 30);

  for (let offset = -window; offset <= window; offset++) {
    const validCode = await computeCodeForStep(keyBytes, currentStep + offset);
    if (validCode === cleanCode) {
      return true;
    }
  }

  return false;
}

// Generate standard otpauth URL for Google Authenticator QR Code
export function getOtpAuthUrl(secret: string, email = 'jahidulislamg.b.123@gmail.com'): string {
  const label = encodeURIComponent(`SSC Note Box:${email}`);
  const issuer = encodeURIComponent('SSC Note Box');
  return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
}

// Generate Google Chart QR code image URL for instant camera scanning
export function getQrCodeImageUrl(otpAuthUrl: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(otpAuthUrl)}`;
}
