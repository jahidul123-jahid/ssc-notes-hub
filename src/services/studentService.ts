/**
 * Persistent Student Identity and Registration Service
 * Ensures:
 * 1. Single persistent student identity (device-based for anonymous, auth-based for logged-in).
 * 2. Asks for student name ONLY ONCE on their very first examination attempt.
 * 3. Never asks again on subsequent attempts.
 * 4. Persists in localStorage and syncs with backend database (Cloudflare / Supabase).
 * 5. Allows student to update their display name anytime from Dashboard.
 */

import { getSupabaseClient } from '../supabase/config';
import { getCloudflareApiUrl, isCloudflareConfigured } from './cloudflareService';

export interface StudentProfile {
  studentId: string;
  name: string;
  rollNumber?: string;
  schoolName?: string;
  createdAt: string;
  updatedAt: string;
  isRegistered: boolean;
}

const STORAGE_KEYS = {
  PROFILE: 'ssc_student_profile_v1',
  DEVICE_ID: 'ssc_student_device_id_v1'
};

// Generate a random, privacy-respecting first-party device token (UUID-like)
function generateDeviceId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `dev_${crypto.randomUUID()}`;
  }
  return `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const studentService = {
  /**
   * Get or generate a persistent device ID without invasive fingerprinting
   */
  getDeviceId(): string {
    try {
      let devId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
      if (!devId) {
        devId = generateDeviceId();
        localStorage.setItem(STORAGE_KEYS.DEVICE_ID, devId);
      }
      return devId;
    } catch {
      return generateDeviceId();
    }
  },

  /**
   * Get stored student profile
   */
  getStudentProfile(): StudentProfile | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.name && parsed.name.trim().length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return null;
  },

  /**
   * Check if the student has already registered their name
   */
  hasRegisteredName(): boolean {
    const profile = this.getStudentProfile();
    return Boolean(profile && profile.name && profile.name.trim().length > 0);
  },

  /**
   * Get student name, or fallback if unregistered
   */
  getStudentName(): string {
    const profile = this.getStudentProfile();
    return profile?.name?.trim() || '';
  },

  /**
   * Get persistent student ID
   */
  getStudentId(): string {
    const profile = this.getStudentProfile();
    if (profile?.studentId) {
      return profile.studentId;
    }
    return this.getDeviceId();
  },

  /**
   * Register or update student name (One-time registration or settings update)
   */
  async registerStudentName(
    name: string,
    authenticatedUserId?: string,
    rollNumber = '',
    schoolName = ''
  ): Promise<StudentProfile> {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Student name cannot be empty');
    }

    const deviceId = this.getDeviceId();
    const studentId = authenticatedUserId ? `auth_${authenticatedUserId}` : `anon_${deviceId}`;
    const now = new Date().toISOString();

    const existing = this.getStudentProfile();

    const profile: StudentProfile = {
      studentId: existing?.studentId || studentId,
      name: trimmedName,
      rollNumber: rollNumber || existing?.rollNumber || '',
      schoolName: schoolName || existing?.schoolName || '',
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      isRegistered: true
    };

    // 1. Save locally immediately
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (err) {
      console.warn('Failed to save student profile locally:', err);
    }

    // 2. Asynchronously sync to backend database (Supabase & Cloudflare)
    this.syncToBackend(profile).catch((err) => {
      console.warn('Backend student sync warning:', err);
    });

    return profile;
  },

  /**
   * Update student display name from Dashboard settings
   */
  async updateStudentName(newName: string): Promise<StudentProfile> {
    const existing = this.getStudentProfile();
    return this.registerStudentName(
      newName,
      existing?.studentId?.startsWith('auth_') ? existing.studentId.replace('auth_', '') : undefined,
      existing?.rollNumber,
      existing?.schoolName
    );
  },

  /**
   * Sync student record to backend database
   */
  async syncToBackend(profile: StudentProfile): Promise<void> {
    // 1. Sync to Cloudflare D1 if available
    if (isCloudflareConfigured()) {
      try {
        const baseUrl = getCloudflareApiUrl();
        await fetch(`${baseUrl}/api/students/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: profile.studentId,
            name: profile.name,
            roll_number: profile.rollNumber || '',
            school_name: profile.schoolName || ''
          })
        });
      } catch (err) {
        console.warn('Cloudflare student registration sync failed:', err);
      }
    }

    // 2. Sync to Supabase if configured
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('students').upsert({
          student_id: profile.studentId,
          name: profile.name,
          device_id: this.getDeviceId(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'student_id' });
      }
    } catch (err) {
      // Supabase table might not exist yet; gracefully handled
      console.warn('Supabase student upsert non-critical:', err);
    }
  }
};
