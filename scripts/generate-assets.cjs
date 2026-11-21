const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const svgContent = fs.readFileSync(path.join(__dirname, '../public/favicon.svg'), 'utf8');

// 1. OG Image (1200x630)
const ogHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px;
    height: 630px;
    overflow: hidden;
    background: radial-gradient(circle at 50% 20%, #2e1065 0%, #0f172a 70%, #020617 100%);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    position: relative;
  }
  .glow-1 {
    position: absolute;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(147, 51, 234, 0.35) 0%, rgba(0,0,0,0) 70%);
    top: -100px;
    left: 300px;
    z-index: 1;
    pointer-events: none;
  }
  .glow-2 {
    position: absolute;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, rgba(0,0,0,0) 70%);
    bottom: -50px;
    right: 150px;
    z-index: 1;
    pointer-events: none;
  }
  .card {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 40px;
  }
  .logo-wrapper {
    width: 130px;
    height: 130px;
    background: rgba(255, 255, 255, 0.08);
    border: 2px solid rgba(168, 85, 247, 0.5);
    border-radius: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 50px rgba(147, 51, 234, 0.5), inset 0 0 20px rgba(168, 85, 247, 0.2);
    margin-bottom: 28px;
    backdrop-filter: blur(10px);
  }
  .logo-wrapper svg {
    width: 80px;
    height: 80px;
    filter: drop-shadow(0 4px 12px rgba(134, 59, 255, 0.6));
  }
  h1 {
    font-size: 68px;
    font-weight: 800;
    letter-spacing: -1.5px;
    background: linear-gradient(135deg, #ffffff 40%, #c084fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 14px;
    text-shadow: 0 4px 30px rgba(0,0,0,0.5);
  }
  p.subtitle {
    font-size: 26px;
    color: #e2e8f0;
    font-weight: 500;
    margin-bottom: 28px;
    max-width: 800px;
    line-height: 1.4;
  }
  .badges {
    display: flex;
    gap: 16px;
  }
  .badge {
    background: rgba(147, 51, 234, 0.2);
    border: 1px solid rgba(168, 85, 247, 0.4);
    color: #d8b4fe;
    font-size: 17px;
    font-weight: 600;
    padding: 8px 22px;
    border-radius: 9999px;
    letter-spacing: 0.3px;
  }
</style>
</head>
<body>
  <div class="glow-1"></div>
  <div class="glow-2"></div>
  <div class="card">
    <div class="logo-wrapper">
      ${svgContent}
    </div>
    <h1>SSC Note Box</h1>
    <p class="subtitle">SSC শিক্ষার্থীদের জন্য উন্মুক্ত ও ফ্রি নোট শেয়ারিং প্ল্যাটফর্ম</p>
    <div class="badges">
      <div class="badge">📚 অধ্যায়ভিত্তিক নোট</div>
      <div class="badge">📥 ফ্রি PDF ডাউনলোড</div>
      <div class="badge">🎙️ বাংলা AI অডিও রিডার</div>
    </div>
  </div>
</body>
</html>`;

// 2. Square Logo (512x512)
const logo512Html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 512px;
    height: 512px;
    overflow: hidden;
    background: radial-gradient(circle at 50% 25%, #3b0764 0%, #1e1136 50%, #090314 100%);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    position: relative;
  }
  .glow {
    position: absolute;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(147, 51, 234, 0.5) 0%, rgba(0,0,0,0) 70%);
    z-index: 1;
  }
  .content {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .icon-box {
    width: 240px;
    height: 240px;
    background: rgba(255, 255, 255, 0.08);
    border: 3px solid rgba(168, 85, 247, 0.6);
    border-radius: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 60px rgba(134, 59, 255, 0.6), inset 0 0 30px rgba(168, 85, 247, 0.25);
    margin-bottom: 24px;
  }
  .icon-box svg {
    width: 150px;
    height: 150px;
    filter: drop-shadow(0 6px 16px rgba(134, 59, 255, 0.7));
  }
  .title {
    font-size: 38px;
    font-weight: 800;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, #ffffff 40%, #c084fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="content">
    <div class="icon-box">
      ${svgContent}
    </div>
    <div class="title">SSC Note Box</div>
  </div>
</body>
</html>`;

const tempDir = path.join(__dirname, '../dist_temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const ogHtmlPath = path.join(tempDir, 'og.html');
const logo512HtmlPath = path.join(tempDir, 'logo512.html');

fs.writeFileSync(ogHtmlPath, ogHtml);
fs.writeFileSync(logo512HtmlPath, logo512Html);

const publicDir = path.join(__dirname, '../public');

console.log("Generating og-image.png (1200x630)...");
execSync(`"${CHROME_PATH}" --headless --disable-gpu --screenshot="${path.join(publicDir, 'og-image.png')}" --window-size=1200,630 --hide-scrollbars "file://${ogHtmlPath}"`);

console.log("Generating logo512.png (512x512)...");
execSync(`"${CHROME_PATH}" --headless --disable-gpu --screenshot="${path.join(publicDir, 'logo512.png')}" --window-size=512,512 --hide-scrollbars "file://${logo512HtmlPath}"`);

console.log("Generating logo192.png (192x192)...");
execSync(`"${CHROME_PATH}" --headless --disable-gpu --screenshot="${path.join(publicDir, 'logo192.png')}" --window-size=192,192 --hide-scrollbars "file://${logo512HtmlPath}"`);

console.log("Generating apple-touch-icon.png (180x180)...");
execSync(`"${CHROME_PATH}" --headless --disable-gpu --screenshot="${path.join(publicDir, 'apple-touch-icon.png')}" --window-size=180,180 --hide-scrollbars "file://${logo512HtmlPath}"`);

// Clean temp
fs.rmSync(tempDir, { recursive: true, force: true });
console.log("All social sharing and logo assets generated successfully in public/!");
