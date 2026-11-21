/**
 * Production Firebase Security Rules for SSC Note Box
 * Owner: Jahidul Islam
 */

export const FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to verify if the requester is the authorized owner
    function isOwner() {
      return request.auth != null && (
        request.auth.uid == "REPLACE_WITH_YOUR_OWNER_UID" ||
        exists(/databases/$(database)/documents/admins/$(request.auth.uid))
      );
    }
    
    // 1. Subjects Collection: Public read, Owner-only write
    match /subjects/{subjectId} {
      allow read: if true;
      allow write: if isOwner();
    }
    
    // 2. Chapters Collection: Public read, Owner-only write
    match /chapters/{chapterId} {
      allow read: if true;
      allow write: if isOwner();
    }
    
    // 3. Notes Collection:
    // - Public can read only 'approved' notes
    // - Owner can read all notes (including pending & rejected)
    // - Any student can create (upload) a note with status == 'pending'
    // - Owner only can update status, edit, or delete notes
    // - Public can increment downloadCount on notes
    match /notes/{noteId} {
      allow read: if resource.data.status == 'approved' || isOwner();
      allow create: if request.resource.data.status == 'pending'
                    && request.resource.data.studentName is string
                    && request.resource.data.schoolName is string
                    && request.resource.data.fileURL is string;
      allow update: if isOwner() || (
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['downloadCount']) &&
        request.resource.data.downloadCount == resource.data.downloadCount + 1
      );
      allow delete: if isOwner();
    }
    
    // 4. Reports Collection: Public can submit reports, Owner can read and manage
    match /reports/{reportId} {
      allow create: if request.resource.data.noteId is string
                    && request.resource.data.reason is string;
      allow read, update, delete: if isOwner();
    }
    
    // 5. Admins Collection: Owner only
    match /admins/{adminId} {
      allow read: if isOwner();
      allow write: if false; // Admins must be provisioned via Firebase Admin SDK
    }
  }
}`;

export const STORAGE_RULES = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper function
    function isOwner() {
      return request.auth != null && (
        request.auth.uid == "REPLACE_WITH_YOUR_OWNER_UID"
      );
    }
    
    // Notes storage folder
    match /notes/{fileName} {
      // Allow public read for downloaded notes
      allow read: if true;
      
      // Allow upload if file is valid document (PDF, PNG, JPG, DOCX) and <= 15MB
      allow create: if request.resource.size < 15 * 1024 * 1024
                    && (request.resource.contentType.matches('application/pdf')
                     || request.resource.contentType.matches('image/.*')
                     || request.resource.contentType.matches('application/vnd.openxmlformats-officedocument.wordprocessingml.document'));
                     
      // Only owner can delete or overwrite note files
      allow update, delete: if isOwner();
    }
  }
}`;
