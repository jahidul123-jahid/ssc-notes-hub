import { Subject, Chapter, Note, Report, WebsiteStats, NoteStatus, FileType } from '../types';
import { INITIAL_SUBJECTS, INITIAL_CHAPTERS, INITIAL_NOTES } from '../data/initialData';
import { db, storage, isFirebaseConfigured } from '../firebase/config';
import { getSupabaseClient } from '../supabase/config';
import { telegramService } from './telegramService';
import { googleSheetService } from './googleSheetService';
import { convertImageToPdf, convertImagesToPdf } from '../utils/pdfConverter';
import { dataEvents } from './dataEvents';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  increment
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const STORAGE_KEYS = {
  SUBJECTS: 'ssc_hub_subjects_nctb_2027_v2',
  CHAPTERS: 'ssc_hub_chapters_nctb_2027_v2',
  NOTES: 'ssc_hub_notes_nctb_2027_v2',
  REPORTS: 'ssc_hub_reports_nctb_2027_v2'
};

// Initialize LocalStorage with fresh NCTB verified data and clean notes
function initializeLocalStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.SUBJECTS)) {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(INITIAL_SUBJECTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CHAPTERS)) {
    localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(INITIAL_CHAPTERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTES)) {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(INITIAL_NOTES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([]));
  }
}

initializeLocalStorage();

export const dataService = {
  // ================= SUBJECTS =================
  async getSubjects(group?: string): Promise<Subject[]> {
    let list: Subject[] = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'subjects'));
        if (!snap.empty) {
          list = snap.docs.map(d => d.data() as Subject);
        }
      } catch (err) {
        console.warn("Firestore subjects fetch fallback:", err);
      }
    }
    if (list.length === 0) {
      const local = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      list = local ? JSON.parse(local) : INITIAL_SUBJECTS;
    }
    if (group && group !== 'all') {
      return list.filter(s => s.group === group);
    }
    return list;
  },

  async addSubject(subject: Subject): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'subjects', subject.subjectId), subject);
      } catch (e) {
        console.error("Firestore addSubject error:", e);
      }
    }
    const subjects = await this.getSubjects();
    subjects.push(subject);
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
    dataEvents.emit({ type: 'subjects', action: 'create', id: subject.subjectId, data: subject });
  },

  async updateSubject(subjectId: string, updates: Partial<Subject>): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'subjects', subjectId), updates);
      } catch (e) {
        console.error("Firestore updateSubject error:", e);
      }
    }
    const subjects = await this.getSubjects();
    const idx = subjects.findIndex(s => s.subjectId === subjectId);
    if (idx !== -1) {
      subjects[idx] = { ...subjects[idx], ...updates };
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
      dataEvents.emit({ type: 'subjects', action: 'update', id: subjectId, data: updates });
    }
  },

  async deleteSubject(subjectId: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'subjects', subjectId));
      } catch (e) {
        console.error("Firestore deleteSubject error:", e);
      }
    }
    const subjects = await this.getSubjects();
    const filtered = subjects.filter(s => s.subjectId !== subjectId);
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(filtered));
    dataEvents.emit({ type: 'subjects', action: 'delete', id: subjectId });
  },

  // ================= CHAPTERS =================
  async getChapters(subjectId?: string): Promise<Chapter[]> {
    let list: Chapter[] = [];
    if (isFirebaseConfigured && db) {
      try {
        const q = subjectId
          ? query(collection(db, 'chapters'), where('subjectId', '==', subjectId))
          : collection(db, 'chapters');
        const snap = await getDocs(q);
        if (!snap.empty) {
          list = snap.docs.map(d => d.data() as Chapter);
        }
      } catch (err) {
        console.warn("Firestore chapters fetch fallback:", err);
      }
    }
    if (list.length === 0) {
      const local = localStorage.getItem(STORAGE_KEYS.CHAPTERS);
      const all: Chapter[] = local ? JSON.parse(local) : INITIAL_CHAPTERS;
      list = subjectId ? all.filter(c => c.subjectId === subjectId) : all;
    }
    return list.sort((a, b) => a.chapterNumber - b.chapterNumber);
  },

  async addChapter(chapter: Chapter): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'chapters', chapter.chapterId), chapter);
      } catch (e) {
        console.error("Firestore addChapter error:", e);
      }
    }
    const chapters = await this.getChapters();
    chapters.push(chapter);
    localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(chapters));
    dataEvents.emit({ type: 'chapters', action: 'create', id: chapter.chapterId, data: chapter });
  },

  async updateChapter(chapterId: string, updates: Partial<Chapter>): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'chapters', chapterId), updates);
      } catch (e) {
        console.error("Firestore updateChapter error:", e);
      }
    }
    const chapters = await this.getChapters();
    const idx = chapters.findIndex(c => c.chapterId === chapterId);
    if (idx !== -1) {
      chapters[idx] = { ...chapters[idx], ...updates };
      localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(chapters));
      dataEvents.emit({ type: 'chapters', action: 'update', id: chapterId, data: updates });
    }
  },

  async deleteChapter(chapterId: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'chapters', chapterId));
      } catch (e) {
        console.error("Firestore deleteChapter error:", e);
      }
    }
    const chapters = await this.getChapters();
    const filtered = chapters.filter(c => c.chapterId !== chapterId);
    localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(filtered));
    dataEvents.emit({ type: 'chapters', action: 'delete', id: chapterId });
  },

  // ================= NOTES =================
  async getNotes(status: NoteStatus | 'all' = 'approved', subjectId?: string, chapterId?: string): Promise<Note[]> {
    let list: Note[] = [];

    // 1. First priority: Live Supabase Cloud Database (everyone sees uploads from any device)
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let sbQuery = supabase.from('notes').select('*').neq('status', 'deleted');
        if (status !== 'all') {
          sbQuery = sbQuery.eq('status', status);
        }
        if (subjectId) {
          sbQuery = sbQuery.eq('subject_id', subjectId);
        }
        if (chapterId) {
          sbQuery = sbQuery.eq('chapter_id', chapterId);
        }
        const { data, error } = await sbQuery.order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          list = data.map((row: any) => ({
            noteId: row.note_id,
            subjectId: row.subject_id,
            chapterId: row.chapter_id,
            title: row.title,
            description: row.description || '',
            studentName: row.student_name,
            rollNumber: row.roll_number || '',
            section: row.section || '',
            schoolName: row.school_name || '',
            whatsappNumber: row.whatsapp_number || row.whatsappNumber || '',
            fileURL: row.file_url,
            fileType: row.file_type,
            fileSize: row.file_size || '',
            pageCount: row.page_count || 1,
            downloadCount: row.download_count || 0,
            status: row.status as NoteStatus,
            createdAt: row.created_at
          }));
        }
      } catch (err) {
        console.warn("Supabase getNotes fallback:", err);
      }
    }

    // 2. Second priority: Firebase Firestore
    if (list.length === 0 && isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'notes'));
        if (!snap.empty) {
          list = snap.docs.map(d => d.data() as Note);
        }
      } catch (err) {
        console.warn("Firestore notes fetch fallback:", err);
      }
    }

    // 3. Fallback: LocalStorage & Default Verified Curriculum notes
    if (list.length === 0) {
      const local = localStorage.getItem(STORAGE_KEYS.NOTES);
      list = local ? JSON.parse(local) : INITIAL_NOTES;
    }

    // Filter out deleted notes
    list = list.filter(n => (n.status as any) !== 'deleted');
    if (status !== 'all') {
      list = list.filter(n => n.status === status);
    }
    if (subjectId) {
      list = list.filter(n => n.subjectId === subjectId);
    }
    if (chapterId) {
      list = list.filter(n => n.chapterId === chapterId);
    }
    return list;
  },

  async getNoteById(noteId: string): Promise<Note | null> {
    const all = await this.getNotes('all');
    return all.find(n => n.noteId === noteId) || null;
  },

  async uploadNote(
    noteData: Omit<Note, 'noteId' | 'fileURL' | 'createdAt' | 'status' | 'downloadCount'>,
    file: File | File[],
    onProgress?: (progress: number) => void
  ): Promise<Note> {
    const noteId = `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    let fileURL = '';

    // Convert image(s) (PNG/JPG/WEBP) to PDF automatically so everything on website is standardized as clean PDF
    let actualFile: File;
    let actualFileType: FileType = noteData.fileType;
    let actualPageCount = noteData.pageCount || 1;

    if (Array.isArray(file)) {
      if (file.length === 0) {
        throw new Error('কোনো ফাইল নির্বাচন করা হয়নি।');
      }
      if (file.length === 1 && !file[0].type.startsWith('image/')) {
        actualFile = file[0];
        actualFileType = (file[0].name.split('.').pop()?.toLowerCase() || 'pdf') as FileType;
      } else {
        if (onProgress) onProgress(15);
        actualFile = await convertImagesToPdf(file, noteData.title, (p) => {
          if (onProgress) onProgress(15 + Math.round(p * 0.35));
        });
        actualFileType = 'pdf';
        actualPageCount = file.length;
      }
    } else {
      actualFile = file;
      actualFileType = noteData.fileType;
      if (file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp'].includes(file.name.split('.').pop()?.toLowerCase() || '')) {
        try {
          if (onProgress) onProgress(20);
          actualFile = await convertImageToPdf(file);
          actualFileType = 'pdf';
          actualPageCount = 1;
        } catch (err) {
          console.warn("Image to PDF conversion skipped, using original:", err);
        }
      }
    }

    const calculatedSize = `${(actualFile.size / (1024 * 1024)).toFixed(1)} MB`;

    // 1. Live Supabase Storage (Upload real file to Supabase public bucket)
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        if (onProgress) onProgress(30);
        const storagePath = `${noteId}_${actualFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

        const { data: upData, error: upErr } = await supabase.storage
          .from('notes')
          .upload(storagePath, actualFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (!upErr && upData) {
          const { data: pubData } = supabase.storage
            .from('notes')
            .getPublicUrl(storagePath);
          if (pubData?.publicUrl) {
            fileURL = pubData.publicUrl;
            if (onProgress) onProgress(80);
          }
        } else if (upErr) {
          console.warn("Supabase bucket upload warning:", upErr);
        }
      } catch (err) {
        console.warn("Supabase storage upload error:", err);
      }
    }

    // 2. If live Firebase Storage is configured, upload the binary file
    if (!fileURL && isFirebaseConfigured && storage) {
      try {
        const storageRef = ref(storage, `notes/${noteId}_${actualFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, actualFile);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              if (onProgress) onProgress(Math.round(progress));
            },
            (err) => reject(err),
            async () => {
              fileURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      } catch (err) {
        console.warn("Firebase Storage upload fallback:", err);
      }
    }

    // 3. Fallback URL for client preview
    if (!fileURL) {
      fileURL = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(URL.createObjectURL(actualFile));
        reader.readAsDataURL(actualFile);
      });
      if (onProgress) onProgress(100);
    }

    const newNote: Note = {
      ...noteData,
      noteId,
      fileURL,
      fileType: actualFileType,
      fileSize: noteData.fileSize || calculatedSize,
      pageCount: actualPageCount,
      createdAt: new Date().toISOString(),
      status: 'pending',
      downloadCount: 0
    };

    // Save to Supabase 'notes' table with pending status for Admin moderation
    if (supabase) {
      try {
        await supabase.from('notes').insert({
          note_id: noteId,
          subject_id: noteData.subjectId,
          chapter_id: noteData.chapterId,
          title: noteData.title,
          description: noteData.description || '',
          student_name: noteData.studentName,
          roll_number: noteData.rollNumber || '',
          section: noteData.section || '',
          school_name: noteData.schoolName || '',
          whatsapp_number: noteData.whatsappNumber || '',
          file_url: fileURL,
          file_type: actualFileType,
          file_size: newNote.fileSize,
          page_count: actualPageCount,
          download_count: 0,
          status: 'pending',
          created_at: newNote.createdAt
        });
      } catch (err) {
        console.warn("Supabase notes insert error:", err);
      }
    }

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'notes', noteId), newNote);
      } catch (e) {
        console.error("Firestore note save error:", e);
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.NOTES);
    const notes: Note[] = local ? JSON.parse(local) : [];
    notes.unshift(newNote);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));

    // Send instant Telegram notification to Jahidul
    telegramService.notifyNoteUpload(newNote).catch((err) => {
      console.warn("Telegram note upload notification failed:", err);
    });

    // Send note upload details automatically to Google Sheet
    googleSheetService.appendNoteRow(newNote).catch((err) => {
      console.warn("Google Sheet note sync error:", err);
    });

    dataEvents.emit({ type: 'notes', action: 'create', id: newNote.noteId, data: newNote });

    return newNote;
  },

  async updateNoteStatus(noteId: string, status: NoteStatus): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('notes').update({ status }).eq('note_id', noteId);
      } catch (err) {
        console.warn("Supabase updateNoteStatus error:", err);
      }
    }

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'notes', noteId), { status });
      } catch (e) {
        console.error("Firestore updateNoteStatus error:", e);
      }
    }
    const local = localStorage.getItem(STORAGE_KEYS.NOTES);
    const notes: Note[] = local ? JSON.parse(local) : [];
    const idx = notes.findIndex(n => n.noteId === noteId);
    if (idx !== -1) {
      notes[idx].status = status;
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    }
    dataEvents.emit({ type: 'notes', action: 'update', id: noteId, data: { status } });
  },

  async updateNote(noteId: string, updates: Partial<Note>): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const sbUpdates: any = {};
        if (updates.title) sbUpdates.title = updates.title;
        if (updates.description !== undefined) sbUpdates.description = updates.description;
        if (updates.studentName) sbUpdates.student_name = updates.studentName;
        if (updates.schoolName !== undefined) sbUpdates.school_name = updates.schoolName;
        if (updates.status) sbUpdates.status = updates.status;
        await supabase.from('notes').update(sbUpdates).eq('note_id', noteId);
      } catch (err) {
        console.warn("Supabase updateNote error:", err);
      }
    }

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'notes', noteId), updates);
      } catch (e) {
        console.error("Firestore updateNote error:", e);
      }
    }
    const local = localStorage.getItem(STORAGE_KEYS.NOTES);
    const notes: Note[] = local ? JSON.parse(local) : [];
    const idx = notes.findIndex(n => n.noteId === noteId);
    if (idx !== -1) {
      notes[idx] = { ...notes[idx], ...updates };
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    }
    dataEvents.emit({ type: 'notes', action: 'update', id: noteId, data: updates });
  },

  async deleteNote(noteId: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        // 1. Mark as deleted in Supabase so getNotes will never return it
        await supabase.from('notes').update({ status: 'deleted' }).eq('note_id', noteId);
        // 2. Also execute hard delete if policy allows
        await supabase.from('notes').delete().eq('note_id', noteId);
      } catch (err) {
        console.warn("Supabase deleteNote error:", err);
      }
    }

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'notes', noteId));
      } catch (e) {
        console.error("Firestore deleteNote error:", e);
      }
    }
    const local = localStorage.getItem(STORAGE_KEYS.NOTES);
    const notes: Note[] = local ? JSON.parse(local) : [];
    const filtered = notes.filter(n => n.noteId !== noteId);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(filtered));
    dataEvents.emit({ type: 'notes', action: 'delete', id: noteId });
  },

  async incrementDownload(noteId: string): Promise<number> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data } = await supabase.from('notes').select('download_count').eq('note_id', noteId).single();
        if (data) {
          await supabase.from('notes').update({ download_count: (data.download_count || 0) + 1 }).eq('note_id', noteId);
        }
      } catch (err) {
        console.warn("Supabase incrementDownload error:", err);
      }
    }

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'notes', noteId), {
          downloadCount: increment(1)
        });
      } catch (e) {
        console.warn("Firestore incrementDownload failed:", e);
      }
    }
    const local = localStorage.getItem(STORAGE_KEYS.NOTES);
    const notes: Note[] = local ? JSON.parse(local) : [];
    const idx = notes.findIndex(n => n.noteId === noteId);
    let count = 1;
    if (idx !== -1) {
      notes[idx].downloadCount = (notes[idx].downloadCount || 0) + 1;
      count = notes[idx].downloadCount;
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    }
    dataEvents.emit({ type: 'notes', action: 'update', id: noteId, data: { downloadCount: count } });
    return count;
  },

  // ================= REPORTS =================
  async submitReport(reportData: Omit<Report, 'reportId' | 'reportedAt' | 'status'>): Promise<Report> {
    const reportId = `report-${Date.now()}`;
    const report: Report = {
      ...reportData,
      reportId,
      reportedAt: new Date().toISOString(),
      status: 'pending'
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'reports', reportId), report);
      } catch (e) {
        console.error("Firestore submitReport error:", e);
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.REPORTS);
    const reports: Report[] = local ? JSON.parse(local) : [];
    reports.unshift(report);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));

    // Send instant Telegram report alert to Jahidul
    telegramService.notifyReport(report).catch((err) => {
      console.warn("Telegram report notification failed:", err);
    });

    dataEvents.emit({ type: 'reports', action: 'create', id: report.reportId, data: report });

    return report;
  },

  async getReports(): Promise<Report[]> {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'reports'));
        if (!snap.empty) {
          return snap.docs.map(d => d.data() as Report);
        }
      } catch (err) {
        console.warn("Firestore reports fetch fallback:", err);
      }
    }
    const local = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return local ? JSON.parse(local) : [];
  },

  async resolveReport(reportId: string, status: 'resolved' | 'dismissed'): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'reports', reportId), { status });
      } catch (e) {
        console.error("Firestore resolveReport error:", e);
      }
    }
    const reports = await this.getReports();
    const idx = reports.findIndex(r => r.reportId === reportId);
    if (idx !== -1) {
      reports[idx].status = status;
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    }
    dataEvents.emit({ type: 'reports', action: 'update', id: reportId, data: { status } });
  },

  // ================= DYNAMIC STATISTICS =================
  async getStats(): Promise<WebsiteStats> {
    const subjects = await this.getSubjects();
    const allNotes = await this.getNotes('all');
    const reports = await this.getReports();

    const approvedNotes = allNotes.filter(n => n.status === 'approved');
    const pendingNotes = allNotes.filter(n => n.status === 'pending');

    const uniqueContributors = new Set(
      allNotes.map(n => `${n.studentName.trim().toLowerCase()}_${n.schoolName.trim().toLowerCase()}`)
    ).size;

    const totalDownloads = allNotes.reduce((sum, n) => sum + (n.downloadCount || 0), 0);

    return {
      totalSubjects: subjects.length,
      totalNotes: approvedNotes.length,
      totalContributors: uniqueContributors,
      totalDownloads: totalDownloads,
      pendingNotesCount: pendingNotes.length,
      reportsCount: reports.filter(r => r.status === 'pending').length
    };
  },

  // Completely reset & purge old content to verified NCTB database
  async resetToNctbCurriculum(): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(INITIAL_SUBJECTS));
    localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(INITIAL_CHAPTERS));
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([]));

    if (isFirebaseConfigured && db) {
      try {
        for (const sub of INITIAL_SUBJECTS) {
          await setDoc(doc(db, 'subjects', sub.subjectId), sub);
        }
        for (const chap of INITIAL_CHAPTERS) {
          await setDoc(doc(db, 'chapters', chap.chapterId), chap);
        }
      } catch (err) {
        console.error("Firebase curriculum batch sync error:", err);
      }
    }
    dataEvents.emit({ type: 'subjects', action: 'update' });
    dataEvents.emit({ type: 'chapters', action: 'update' });
    dataEvents.emit({ type: 'notes', action: 'update' });
  }
};

/**
 * Initializes live Supabase Realtime synchronization across browsers and devices.
 * When an admin approves or deletes a note anywhere, all connected clients automatically
 * update without pressing manual page reload.
 */
let realtimeChannel: any = null;
export function initSupabaseRealtime() {
  if (realtimeChannel) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    realtimeChannel = supabase
      .channel('public:notes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        (payload) => {
          const action = payload.eventType === 'INSERT' ? 'create' : payload.eventType === 'DELETE' ? 'delete' : 'update';
          const newRow = payload.new as any;
          dataEvents.emit({
            type: 'notes',
            action,
            id: newRow?.note_id,
            data: newRow
          });
        }
      )
      .subscribe();
  } catch (err) {
    console.warn("Supabase Realtime subscription fallback:", err);
  }
}
