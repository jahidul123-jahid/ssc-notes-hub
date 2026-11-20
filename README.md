# SSC Notes Hub (একসাথে শিখি, একসাথে এগিয়ে যাই)

A modern, responsive, fully functional educational notes-sharing platform built specifically for Class 10 (SSC) students in Bangladesh.

---

## 🌟 Key Features

1. **Design Reference (Redwan's Method Layout)**:
   - Clean white background with subtle lavender accents (`#F5F3FF`, `#8B5CF6`, `#6366F1`).
   - Large banner subject cards with embossed Bengali titles, watermarked English badges, and rich gradient graphics.
   - Elegant typography with Google Font *Hind Siliguri*.
   - Mobile-first responsive layout with slide-out drawer menu.

2. **Official NCTB Class 9-10 Syllabus**:
   - Covers all 14 official subjects: বাংলা ১ম পত্র, বাংলা ২য় পত্র, English 1st, English 2nd, সাধারণ গণিত, উচ্চতর গণিত, পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান, বাংলাদেশ ও বিশ্বপরিচয়, ICT, ধর্ম ও নৈতিক শিক্ষা, কৃষিশিক্ষা এবং অন্যান্য বিষয়।
   - **Bangla 1st Paper**: Distinct **গদ্য (Prose)** and **পদ্য (Poem)** categorizations with individual cards for each piece of literature.
   - Physics, Chemistry, Biology, Math: Real NCTB syllabus chapters.

3. **Student Contribution & Upload System**:
   - Simple, frictionless upload for students (Student Name, Roll, Section, School Name, Subject, Chapter, Title, Description, File).
   - Real-time file preview for PDF, JPG, JPEG, PNG, DOCX (Max 15MB).
   - Upload progress indicator and confetti celebration upon successful upload.
   - Automatic `status: pending` submission for admin review.

4. **Interactive Note & PDF Viewer**:
   - In-app preview for PDF and high-res image zoom for handwritten notes.
   - One-click file download with dynamic download count increments.
   - Deep-link support (`/?noteId=...`) for sharing notes directly.
   - Report note dialog (wrong notes, inappropriate, copyright, other).

5. **Global Search & Multi-facet Filtering**:
   - Real-time search across subject, chapter, title, student, and school name.
   - Filter by subject, chapter, file format, school; sort by newest, oldest, or most downloaded.

6. **Private Hidden Owner Admin Panel (`/owner-control`)**:
   - **Owner**: **Jahidul Islam**
   - **Completely hidden**: No admin button in public navbar or hamburger menu.
   - Unauthorized access is strictly denied.
   - Note queue: Approve, reject, edit, or delete notes.
   - Subject & Chapter manager: Add, edit, remove subjects and syllabus chapters.
   - Report manager: Resolve or dismiss student reports.
   - Firebase status check & Database re-seed utility.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## 🔒 Firebase Configuration

1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Enable:
   - **Authentication** (Email/Password)
   - **Cloud Firestore**
   - **Firebase Storage**
3. Copy `.env.example` to `.env` and fill in your Firebase project credentials:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=ssc-notes-hub.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=ssc-notes-hub
   VITE_FIREBASE_STORAGE_BUCKET=ssc-notes-hub.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=1:...
   VITE_OWNER_UID=YOUR_FIREBASE_AUTH_UID
   VITE_OWNER_EMAIL=jahidulislam@sscnoteshub.com
   ```
4. Copy the production **Firestore Rules** and **Storage Rules** directly from `/owner-control` tab "ফায়ারবেস ও ব্যাকএন্ড রুলস".

> Note: The platform features a **Hybrid Engine** that runs offline with realistic NCTB notes and fallback storage out of the box even before Firebase credentials are configured.
