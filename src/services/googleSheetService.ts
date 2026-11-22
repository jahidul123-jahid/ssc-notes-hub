// ==========================================================
// SSC Note Box — Google Sheets Real-time Data Sync Service
// Automatically appends note uploader details into Google Sheet
// ==========================================================

export const GOOGLE_SHEET_STORAGE_KEY = 'ssc_hub_google_sheet_webhook_url';

// Default Webhook URL or retrieved from Vite env / localStorage
export function getGoogleSheetWebhookUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(GOOGLE_SHEET_STORAGE_KEY);
    if (saved && saved.trim()) return saved.trim();
  }
  return import.meta.env.VITE_GOOGLE_SHEET_WEBHOOK_URL || '';
}

export function saveGoogleSheetWebhookUrl(url: string): void {
  if (typeof window !== 'undefined') {
    if (url.trim()) {
      localStorage.setItem(GOOGLE_SHEET_STORAGE_KEY, url.trim());
    } else {
      localStorage.removeItem(GOOGLE_SHEET_STORAGE_KEY);
    }
  }
}

export interface NoteSheetPayload {
  dateTime: string;
  studentName: string;
  whatsappNumber: string;
  rollNumber: string;
  section: string;
  schoolName: string;
  subject: string;
  chapter: string;
  title: string;
  fileSize: string;
  fileURL: string;
}

export const googleSheetService = {
  async appendNoteRow(note: {
    studentName: string;
    whatsappNumber?: string;
    rollNumber?: string;
    section?: string;
    schoolName?: string;
    subjectId: string;
    chapterId: string;
    title: string;
    fileSize?: string;
    fileURL: string;
  }): Promise<boolean> {
    const webhookUrl = getGoogleSheetWebhookUrl();
    if (!webhookUrl) {
      // Not configured yet, skip silently
      return false;
    }

    try {
      const timeStr = new Date().toLocaleString('bn-BD', {
        timeZone: 'Asia/Dhaka',
        dateStyle: 'medium',
        timeStyle: 'medium'
      });

      const payload: NoteSheetPayload = {
        dateTime: timeStr,
        studentName: note.studentName || '',
        whatsappNumber: note.whatsappNumber || '',
        rollNumber: note.rollNumber || 'প্রযোজ্য নয়',
        section: note.section || '',
        schoolName: note.schoolName || '',
        subject: note.subjectId || '',
        chapter: note.chapterId || '',
        title: note.title || '',
        fileSize: note.fileSize || '',
        fileURL: note.fileURL || ''
      };

      // Use fetch with no-cors or standard text mode to avoid Google Apps Script CORS redirection block
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      return true;
    } catch (err) {
      console.warn("Failed to append row to Google Sheet:", err);
      return false;
    }
  },

  async sendTestRow(): Promise<{ success: boolean; message: string }> {
    const webhookUrl = getGoogleSheetWebhookUrl();
    if (!webhookUrl) {
      return { success: false, message: 'দয়া করে আগে Google Apps Script Web App URL টি সেট করুন।' };
    }

    try {
      const timeStr = new Date().toLocaleString('bn-BD', {
        timeZone: 'Asia/Dhaka',
        dateStyle: 'medium',
        timeStyle: 'medium'
      });

      const payload: NoteSheetPayload = {
        dateTime: timeStr,
        studentName: 'টেস্ট শিক্ষার্থী (জাহিদুল)',
        whatsappNumber: '01700000000',
        rollNumber: '১০১',
        section: 'বিজ্ঞান',
        schoolName: 'নবীনগর সরকারি পাইলট উচ্চ বিদ্যালয়',
        subject: 'পদার্থবিজ্ঞান',
        chapter: 'গতি',
        title: 'টেস্ট নোট কানেকশন ভেরিফিকেশন',
        fileSize: '১.৫ MB',
        fileURL: 'https://sscnotebox.vercel.app'
      };

      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      return { success: true, message: 'Google Sheet-এ সফলভাবে টেস্ট ডাটা পাঠানো হয়েছে! শিটটি রিফ্রেশ করে চেক করুন।' };
    } catch (err: any) {
      return { success: false, message: `ত্রুটি: ${err.message || 'ডাটা পাঠানো যায়নি।'}` };
    }
  }
};
