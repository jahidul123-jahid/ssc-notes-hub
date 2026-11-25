const fs = require('fs');
const path = require('path');

const backupPath = path.join(__dirname, '..', 'backup', 'supabase_live_export', 'notes_table_backup.json');
const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

let sql = '-- D1 Seed Data generated from live Supabase export\n\n';

for (const n of backup) {
  sql += `INSERT OR REPLACE INTO notes (
    note_id, subject_id, chapter_id, title, description,
    student_name, roll_number, section, school_name, whatsapp_number,
    file_url, file_type, file_size, page_count, download_count,
    status, created_at
  ) VALUES (
    ${escapeSql(n.note_id)},
    ${escapeSql(n.subject_id)},
    ${escapeSql(n.chapter_id)},
    ${escapeSql(n.title)},
    ${escapeSql(n.description || '')},
    ${escapeSql(n.student_name)},
    ${escapeSql(n.roll_number || '')},
    ${escapeSql(n.section || '')},
    ${escapeSql(n.school_name || '')},
    ${escapeSql(n.whatsapp_number || '')},
    ${escapeSql(n.file_url)},
    ${escapeSql(n.file_type || 'pdf')},
    ${escapeSql(n.file_size || '')},
    ${n.page_count || 1},
    ${n.download_count || 0},
    ${escapeSql(n.status || 'approved')},
    ${escapeSql(n.created_at || new Date().toISOString())}
  );\n`;
}

const outPath = path.join(__dirname, 'd1_seed_notes.sql');
fs.writeFileSync(outPath, sql, 'utf8');
console.log('Generated d1_seed_notes.sql successfully with', backup.length, 'records.');
