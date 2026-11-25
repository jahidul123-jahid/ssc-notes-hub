// ==========================================================
// SSC Note Box — Cloudflare Backend Service Adapter
// Connects frontend to Cloudflare Worker (D1 + R2 + Better Auth)
// ==========================================================

import { Note, NoteStatus, Report } from '../types';

export const CLOUDFLARE_STORAGE_KEYS = {
  API_URL: 'ssc_hub_cf_api_url',
  AUTH_TOKEN: 'ssc_hub_cf_auth_token'
};

// Default Cloudflare Worker URL or Vite env / localStorage
export function getCloudflareApiUrl(): string {
  const envUrl = import.meta.env.VITE_CLOUDFLARE_API_URL || '';
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(CLOUDFLARE_STORAGE_KEYS.API_URL);
    if (local && local.trim()) return local.trim();
  }
  return envUrl.trim();
}

export function saveCloudflareApiUrl(url: string): void {
  if (typeof window !== 'undefined') {
    if (url.trim()) {
      localStorage.setItem(CLOUDFLARE_STORAGE_KEYS.API_URL, url.trim());
    } else {
      localStorage.removeItem(CLOUDFLARE_STORAGE_KEYS.API_URL);
    }
  }
}

export function getCloudflareAuthToken(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(CLOUDFLARE_STORAGE_KEYS.AUTH_TOKEN) || '';
  }
  return '';
}

export function saveCloudflareAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(CLOUDFLARE_STORAGE_KEYS.AUTH_TOKEN, token);
    } else {
      localStorage.removeItem(CLOUDFLARE_STORAGE_KEYS.AUTH_TOKEN);
    }
  }
}

export const isCloudflareConfigured = (): boolean => {
  return Boolean(getCloudflareApiUrl());
};

export const cloudflareService = {
  // ---------------- NOTES ----------------
  async getNotes(status: NoteStatus | 'all' = 'approved', subjectId?: string, chapterId?: string): Promise<Note[]> {
    const baseUrl = getCloudflareApiUrl();
    if (!baseUrl) return [];

    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (subjectId) params.append('subject_id', subjectId);
    if (chapterId) params.append('chapter_id', chapterId);

    const res = await fetch(`${baseUrl}/api/notes?${params.toString()}`);
    if (!res.ok) throw new Error(`Cloudflare API error: ${res.status}`);

    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) return [];

    return json.data.map((row: any) => ({
      noteId: row.note_id,
      subjectId: row.subject_id,
      chapterId: row.chapter_id,
      title: row.title,
      description: row.description || '',
      studentName: row.student_name,
      rollNumber: row.roll_number || '',
      section: row.section || '',
      schoolName: row.school_name || '',
      whatsappNumber: row.whatsapp_number || '',
      fileURL: row.file_url,
      fileType: row.file_type,
      fileSize: row.file_size || '',
      pageCount: row.page_count || 1,
      downloadCount: row.download_count || 0,
      status: row.status as NoteStatus,
      createdAt: row.created_at
    }));
  },

  async getNoteById(noteId: string): Promise<Note | null> {
    const baseUrl = getCloudflareApiUrl();
    if (!baseUrl) return null;

    const res = await fetch(`${baseUrl}/api/notes/${encodeURIComponent(noteId)}`);
    if (!res.ok) return null;

    const json = await res.json();
    if (!json.success || !json.data) return null;

    const row = json.data;
    return {
      noteId: row.note_id,
      subjectId: row.subject_id,
      chapterId: row.chapter_id,
      title: row.title,
      description: row.description || '',
      studentName: row.student_name,
      rollNumber: row.roll_number || '',
      section: row.section || '',
      schoolName: row.school_name || '',
      whatsappNumber: row.whatsapp_number || '',
      fileURL: row.file_url,
      fileType: row.file_type,
      fileSize: row.file_size || '',
      pageCount: row.page_count || 1,
      downloadCount: row.download_count || 0,
      status: row.status as NoteStatus,
      createdAt: row.created_at
    };
  },

  // Upload file to Cloudflare R2
  async uploadFile(file: File, key?: string): Promise<{ fileUrl: string; key: string }> {
    const baseUrl = getCloudflareApiUrl();
    if (!baseUrl) throw new Error('Cloudflare API URL is not configured');

    const formData = new FormData();
    formData.append('file', file);

    const queryKey = key ? `?key=${encodeURIComponent(key)}` : '';
    const res = await fetch(`${baseUrl}/api/upload${queryKey}`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`R2 upload failed: ${err}`);
    }

    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Upload error');

    return { fileUrl: json.fileUrl, key: json.key };
  },

  // Create note in Cloudflare D1
  async createNote(noteData: any): Promise<Note> {
    const baseUrl = getCloudflareApiUrl();
    if (!baseUrl) throw new Error('Cloudflare API URL is not configured');

    const payload = {
      note_id: noteData.noteId,
      subject_id: noteData.subjectId,
      chapter_id: noteData.chapterId,
      title: noteData.title,
      description: noteData.description || '',
      student_name: noteData.studentName,
      roll_number: noteData.rollNumber || '',
      section: noteData.section || '',
      school_name: noteData.schoolName || '',
      whatsapp_number: noteData.whatsappNumber || '',
      file_url: noteData.fileURL,
      file_type: noteData.fileType || 'pdf',
      file_size: noteData.fileSize || '',
      page_count: noteData.pageCount || 1,
      status: noteData.status || 'pending'
    };

    const res = await fetch(`${baseUrl}/api/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`D1 note insert failed: ${err}`);
    }

    const json = await res.json();
    return json.data;
  },

  // Update note status
  async updateNoteStatus(noteId: string, status: NoteStatus): Promise<void> {
    const baseUrl = getCloudflareApiUrl();
    if (!baseUrl) return;

    await fetch(`${baseUrl}/api/notes/${encodeURIComponent(noteId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getCloudflareAuthToken()}`
      },
      body: JSON.stringify({ status })
    });
  },

  // Update note details
  async updateNote(noteId: string, updates: Partial<Note>): Promise<void> {
    const baseUrl = getCloudflareApiUrl();
    if (!baseUrl) return;

    const payload: any = {};
    if (updates.title) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.studentName) payload.student_name = updates.studentName;
    if (updates.schoolName !== undefined) payload.school_name = updates.schoolName;
    if (updates.status) payload.status = updates.status;

    await fetch(`${baseUrl}/api/notes/${encodeURIComponent(noteId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getCloudflareAuthToken()}`
      },
      body: JSON.stringify(payload)
    });
  },

  // Delete note
  async deleteNote(noteId: string): Promise<void> {
    const baseUrl = getCloudflareApiUrl();
    if (!baseUrl) return;

    await fetch(`${baseUrl}/api/notes/${encodeURIComponent(noteId)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getCloudflareAuthToken()}`
      }
    });
  },

  // Increment download count
  async incrementDownload(noteId: string): Promise<number> {
    const baseUrl = getCloudflareApiUrl();
    if (!baseUrl) return 1;

    try {
      const res = await fetch(`${baseUrl}/api/notes/${encodeURIComponent(noteId)}/download`, {
        method: 'POST'
      });
      if (res.ok) {
        const json = await res.json();
        return json.download_count || 1;
      }
    } catch {
      // fallback
    }
    return 1;
  },

  // ---------------- REPORTS ----------------
  async getReports(): Promise<Report[]> {
    const baseUrl = getCloudflareApiUrl();
    if (!baseUrl) return [];

    try {
      const res = await fetch(`${baseUrl}/api/reports`);
      if (res.ok) {
        const json = await res.json();
        return (json.data || []).map((row: any) => ({
          reportId: row.report_id,
          noteId: row.note_id,
          noteTitle: row.note_title,
          reason: row.reason,
          reasonText: row.reason_text,
          details: row.details,
          reportedAt: row.reported_at,
          status: row.status
        }));
      }
    } catch {
      // fallback
    }
    return [];
  },

  async submitReport(report: any): Promise<void> {
    const baseUrl = getCloudflareApiUrl();
    if (!baseUrl) return;

    await fetch(`${baseUrl}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        note_id: report.noteId,
        note_title: report.noteTitle,
        reason: report.reason,
        reason_text: report.reasonText,
        details: report.details
      })
    });
  },

  async resolveReport(reportId: string, status: 'resolved' | 'dismissed'): Promise<void> {
    const baseUrl = getCloudflareApiUrl();
    if (!baseUrl) return;

    await fetch(`${baseUrl}/api/reports/${encodeURIComponent(reportId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getCloudflareAuthToken()}`
      },
      body: JSON.stringify({ status })
    });
  },

  // ---------------- AUTHENTICATION ----------------
  async login(password: string, email?: string): Promise<{ success: boolean; token?: string; error?: string }> {
    const baseUrl = getCloudflareApiUrl();
    if (!baseUrl) throw new Error('Cloudflare API URL is not configured');

    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email || 'jahidulislamg.b.123@gmail.com',
        password
      })
    });

    const json = await res.json();
    if (json.success && json.token) {
      saveCloudflareAuthToken(json.token);
      return { success: true, token: json.token };
    }
    return { success: false, error: json.error || 'লগইন ব্যর্থ হয়েছে।' };
  },

  async logout(): Promise<void> {
    const baseUrl = getCloudflareApiUrl();
    const token = getCloudflareAuthToken();
    if (baseUrl && token) {
      try {
        await fetch(`${baseUrl}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch {
        // ignore
      }
    }
    saveCloudflareAuthToken('');
  }
};
