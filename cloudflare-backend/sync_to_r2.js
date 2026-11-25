// ==========================================================
// SSC Note Box — Cloudflare R2 File Sync Script
// Uploads all backed up PDF notes into Cloudflare R2 bucket
// ==========================================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const backupStorageDir = path.join(__dirname, '..', 'backup', 'supabase_live_export', 'storage_files');
const files = fs.readdirSync(backupStorageDir);

console.log(`Found ${files.length} PDF files to sync to Cloudflare R2 (bucket: ssc-notebox-files)...`);

let success = 0;
let failed = 0;

for (const file of files) {
  const filePath = path.join(backupStorageDir, file);
  // Derive R2 object key
  const r2Key = file;

  try {
    console.log(`Uploading ${file} ...`);
    // Upload using wrangler r2 object put
    execSync(`npx wrangler r2 object put ssc-notebox-files/${r2Key} --file="${filePath}" --content-type="application/pdf"`, {
      cwd: __dirname,
      stdio: 'pipe'
    });
    success++;
  } catch (err) {
    console.warn(`Failed to upload ${file}:`, err.message);
    failed++;
  }
}

console.log(`Sync finished. Success: ${success}, Failed: ${failed}`);
