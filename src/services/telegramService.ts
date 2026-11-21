// ==========================================================
// SSC Notes Hub — Telegram Real-time Notification Service
// Sends instant alerts to Owner (Jahidul) for:
// 1. New visitors entering the website
// 2. Students uploading notes (with download/view link)
// 3. User reports & system activities
// ==========================================================

const DEFAULT_TG_BOT_TOKEN = '9085137422:AAEL2cARMm8261zH30awUJHQm_lfmmOdlSY';
const DEFAULT_TG_CHAT_ID = '5856234447';

export const TG_STORAGE_KEYS = {
  TOKEN: 'ssc_hub_tg_token',
  CHAT_ID: 'ssc_hub_tg_chat_id',
  VISITOR_SESSION: 'ssc_hub_tg_visitor_notified_v1'
};

export function getTelegramCredentials(): { botToken: string; chatId: string } {
  const envToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
  const envChatId = import.meta.env.VITE_TELEGRAM_CHAT_ID || '';

  const localToken = typeof window !== 'undefined' ? localStorage.getItem(TG_STORAGE_KEYS.TOKEN) || '' : '';
  const localChatId = typeof window !== 'undefined' ? localStorage.getItem(TG_STORAGE_KEYS.CHAT_ID) || '' : '';

  const botToken = localToken.trim() || envToken.trim() || DEFAULT_TG_BOT_TOKEN;
  const chatId = localChatId.trim() || envChatId.trim() || DEFAULT_TG_CHAT_ID;

  return { botToken, chatId };
}

export function saveTelegramCredentials(botToken: string, chatId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TG_STORAGE_KEYS.TOKEN, botToken.trim());
    localStorage.setItem(TG_STORAGE_KEYS.CHAT_ID, chatId.trim());
  }
}

// Low-level sender via Telegram Bot API
async function sendTelegramMessage(htmlText: string): Promise<boolean> {
  const { botToken, chatId } = getTelegramCredentials();
  if (!botToken || !chatId) {
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
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
    return data.ok === true;
  } catch (err) {
    console.warn("Telegram notification error:", err);
    return false;
  }
}

function getDhakaTime(): string {
  try {
    return new Date().toLocaleString('bn-BD', {
      timeZone: 'Asia/Dhaka',
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  } catch {
    return new Date().toLocaleString();
  }
}

function detectDevice(): string {
  if (typeof window === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) return '📱 Mobile';
  if (/ipad|tablet/i.test(ua)) return '📱 Tablet';
  return '💻 Desktop / PC';
}

export const telegramService = {
  // Test bot connectivity
  async sendTestMessage(): Promise<{ ok: boolean; message: string }> {
    const time = getDhakaTime();
    const html = `✅ <b>SSC Notes Hub — টেস্ট নোটিফিকেশন</b>\n\n` +
      `জাহিদুল ইসলাম, আপনার টেলিগ্রাম বট সফলভাবে কানেক্ট হয়েছে!\n` +
      `⏰ <b>সময়:</b> ${time}\n` +
      `🌐 <b>স্ট্যাটাস:</b> সক্রিয় (Active)`;

    const ok = await sendTelegramMessage(html);
    return {
      ok,
      message: ok 
        ? "সফলভাবে টেলিগ্রামে মেসেজ পাঠানো হয়েছে!" 
        : "মেসেজ পাঠানো যায়নি। নিশ্চিত করুন আপনি Telegram-এ বটটিতে গিয়ে /start চাপ দিয়েছেন।"
    };
  },

  // 1. Notify Owner when someone enters the website
  async notifyVisitor(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Throttle per session so 1 user visiting multiple tabs doesn't spam
    const alreadyNotified = sessionStorage.getItem(TG_STORAGE_KEYS.VISITOR_SESSION);
    if (alreadyNotified) return;
    sessionStorage.setItem(TG_STORAGE_KEYS.VISITOR_SESSION, 'true');

    const time = getDhakaTime();
    const device = detectDevice();
    const screenRes = `${window.screen.width}x${window.screen.height}`;
    const pagePath = window.location.pathname + window.location.search;
    const referrer = document.referrer ? new URL(document.referrer).hostname : 'Direct / সরাসরি';

    // Fast IP & City lookup (non-blocking)
    let ipInfo = '';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const ipRes = await fetch('https://ipapi.co/json/', { signal: controller.signal });
      clearTimeout(timeoutId);
      if (ipRes.ok) {
        const d = await ipRes.json();
        const city = d.city || '';
        const country = d.country_name || '';
        const org = d.org || '';
        ipInfo = `\n📍 <b>স্থান:</b> ${city ? city + ', ' : ''}${country} (${d.ip || ''})\n🏢 <b>নেটওয়ার্ক:</b> ${org}`;
      }
    } catch {
      // Continue without IP if blocked or timeout
    }

    const html = `🌐 <b>নতুন ভিজিটর ওয়েবসাইটে প্রবেশ করেছে!</b>\n\n` +
      `⏰ <b>সময়:</b> ${time}\n` +
      `📱 <b>ডিভাইস:</b> ${device}\n` +
      `🖥️ <b>স্ক্রিন:</b> ${screenRes}\n` +
      `🔗 <b>পেইজ:</b> <code>${pagePath || '/'}</code>\n` +
      `🌐 <b>উৎস (Referrer):</b> ${referrer}` +
      ipInfo;

    sendTelegramMessage(html);
  },

  // 2. Notify Owner when a student uploads a note
  async notifyNoteUpload(note: {
    title: string;
    studentName: string;
    schoolName?: string;
    rollNumber?: string;
    section?: string;
    subjectId: string;
    chapterId: string;
    fileURL: string;
    fileType: string;
    fileSize?: string;
    description?: string;
  }): Promise<void> {
    const time = getDhakaTime();

    const html = `📚 <b>নতুন নোট আপলোড হয়েছে!</b>\n\n` +
      `👤 <b>শিক্ষার্থীর নাম:</b> <b>${escapeHtml(note.studentName)}</b>\n` +
      `🏫 <b>বিদ্যালয়:</b> ${escapeHtml(note.schoolName || 'দেওয়া হয়নি')}\n` +
      `🏷️ <b>রোল/শাখা:</b> রোল: ${note.rollNumber || '—'}, শাখা: ${note.section || '—'}\n` +
      `📖 <b>বিষয়:</b> <code>${escapeHtml(note.subjectId)}</code> (অধ্যায়: ${escapeHtml(note.chapterId)})\n` +
      `📝 <b>নোটের নাম:</b> <b>${escapeHtml(note.title)}</b>\n` +
      (note.description ? `💬 <b>বিবরণ:</b> <i>${escapeHtml(note.description)}</i>\n` : '') +
      `📄 <b>ফাইল:</b> ${note.fileType} (${note.fileSize || 'Unknown'})\n` +
      `⏰ <b>সময়:</b> ${time}\n\n` +
      `🔗 <a href="${note.fileURL}"><b>নোটের ফাইল দেখুন / ডাউনলোড করুন</b></a>`;

    sendTelegramMessage(html);
  },

  // 3. Notify Owner when someone submits a report
  async notifyReport(report: {
    noteId: string;
    reason: string;
    description?: string;
    reporterName?: string;
    reporterContact?: string;
  }): Promise<void> {
    const time = getDhakaTime();

    const html = `⚠️ <b>একটি নোট রিপোর্ট করা হয়েছে!</b>\n\n` +
      `📝 <b>নোট আইডি:</b> <code>${escapeHtml(report.noteId)}</code>\n` +
      `📌 <b>কারণ:</b> <b>${escapeHtml(report.reason)}</b>\n` +
      (report.description ? `💬 <b>বিবরণ:</b> ${escapeHtml(report.description)}\n` : '') +
      (report.reporterName ? `👤 <b>রিপোর্টার:</b> ${escapeHtml(report.reporterName)} (${escapeHtml(report.reporterContact || '')})\n` : '') +
      `⏰ <b>সময়:</b> ${time}`;

    sendTelegramMessage(html);
  },

  // 4. Notify Owner when Owner panel is accessed
  async notifyAdminAccess(user: string): Promise<void> {
    const time = getDhakaTime();
    const device = detectDevice();

    const html = `🛡️ <b>এডমিন প্যানেলে লগইন হয়েছে!</b>\n\n` +
      `👤 <b>ইউজার:</b> <code>${escapeHtml(user)}</code>\n` +
      `📱 <b>ডিভাইস:</b> ${device}\n` +
      `⏰ <b>সময়:</b> ${time}`;

    sendTelegramMessage(html);
  }
};

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
