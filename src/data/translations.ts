export type Language = 'en' | 'bn';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Top Bar & Brand
    top_announcement: "Click to view Founder Jahidul Islam's profile & details",
    brand_title: "SSC Note Box",
    
    // Navigation
    nav_home: "Home",
    nav_subjects: "All Subjects",
    nav_search: "Search Notes",
    nav_about: "About",
    nav_contact: "Contact",
    nav_upload: "Share Notes",
    nav_upload_btn: "Upload Note",
    owner_panel: "Owner Control Panel",

    // Hero
    hero_title_1: "Learn Together,",
    hero_title_2: "Grow Together",
    hero_subtitle: "An open note-sharing educational platform for SSC students. Share your notes, learn from fellow classmates across the nation.",
    hero_view_subjects: "Explore Subjects",
    hero_share_note: "Share Notes",

    // Home Page
    class_10_subjects: "Class 10 Subjects",
    all_subjects_link: "All Subjects",
    recent_notes: "Recent Notes",
    view_all_notes: "View All Notes",
    no_notes_yet: "No notes uploaded yet",
    be_first_share: "Be the first contributor by sharing your notes with classmates.",

    // Subjects Page
    subjects_page_title: "All SSC Subjects",
    subjects_page_subtitle: "Official NCTB Curriculum subjects for Class 9-10 (SSC 2027)",
    search_subject_placeholder: "Search subjects...",
    no_subjects_found: "No subjects found",

    // Subject Details Page
    breadcrumb_home: "Home",
    breadcrumb_all_subjects: "All Subjects",
    chapters_heading: "Chapters & Lessons",
    tab_prose: "Prose",
    tab_poem: "Poem",
    tab_all: "All Chapters",
    search_chapter_placeholder: "Search chapters or poems...",
    no_chapters_found: "No chapters found",
    subject_not_found: "Subject not found",

    // Chapter Details Page
    chapter_not_found: "Chapter not found",
    back_to_chapters: "Back to Chapters",
    search_notes_placeholder: "Search notes by title or student name...",
    filter_all: "All Formats",
    filter_pdf: "PDF",
    filter_image: "Images (JPG/PNG)",
    filter_docx: "Word (DOCX)",
    format_label: "Format:",
    no_notes_in_chapter: "No notes in this chapter yet",
    share_first_note: "Share your notebook notes to help fellow classmates.",
    listen_chapter: "Listen with AI",
    audio_pause: "Pause Audio",

    // Note Cards & Viewer
    btn_view_note: "View Note",
    btn_download: "Download",
    btn_listen: "Listen",
    btn_pause: "Pause",
    format_tag_pdf: "PDF",
    format_tag_image: "Image",
    format_tag_word: "Word",
    note_details_title: "Note Details",
    contributor_student: "Contributing Student",
    roll_number: "Roll No",
    section: "Section",
    school: "School",
    curriculum_meta: "Curriculum & Details",
    subject: "Subject",
    chapter: "Chapter",
    upload_date: "Upload Date",
    file_format: "Format",
    file_size: "File Size",
    btn_download_full: "Download Note",
    btn_open_tab: "Open in New Tab",
    btn_close: "Close",
    tooltip_copy: "Copy Link",
    tooltip_share: "Share",
    tooltip_report: "Report",
    copied_alert: "Copied!",
    zoom_in: "Zoom In",
    zoom_out: "Zoom Out",

    // Audio Player
    ai_reader_badge: "AI Audio Reader",
    cartesia_badge: "Cartesia AI Voice",
    player_playing: "Audio Playing",
    reading_speed: "Reading Speed:",
    restart_audio: "Play from start",
    stop_player: "Close Player",

    // Upload Modal
    upload_modal_title: "Share Study Note",
    upload_modal_sub: "Help fellow SSC students by sharing your handwritten notes or PDFs.",
    form_student_name: "Student Name",
    form_roll: "Roll Number",
    form_section: "Section / Branch",
    form_school: "School Name",
    form_subject: "Select Subject",
    form_chapter: "Select Chapter",
    form_title: "Note Title",
    form_desc: "Short Description / Topics Covered",
    form_file: "Upload Document / Image",
    form_file_hint: "Supports PDF, JPG, PNG, DOCX (Max 25MB)",
    btn_submit_note: "Submit Note for Review",
    btn_uploading: "Uploading...",

    // Footer
    footer_copyright: "All rights reserved.",
    footer_founder: "Founder: Jahidul Islam (Nabinagar Govt. Pilot High School)",
    footer_privacy: "SSC Note Box is a non-profit, student-led open educational platform.",
  },
  bn: {
    // Top Bar & Brand
    top_announcement: "আমাদের সম্পর্কে ও প্রতিষ্ঠাতা জাহিদুল ইসলামের সকল পরিচিতি দেখতে ক্লিক করুন",
    brand_title: "SSC Note Box",

    // Navigation
    nav_home: "হোম",
    nav_subjects: "সকল বিষয়",
    nav_search: "নোট খুঁজুন",
    nav_about: "আমাদের সম্পর্কে",
    nav_contact: "যোগাযোগ",
    nav_upload: "নোট শেয়ার করুন",
    nav_upload_btn: "নোট আপলোড করুন",
    owner_panel: "মালিক কন্ট্রোল প্যানেল",

    // Hero
    hero_title_1: "একসাথে শিখি,",
    hero_title_2: "একসাথে এগিয়ে যাই",
    hero_subtitle: "SSC শিক্ষার্থীদের জন্য একটি উন্মুক্ত নোট শেয়ারিং প্ল্যাটফর্ম। নিজের নোট শেয়ার করো, অন্যদের নোট থেকে শিখো।",
    hero_view_subjects: "সকল বিষয় দেখুন",
    hero_share_note: "নোট শেয়ার করুন",

    // Home Page
    class_10_subjects: "শ্রেণি ১০ বিষয়সমূহ",
    all_subjects_link: "সকল বিষয়",
    recent_notes: "সাম্প্রতিক নোট",
    view_all_notes: "সকল নোট দেখুন",
    no_notes_yet: "এখনই কোনো নোট আপলোড করা হয়নি",
    be_first_share: "আপনার খাতার সুন্দর নোটটি সহপাঠীদের সাথে শেয়ার করে প্রথম অবদানকারী হোন।",

    // Subjects Page
    subjects_page_title: "সকল এসএসসি বিষয়",
    subjects_page_subtitle: "৯ম-১০ম শ্রেণির এনসিটিবি শিক্ষাক্রমের সকল পাঠ্য বিষয় (SSC 2027)",
    search_subject_placeholder: "বিষয় খুঁজুন...",
    no_subjects_found: "কোনো বিষয় পাওয়া যায়নি",

    // Subject Details Page
    breadcrumb_home: "হোম",
    breadcrumb_all_subjects: "সকল বিষয়",
    chapters_heading: "অধ্যায়সমূহ",
    tab_prose: "গদ্য",
    tab_poem: "পদ্য",
    tab_all: "সকল অধ্যায়",
    search_chapter_placeholder: "গদ্য বা পদ্য খুঁজুন...",
    no_chapters_found: "কোনো অধ্যায় পাওয়া যায়নি",
    subject_not_found: "বিষয়টি পাওয়া যায়নি",

    // Chapter Details Page
    chapter_not_found: "অধ্যায়টি পাওয়া যায়নি",
    back_to_chapters: "অধ্যায়ের তালিকায় ফিরুন",
    search_notes_placeholder: "নোট বা শিক্ষার্থীর নাম দিয়ে খুঁজুন...",
    filter_all: "সকল ফরম্যাট",
    filter_pdf: "PDF",
    filter_image: "ছবি (JPG/PNG)",
    filter_docx: "Word (DOCX)",
    format_label: "ফরম্যাট:",
    no_notes_in_chapter: "এই অধ্যায়ে এখনও কোনো নোট নেই",
    share_first_note: "আপনার খাতার সুন্দর নোটটি সহপাঠীদের সাথে শেয়ার করে প্রথম অবদানকারী হোন।",
    listen_chapter: "এআই দিয়ে শুনুন",
    audio_pause: "অডিও বিরতি",

    // Note Cards & Viewer
    btn_view_note: "নোট দেখুন",
    btn_download: "ডাউনলোড",
    btn_listen: "শুনুন",
    btn_pause: "বিরতি",
    format_tag_pdf: "PDF",
    format_tag_image: "ছবি",
    format_tag_word: "Word",
    note_details_title: "নোটের বিস্তারিত বিবরণ",
    contributor_student: "নোট প্রদানকারী শিক্ষার্থী",
    roll_number: "রোল নম্বর",
    section: "শাখা",
    school: "বিদ্যালয়",
    curriculum_meta: "পাঠ্যসূচি ও প্রকাশনা",
    subject: "বিষয়",
    chapter: "অধ্যায়",
    upload_date: "আপলোড তারিখ",
    file_format: "ফরম্যাট",
    file_size: "ফাইলের আকার",
    btn_download_full: "নোট ডাউনলোড",
    btn_open_tab: "নতুন ট্যাবে দেখুন",
    btn_close: "বন্ধ করুন",
    tooltip_copy: "লিংক কপি করুন",
    tooltip_share: "শেয়ার করুন",
    tooltip_report: "রিপোর্ট করুন",
    copied_alert: "কপি হয়েছে!",
    zoom_in: "বড় করে দেখুন",
    zoom_out: "ছোট করুন",

    // Audio Player
    ai_reader_badge: "AI অডিও রিডার",
    cartesia_badge: "Cartesia AI Voice",
    player_playing: "অডিও পাঠ চালু আছে",
    reading_speed: "পড়ার গতি:",
    restart_audio: "প্রথম থেকে শুনুন",
    stop_player: "প্লেয়ার বন্ধ",

    // Upload Modal
    upload_modal_title: "নোট শেয়ার করুন",
    upload_modal_sub: "আপনার পাঠ্যপুস্তকের সুন্দর নোট বা গাইড সহপাঠীদের সাথে শেয়ার করুন।",
    form_student_name: "শিক্ষার্থীর নাম",
    form_roll: "রোল নম্বর",
    form_section: "শাখা",
    form_school: "বিদ্যালয়ের নাম",
    form_subject: "বিষয় নির্বাচন করুন",
    form_chapter: "অধ্যায় নির্বাচন করুন",
    form_title: "নোটের শিরোনাম",
    form_desc: "নোটের সংক্ষিপ্ত বিবরণ",
    form_file: "ডকুমেন্ট বা ছবি নির্বাচন করুন",
    form_file_hint: "PDF, JPG, PNG, DOCX ফরম্যাট সমর্থিত (সর্বোচ্চ ২৫ মেগাবাইট)",
    btn_submit_note: "পর্যালোচনার জন্য জমা দিন",
    btn_uploading: "আপলোড হচ্ছে...",

    // Footer
    footer_copyright: "সর্বস্বত্ব সংরক্ষিত।",
    footer_founder: "প্রতিষ্ঠাতা: জাহিদুল ইসলাম (নবীনগর সরকারি পাইলট উচ্চ বিদ্যালয়)",
    footer_privacy: "এসএসসি নোট বক্স একটি অলাভজনক উন্মুক্ত শিক্ষা প্ল্যাটফর্ম।",
  }
};
