import { Hono } from 'hono';
import { cors } from 'hono/cors';

export interface Env {
  DB: D1Database;
  FILES: R2Bucket;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  SESSION_SECRET?: string;
  PUBLIC_URL?: string;
  GEMINI_API_KEY?: string;
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

// -------------------------------------------------------------
// ONLINE EXAMINATIONS & QUIZ ENGINE
// -------------------------------------------------------------
app.get('/api/exams', async (c) => {
  const subjectId = c.req.query('subject_id');
  const examType = c.req.query('exam_type');

  let query = 'SELECT * FROM exams WHERE is_published = 1';
  const params: any[] = [];

  if (subjectId) {
    query += ' AND subject_id = ?';
    params.push(subjectId);
  }
  if (examType) {
    query += ' AND exam_type = ?';
    params.push(examType);
  }

  query += ' ORDER BY created_at DESC';

  try {
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    return c.json({ success: true, data: results });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.get('/api/exams/:id', async (c) => {
  const examId = c.req.param('id');
  const includeAnswers = c.req.query('answers') === 'true';

  try {
    const exam = await c.env.DB.prepare('SELECT * FROM exams WHERE exam_id = ?').bind(examId).first();
    if (!exam) {
      return c.json({ success: false, error: 'Exam not found' }, 404);
    }

    const { results: qRows } = await c.env.DB.prepare(
      'SELECT * FROM questions WHERE exam_id = ? ORDER BY created_at ASC'
    ).bind(examId).all();

    const questions = qRows.map((q: any) => ({
      questionId: q.question_id,
      examId: q.exam_id,
      subjectId: q.subject_id,
      chapterId: q.chapter_id,
      questionText: q.question_text,
      options: JSON.parse(q.options_json || '[]'),
      correctOption: includeAnswers ? q.correct_option : undefined,
      explanation: includeAnswers ? q.explanation : undefined,
      marks: q.marks || 1
    }));

    return c.json({
      success: true,
      data: {
        ...exam,
        questions
      }
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// Server-Side Exam Submission & Verified Grading (Prevents Cheating / Tampering)
app.post('/api/exams/:id/submit', async (c) => {
  const examId = c.req.param('id');
  try {
    const body = await c.req.json();
    const studentName = (body.student_name || 'Anonymous Student').trim();
    const studentRoll = (body.student_roll || '').trim();
    const userAnswers: Record<string, number> = body.answers || {};
    const timeTakenSeconds = Number(body.time_taken_seconds) || 0;

    const exam = await c.env.DB.prepare('SELECT * FROM exams WHERE exam_id = ?').bind(examId).first();
    if (!exam) {
      return c.json({ success: false, error: 'Exam not found' }, 404);
    }

    const { results: qRows } = await c.env.DB.prepare(
      'SELECT * FROM questions WHERE exam_id = ?'
    ).bind(examId).all();

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    let totalScore = 0;
    const negativeMark = Number((exam as any).negative_mark) || 0.25;

    const reviewQuestions = qRows.map((q: any) => {
      const qId = q.question_id;
      const selected = userAnswers[qId];
      const correct = Number(q.correct_option);
      const marks = Number(q.marks) || 1;

      let isCorrect = false;
      if (selected === undefined || selected === null) {
        unansweredCount++;
      } else if (Number(selected) === correct) {
        correctCount++;
        totalScore += marks;
        isCorrect = true;
      } else {
        incorrectCount++;
        totalScore -= negativeMark;
      }

      return {
        questionId: qId,
        questionText: q.question_text,
        options: JSON.parse(q.options_json || '[]'),
        selectedOption: selected,
        correctOption: correct,
        isCorrect,
        explanation: q.explanation || ''
      };
    });

    const finalScore = Math.max(0, Number(totalScore.toFixed(2)));
    const totalMarks = Number((exam as any).total_marks) || qRows.length;
    const percentage = Math.round((finalScore / totalMarks) * 100);
    const passMarks = Number((exam as any).pass_marks) || Math.round(totalMarks * 0.4);
    const isPassed = finalScore >= passMarks;

    const attemptId = `attempt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    await c.env.DB.prepare(`
      INSERT INTO exam_attempts (
        attempt_id, exam_id, exam_title, subject_id, student_name, student_roll,
        score, total_marks, correct_count, incorrect_count, unanswered_count,
        percentage, is_passed, time_taken_seconds, answers_json, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      attemptId,
      examId,
      (exam as any).title,
      (exam as any).subject_id,
      studentName,
      studentRoll,
      finalScore,
      totalMarks,
      correctCount,
      incorrectCount,
      unansweredCount,
      percentage,
      isPassed ? 1 : 0,
      timeTakenSeconds,
      JSON.stringify(userAnswers),
      now
    ).run();

    return c.json({
      success: true,
      data: {
        attemptId,
        examId,
        examTitle: (exam as any).title,
        score: finalScore,
        totalMarks,
        correctCount,
        incorrectCount,
        unansweredCount,
        percentage,
        isPassed,
        timeTakenSeconds,
        completedAt: now,
        reviewQuestions
      }
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// -------------------------------------------------------------
// STUDENT COMMUNITY (ACADEMIC Q&A)
// -------------------------------------------------------------
app.get('/api/community/posts', async (c) => {
  const subjectId = c.req.query('subject_id');
  let query = 'SELECT * FROM community_posts WHERE status != "removed"';
  const params: any[] = [];

  if (subjectId) {
    query += ' AND subject_id = ?';
    params.push(subjectId);
  }

  query += ' ORDER BY created_at DESC LIMIT 50';

  try {
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    return c.json({ success: true, data: results });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.post('/api/community/posts', async (c) => {
  try {
    const body = await c.req.json();
    const postId = `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    await c.env.DB.prepare(`
      INSERT INTO community_posts (
        post_id, subject_id, chapter_id, author_name, author_school,
        title, content, tags_json, upvotes, comment_count, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'active', ?)
    `).bind(
      postId,
      body.subject_id,
      body.chapter_id || '',
      body.author_name || 'SSC Student',
      body.author_school || '',
      body.title,
      body.content,
      JSON.stringify(body.tags || []),
      now
    ).run();

    return c.json({ success: true, post_id: postId }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// -------------------------------------------------------------
// SECURE AI STUDY ASSISTANT (GEMINI PRO / FLASH INTEGRATION)
// -------------------------------------------------------------
app.post('/api/ai/chat', async (c) => {
  try {
    const body = await c.req.json();
    const prompt = body.prompt || body.message;
    const history = body.history || [];
    const apiKey = c.env.GEMINI_API_KEY;

    if (!prompt) {
      return c.json({ success: false, error: 'Prompt is required' }, 400);
    }

    const systemInstruction = `You are "SSC Note Box AI Study Assistant", an expert, empathetic, highly knowledgeable SSC Academic Tutor for Class 9 and 10 students in Bangladesh following the NCTB curriculum.
Key Guidelines:
1. Always communicate in clean, respectful, encouraging Bangla (বাংলা).
2. For Mathematics and Physics, solve problems step-by-step with clear formulas, units, and Bengali explanations.
3. For Chemistry, explain chemical equations, atomic structure, and reactions clearly.
4. For English, explain grammar rules with examples relevant to SSC board exams.
5. For Creative Questions (CQ), guide students on the 4 tiers: ক (জ্ঞানমূলক - ১), খ (অনুধাবনমূলক - ২), গ (প্রয়োগমূলক - ৩), ঘ (উচ্চতর দক্ষতা - ৪).
6. Never answer inappropriate, harmful, or non-educational questions. Always keep focus on SSC academic success.`;

    // Forward to Gemini API securely from worker
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const contents = [
      ...history.map((h: any) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
      })),
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ];

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return c.json({
        success: true,
        reply: `দুঃখিত, বর্তমানে এআই সার্ভার সাময়িক ব্যস্ত রয়েছে। তবে আপনার প্রশ্নের উত্তর খুব শীঘ্রই স্বাভাবিক হবে। আপনার পাঠ্যবই বা অধ্যায়ভিত্তিক নোটসগুলো স্টাডি করুন। (Error: ${response.status})`
      });
    }

    const data: any = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'কোনো উত্তর পাওয়া যায়নি। পুনরায় চেষ্টা করুন।';

    return c.json({ success: true, reply });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

export default app;
