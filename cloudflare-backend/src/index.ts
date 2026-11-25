import { Hono } from 'hono';
import { cors } from 'hono/cors';

export interface Env {
  DB: D1Database;
  FILES: R2Bucket;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  SESSION_SECRET?: string;
  PUBLIC_URL?: string;
}

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for frontend
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'Content-Type']
}));

// Helper: Hash password using Web Crypto API (PBKDF2-SHA256)
async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256', length: 256 },
    true,
    ['sign']
  );
  const exported = await crypto.subtle.exportKey('raw', key);
  return Array.from(new Uint8Array(exported)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// -------------------------------------------------------------
// HEALTH CHECK
// -------------------------------------------------------------
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'SSC Note Box Cloudflare Backend API',
    timestamp: new Date().toISOString()
  });
});

// -------------------------------------------------------------
// NOTES CRUD
// -------------------------------------------------------------
app.get('/api/notes', async (c) => {
  const status = c.req.query('status') || 'approved';
  const subjectId = c.req.query('subject_id');
  const chapterId = c.req.query('chapter_id');

  let query = 'SELECT * FROM notes WHERE status != "deleted"';
  const params: any[] = [];

  if (status !== 'all') {
    query += ' AND status = ?';
    params.push(status);
  }
  if (subjectId) {
    query += ' AND subject_id = ?';
    params.push(subjectId);
  }
  if (chapterId) {
    query += ' AND chapter_id = ?';
    params.push(chapterId);
  }

  query += ' ORDER BY created_at DESC';

  try {
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    return c.json({ success: true, data: results });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.get('/api/notes/:id', async (c) => {
  const noteId = c.req.param('id');
  try {
    const note = await c.env.DB.prepare('SELECT * FROM notes WHERE note_id = ?').bind(noteId).first();
    if (!note) {
      return c.json({ success: false, error: 'Note not found' }, 404);
    }
    return c.json({ success: true, data: note });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.post('/api/notes', async (c) => {
  try {
    const body = await c.req.json();
    const noteId = body.note_id || `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    await c.env.DB.prepare(`
      INSERT INTO notes (
        note_id, subject_id, chapter_id, title, description,
        student_name, roll_number, section, school_name, whatsapp_number,
        file_url, file_type, file_size, page_count, download_count,
        status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      noteId,
      body.subject_id,
      body.chapter_id,
      body.title,
      body.description || '',
      body.student_name,
      body.roll_number || '',
      body.section || '',
      body.school_name || '',
      body.whatsapp_number || '',
      body.file_url,
      body.file_type || 'pdf',
      body.file_size || '',
      body.page_count || 1,
      0,
      body.status || 'pending',
      now
    ).run();

    return c.json({
      success: true,
      data: {
        noteId,
        ...body,
        status: body.status || 'pending',
        createdAt: now
      }
    }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.patch('/api/notes/:id', async (c) => {
  const noteId = c.req.param('id');
  try {
    const body = await c.req.json();
    const fields: string[] = [];
    const values: any[] = [];

    if (body.status !== undefined) {
      fields.push('status = ?');
      values.push(body.status);
    }
    if (body.title !== undefined) {
      fields.push('title = ?');
      values.push(body.title);
    }
    if (body.description !== undefined) {
      fields.push('description = ?');
      values.push(body.description);
    }
    if (body.student_name !== undefined) {
      fields.push('student_name = ?');
      values.push(body.student_name);
    }
    if (body.school_name !== undefined) {
      fields.push('school_name = ?');
      values.push(body.school_name);
    }

    if (fields.length === 0) {
      return c.json({ success: false, error: 'No fields to update' }, 400);
    }

    values.push(noteId);
    await c.env.DB.prepare(`UPDATE notes SET ${fields.join(', ')} WHERE note_id = ?`).bind(...values).run();

    return c.json({ success: true, message: 'Note updated' });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.delete('/api/notes/:id', async (c) => {
  const noteId = c.req.param('id');
  try {
    await c.env.DB.prepare('UPDATE notes SET status = "deleted" WHERE note_id = ?').bind(noteId).run();
    return c.json({ success: true, message: 'Note marked as deleted' });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.post('/api/notes/:id/download', async (c) => {
  const noteId = c.req.param('id');
  try {
    await c.env.DB.prepare('UPDATE notes SET download_count = download_count + 1 WHERE note_id = ?').bind(noteId).run();
    const row = await c.env.DB.prepare('SELECT download_count FROM notes WHERE note_id = ?').bind(noteId).first();
    return c.json({ success: true, download_count: row?.download_count || 1 });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// -------------------------------------------------------------
// R2 FILE STORAGE & SERVING
// -------------------------------------------------------------
app.post('/api/upload', async (c) => {
  try {
    const formData = await c.req.parseBody();
    const file = formData['file'];

    if (!file || typeof file === 'string') {
      return c.json({ success: false, error: 'No valid file uploaded' }, 400);
    }

    const rawFile = file as unknown as File;
    const key = c.req.query('key') || `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.pdf`;
    const contentType = rawFile.type || 'application/pdf';

    const arrayBuffer = await rawFile.arrayBuffer();
    await c.env.FILES.put(key, arrayBuffer, {
      httpMetadata: {
        contentType,
        cacheControl: 'public, max-age=31536000'
      }
    });

    const origin = new URL(c.req.url).origin;
    const fileUrl = `${origin}/files/${key}`;

    return c.json({
      success: true,
      fileUrl,
      key
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// Stream files directly from Cloudflare R2
app.get('/files/:key', async (c) => {
  const key = c.req.param('key');
  const object = await c.env.FILES.get(key);

  if (!object) {
    return c.text('File Not Found', 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Access-Control-Allow-Origin', '*');
  if (!headers.get('Content-Type')) {
    headers.set('Content-Type', 'application/pdf');
  }

  return new Response(object.body, { headers });
});

// -------------------------------------------------------------
// REPORTS
// -------------------------------------------------------------
app.get('/api/reports', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM reports ORDER BY reported_at DESC').all();
    return c.json({ success: true, data: results });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.post('/api/reports', async (c) => {
  try {
    const body = await c.req.json();
    const reportId = `report-${Date.now()}`;
    const now = new Date().toISOString();

    await c.env.DB.prepare(`
      INSERT INTO reports (report_id, note_id, note_title, reason, reason_text, details, reported_at, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `).bind(
      reportId,
      body.note_id,
      body.note_title || '',
      body.reason || 'other',
      body.reason_text || '',
      body.details || '',
      now
    ).run();

    return c.json({ success: true, report_id: reportId, reported_at: now }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.patch('/api/reports/:id', async (c) => {
  const reportId = c.req.param('id');
  try {
    const body = await c.req.json();
    await c.env.DB.prepare('UPDATE reports SET status = ? WHERE report_id = ?').bind(body.status, reportId).run();
    return c.json({ success: true, message: 'Report status updated' });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// -------------------------------------------------------------
// ADMIN AUTHENTICATION
// -------------------------------------------------------------
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    const adminEmail = (c.env.ADMIN_EMAIL || 'jahidulislamg.b.123@gmail.com').toLowerCase();

    if (!email || email.trim().toLowerCase() !== adminEmail) {
      return c.json({ success: false, error: 'অননুমোদিত ইমেইল ঠিকানা।' }, 401);
    }

    // Check password against environment variable or fallback secure check
    const expectedPassword = c.env.ADMIN_PASSWORD || 'admin123';
    if (password !== expectedPassword) {
      return c.json({ success: false, error: 'ভুল পাসওয়ার্ড।' }, 401);
    }

    // Generate session token
    const token = `session_${Date.now()}_${crypto.randomUUID()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    try {
      await c.env.DB.prepare(`
        INSERT INTO admin_sessions (id, user_id, token, expires_at)
        VALUES (?, 'admin_owner', ?, ?)
      `).bind(crypto.randomUUID(), token, expiresAt).run();
    } catch {
      // If table doesn't exist yet, proceed gracefully
    }

    return c.json({
      success: true,
      token,
      user: {
        email: adminEmail,
        name: 'Jahidul Islam',
        role: 'owner'
      }
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.post('/api/auth/logout', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '').trim();
    try {
      await c.env.DB.prepare('DELETE FROM admin_sessions WHERE token = ?').bind(token).run();
    } catch {
      // ignore
    }
  }
  return c.json({ success: true, message: 'Logged out successfully' });
});

export default app;
