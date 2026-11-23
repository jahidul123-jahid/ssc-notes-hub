// ==========================================================
// SSC Note Box — Telegram Real-time Notification Service
// Dedicated Dual Bot System:
// 1. Visitor Alert Bot (@note_book_note_bot) — Notifies on website visits
// 2. Note Upload Bot (@note_submit_bot) — Notifies on student note uploads
// ==========================================================

const DEFAULT_TG_BOT_TOKEN = '9085137422:AAEL2cARMm8261zH30awUJHQm_lfmmOdlSY'; // Visitor Bot
const DEFAULT_TG_UPLOAD_BOT_TOKEN = '9259492359:AAEZeBBh-eLKp4tGPLiaH5Q-KSoNW8GXK_Y'; // Note Upload Bot
const DEFAULT_TG_CHAT_ID = '5856234447';

export const TG_STORAGE_KEYS = {
  TOKEN: 'ssc_hub_tg_token', // Visitor Bot Token
  UPLOAD_TOKEN: 'ssc_hub_tg_upload_token', // Note Upload Bot Token
  CHAT_ID: 'ssc_hub_tg_chat_id',
  VISITOR_SESSION: 'ssc_hub_tg_visitor_notified_v2',
  VISIT_COUNTER: 'ssc_hub_visitor_counter_v1'
};

export function getTelegramCredentials(): {
  botToken: string;
  uploadBotToken: string;
  chatId: string;
} {
  const envToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
  const envUploadToken = import.meta.env.VITE_TELEGRAM_UPLOAD_BOT_TOKEN || '';
  const envChatId = import.meta.env.VITE_TELEGRAM_CHAT_ID || '';

  const localToken = typeof window !== 'undefined' ? localStorage.getItem(TG_STORAGE_KEYS.TOKEN) || '' : '';
  const localUploadToken = typeof window !== 'undefined' ? localStorage.getItem(TG_STORAGE_KEYS.UPLOAD_TOKEN) || '' : '';
  const localChatId = typeof window !== 'undefined' ? localStorage.getItem(TG_STORAGE_KEYS.CHAT_ID) || '' : '';

  const botToken = localToken.trim() || envToken.trim() || DEFAULT_TG_BOT_TOKEN;
  const uploadBotToken = localUploadToken.trim() || envUploadToken.trim() || DEFAULT_TG_UPLOAD_BOT_TOKEN;
  const chatId = localChatId.trim() || envChatId.trim() || DEFAULT_TG_CHAT_ID;

  return { botToken, uploadBotToken, chatId };
}

export function saveTelegramCredentials(botToken: string, chatId: string, uploadBotToken?: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TG_STORAGE_KEYS.TOKEN, botToken.trim());
    localStorage.setItem(TG_STORAGE_KEYS.CHAT_ID, chatId.trim());
    if (uploadBotToken !== undefined) {
      localStorage.setItem(TG_STORAGE_KEYS.UPLOAD_TOKEN, uploadBotToken.trim());
    }
  }
}

// Low-level sender via Telegram Bot API with botType support ('visitor' | 'upload')
async function sendTelegramMessage(
  htmlText: string,
  botType: 'visitor' | 'upload' = 'visitor'
): Promise<{ ok: boolean; description?: string }> {
  const { botToken, uploadBotToken, chatId } = getTelegramCredentials();
  const tokenToUse = botType === 'upload' ? uploadBotToken : botToken;

  if (!tokenToUse || !chatId) {
    return { ok: false, description: 'টোকেন অথবা চ্যাট আইডি কনফিগার করা নেই' };
  }

  try {
    const url = `https://api.telegram.org/bot${tokenToUse}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: htmlText,
        parse_mode: 'HTML',
        disable_web_page_preview: false
      }),
      keepalive: true
    });

    const data = await res.json();
    return { ok: data.ok === true, description: data.description };
  } catch (err: any) {
    console.warn("Telegram notification error:", err);
    return { ok: false, description: err?.message || 'নেটওয়ার্ক এরর' };
  }
}

function getFormattedTime(): string {
  try {
    return new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return new Date().toLocaleString();
  }
}

function detectDevice(): string {
  if (typeof window === 'undefined') return 'Desktop PC / Laptop';
  const ua = navigator.userAgent;
  if (/ipad|tablet/i.test(ua)) return 'Tablet Device';
  if (/mobile|android|iphone/i.test(ua)) return 'Mobile Device';
  return 'Desktop PC / Laptop';
}

function detectBrand(): string {
  if (typeof window === 'undefined') return 'Generic';
  const ua = navigator.userAgent;

  if (/iphone/i.test(ua)) return 'Apple (iPhone)';
  if (/ipad/i.test(ua)) return 'Apple (iPad)';
  if (/macintosh/i.test(ua)) return 'Apple (Macintosh)';

  // Samsung detection
  const samsungMatch = ua.match(/SM-[A-Z0-9]+/i);
  if (samsungMatch) return `Samsung (${samsungMatch[0]})`;
  if (/samsung/i.test(ua)) return 'Samsung';

  // Popular Android brands
  if (/xiaomi|redmi|poco/i.test(ua)) return 'Xiaomi / Redmi';
  if (/oneplus/i.test(ua)) return 'OnePlus';
  if (/oppo/i.test(ua)) return 'OPPO';
  if (/vivo/i.test(ua)) return 'Vivo';
  if (/realme/i.test(ua)) return 'Realme';
  if (/pixel/i.test(ua)) return 'Google Pixel';
  if (/huawei/i.test(ua)) return 'Huawei';
  if (/motorola|moto/i.test(ua)) return 'Motorola';

  if (/windows/i.test(ua)) return 'PC (Windows)';
  if (/linux/i.test(ua)) return 'PC (Linux)';
  if (/mobile/i.test(ua)) return 'Generic (Mobile)';
  return 'Generic Device';
}

function detectOS(): string {
  if (typeof window === 'undefined') return 'Unknown OS';
  const ua = navigator.userAgent;

  // Android
  const androidMatch = ua.match(/Android\s([0-9.]+)/i);
  if (androidMatch) return `Android ${androidMatch[1]}`;

  // iOS
  const iosMatch = ua.match(/OS\s([0-9_]+)/i);
  if (iosMatch && /iphone|ipad/i.test(ua)) {
    return `iOS ${iosMatch[1].replace(/_/g, '.')}`;
  }

  // Windows
  if (/Windows NT 10.0/i.test(ua)) return 'Windows 10 / 11';
  if (/Windows NT 6.3/i.test(ua)) return 'Windows 8.1';
  if (/Windows NT 6.2/i.test(ua)) return 'Windows 8';
  if (/Windows NT 6.1/i.test(ua)) return 'Windows 7';

  // Mac
  const macMatch = ua.match(/Mac OS X\s([0-9_]+)/i);
  if (macMatch) return `macOS ${macMatch[1].replace(/_/g, '.')}`;

  if (/CrOS/i.test(ua)) return 'Chrome OS';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Unknown OS';
}

function detectBrowser(): string {
  if (typeof window === 'undefined') return 'Web Browser';
  const ua = navigator.userAgent;

  if (/edg/i.test(ua)) return 'Microsoft Edge';
  if (/samsungbrowser/i.test(ua)) return 'Samsung Internet';
  if (/opr|opera/i.test(ua)) return 'Opera';
  if (/chrome|crios/i.test(ua)) return 'Google Chrome';
  if (/firefox|fxios/i.test(ua)) return 'Mozilla Firefox';
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
  if (/ucbrowser/i.test(ua)) return 'UC Browser';
  return 'Web Browser';
}

function detectHardwareGPU(): string {
  if (typeof window === 'undefined') return 'Standard GPU / Software';
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (renderer) return String(renderer).replace(/Angle \((.+)\)/i, '$1');
      }
    }
  } catch {
    // ignore
  }
  return 'Standard GPU / Software';
}

function detectNetwork(): string {
  if (typeof window === 'undefined') return '4G';
  try {
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (conn) {
      return (conn.effectiveType || conn.type || '4G').toUpperCase();
    }
  } catch {
    // ignore
  }
  return '4G';
}

export const telegramService = {
  // Test bot connectivity (visitor or upload bot)
  async sendTestMessage(botType: 'visitor' | 'upload' = 'visitor'): Promise<{ ok: boolean; message: string }> {
    const time = getFormattedTime();
    const botName = botType === 'upload' ? 'নোট আপলোড বট (@note_submit_bot)' : 'ভিজিটর ট্র্যাকিং বট (@note_book_note_bot)';
    const html = `✅ <b>SSC Note Box — টেস্ট নোটিফিকেশন</b>\n\n` +
      `জাহিদুল ইসলাম, আপনার ${botName} সফলভাবে কানেক্ট হয়েছে!\n` +
      `⏰ <b>সময়:</b> ${time}\n` +
      `🌐 <b>স্ট্যাটাস:</b> সক্রিয় (Active)`;

    const res = await sendTelegramMessage(html, botType);
    if (res.ok) {
      return {
        ok: true,
        message: `সফলভাবে ${botName}-এ টেস্ট মেসেজ পাঠানো হয়েছে!`
      };
    }

    if (res.description?.includes('chat not found')) {
      const botLink = botType === 'upload' ? 'https://t.me/note_submit_bot' : 'https://t.me/note_book_note_bot';
      const botUser = botType === 'upload' ? '@note_submit_bot' : '@note_book_note_bot';
      return {
        ok: false,
        message: `মেসেজ পাঠানো যায়নি কারণ টেলিগ্রামে এই বটটি এখনো শুরু করা হয়নি। দয়া করে Telegram-এ যান: ${botUser} (${botLink}) এবং START চাপুন।`
      };
    }

    return {
      ok: false,
      message: `মেসেজ পাঠানো যায়নি: ${res.description || 'টোকেন বা সংযোগ চেক করুন'}`
    };
  },

  // 1. Rich visitor notification — sends ONLY to the Visitor Alert Bot (@note_book_note_bot)
  async notifyVisitor(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Prevent flooding from the same tab reload
    const alreadyNotified = sessionStorage.getItem(TG_STORAGE_KEYS.VISITOR_SESSION);
    if (alreadyNotified) return;
    sessionStorage.setItem(TG_STORAGE_KEYS.VISITOR_SESSION, 'true');

    // Calculate persistent visitor counter
    let visitCount = 1;
    try {
      const current = parseInt(localStorage.getItem(TG_STORAGE_KEYS.VISIT_COUNTER) || '0', 10);
      visitCount = current + 1;
      localStorage.setItem(TG_STORAGE_KEYS.VISIT_COUNTER, visitCount.toString());
    } catch {
      // fallback
    }

    const device = detectDevice();
    const brand = detectBrand();
    const os = detectOS();
    const browser = detectBrowser();
    const pixelRatio = window.devicePixelRatio ? Math.round(window.devicePixelRatio * 100) / 100 : 1;
    const screen = `${window.screen.width} x ${window.screen.height} (@${pixelRatio}x)`;
    const hardware = detectHardwareGPU();
    const network = detectNetwork();
    const time = getFormattedTime();
    let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Dhaka';

    let location = 'Dhaka, Dhaka Division, Bangladesh';
    let isp = 'Internet Provider';
    let ip = 'Unknown IP';

    // Fast IP & Location lookup using ipwho.is (fast, no rate-limits, CORS-friendly)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch('https://ipwho.is/', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const d = await res.json();
        if (d.success) {
          ip = d.ip || ip;
          const city = d.city || '';
          const region = d.region || '';
          const country = d.country || '';
          location = [city, region, country].filter(Boolean).join(', ') || location;

          if (d.connection) {
            isp = d.connection.isp || d.connection.org || isp;
          }
          if (d.timezone?.id) {
            timezone = d.timezone.id;
          }
        }
      }
    } catch {
      // Fallback to ipify if ipwho fails
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          ip = ipData.ip || ip;
        }
      } catch {
        // ignore
      }
    }

    // Exact message template requested by user
    const html = `🔔 <b>New Website Visitor!</b>\n\n` +
      `📱 <b>Phone / Device:</b> ${device}\n` +
      `🏷 <b>Brand:</b> ${brand}\n` +
      `💻 <b>OS:</b> ${os}\n` +
      `📍 <b>Location:</b> ${location}\n` +
      `🏢 <b>ISP / Network:</b> ${isp}\n` +
      `🌐 <b>IP Address:</b> <code>${ip}</code>\n` +
      `🌐 <b>Browser:</b> ${browser}\n` +
      `📐 <b>Screen:</b> ${screen}\n` +
      `🎮 <b>Hardware:</b> ${hardware}\n` +
      `📶 <b>Network:</b> ${network}\n` +
      `⏰ <b>Time:</b> ${time}\n` +
      `🌍 <b>Timezone:</b> ${timezone}\n` +
      `🔁 <b>Visits:</b> ${visitCount}`;

    sendTelegramMessage(html, 'visitor');
  },

  // 2. Notify Owner when a student uploads a note — sends ONLY to Note Upload Bot (@note_submit_bot)
  async notifyNoteUpload(note: {
    title: string;
    studentName: string;
    schoolName?: string;
    rollNumber?: string;
    section?: string;
    whatsappNumber?: string;
    subjectId: string;
    chapterId: string;
    fileURL: string;
    fileType: string;
    fileSize?: string;
    description?: string;
  }): Promise<void> {
    const time = getFormattedTime();

    let waSection = '';
    if (note.whatsappNumber) {
      const cleanDigits = note.whatsappNumber.replace(/[^0-9]/g, '');
      const waNumber = cleanDigits.startsWith('880')
        ? cleanDigits
        : cleanDigits.startsWith('0')
        ? `88${cleanDigits}`
        : cleanDigits;
      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${note.studentName}, SSC Note Box-এ আপনার "${note.title}" নোট সংক্রান্ত:`)}`;
      waSection = `📱 <b>হোয়াটসঅ্যাপ নম্বর:</b> <code>${escapeHtml(note.whatsappNumber)}</code>\n` +
        `👉 <a href="${waUrl}"><b>শিক্ষার্থীকে WhatsApp এ মেসেজ দিন</b></a>\n`;
    }

    let extraDetails = '';
    if (note.section) {
      extraDetails += `🏷️ <b>বিভাগ:</b> ${escapeHtml(note.section)}\n`;
    }
    if (note.schoolName && note.schoolName !== 'দেওয়া হয়নি' && note.schoolName !== '—') {
      extraDetails += `🏫 <b>বিদ্যালয়:</b> ${escapeHtml(note.schoolName)}\n`;
    }
    if (note.rollNumber && note.rollNumber !== 'প্রযোজ্য নয়' && note.rollNumber !== '—') {
      extraDetails += `🔢 <b>রোল:</b> ${escapeHtml(note.rollNumber)}\n`;
    }

    const html = `📚 <b>নতুন নোট আপলোড হয়েছে!</b>\n\n` +
      `👤 <b>শিক্ষার্থীর নাম:</b> <b>${escapeHtml(note.studentName)}</b>\n` +
      waSection +
      extraDetails +
      `📖 <b>বিষয়:</b> <code>${escapeHtml(note.subjectId)}</code> (অধ্যায়: ${escapeHtml(note.chapterId)})\n` +
      `📝 <b>নোটের শিরোনাম:</b> <b>${escapeHtml(note.title)}</b>\n` +
      (note.description ? `💬 <b>বিবরণ:</b> <i>${escapeHtml(note.description)}</i>\n` : '') +
      `📄 <b>ফাইল:</b> ${note.fileType.toUpperCase()} (${note.fileSize || 'Unknown'})\n` +
      `⏰ <b>সময়:</b> ${time}\n\n` +
      `🔗 <a href="${note.fileURL}"><b>নোটের ফাইল দেখুন / ডাউনলোড করুন</b></a>`;

    sendTelegramMessage(html, 'upload');
  },

  // 3. Notify Owner when someone submits a report
  async notifyReport(report: {
    noteId: string;
    reason: string;
    description?: string;
    reporterName?: string;
    reporterContact?: string;
  }): Promise<void> {
    const time = getFormattedTime();

    const html = `⚠️ <b>একটি নোট রিপোর্ট করা হয়েছে!</b>\n\n` +
      `📝 <b>নোট আইডি:</b> <code>${escapeHtml(report.noteId)}</code>\n` +
      `📌 <b>কারণ:</b> <b>${escapeHtml(report.reason)}</b>\n` +
      (report.description ? `💬 <b>বিবরণ:</b> ${escapeHtml(report.description)}\n` : '') +
      (report.reporterName ? `👤 <b>রিপোর্টার:</b> ${escapeHtml(report.reporterName)} (${escapeHtml(report.reporterContact || '')})\n` : '') +
      `⏰ <b>সময়:</b> ${time}`;

    sendTelegramMessage(html, 'upload');
  },

  // 4. Notify Owner when Owner panel is accessed
  async notifyAdminAccess(user: string): Promise<void> {
    const time = getFormattedTime();
    const device = detectDevice();

    const html = `🛡️ <b>এডমিন প্যানেলে লগইন হয়েছে!</b>\n\n` +
      `👤 <b>ইউজার:</b> <code>${escapeHtml(user)}</code>\n` +
      `📱 <b>ডিভাইস:</b> ${device}\n` +
      `⏰ <b>সময়:</b> ${time}`;

    sendTelegramMessage(html, 'upload');
  }
};

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
