import { Exam, Question } from '../types';

export const INITIAL_EXAMS: Exam[] = [
  {
    examId: 'exam-phy-motion-01',
    subjectId: 'physics',
    chapterId: 'phy-02',
    title: 'পদার্থবিজ্ঞান: ২য় অধ্যায় (গতি) পূর্ণাঙ্গ মডেল টেস্ট',
    description: 'গতি, সমবেগ, ত্বরণ, গতির সমীকরণ ও গ্রাফ সম্পর্কিত ২০টি গুরুত্বপূর্ণ বোর্ড স্ট্যান্ডার্ড MCQ।',
    examType: 'chapter',
    durationMinutes: 15,
    totalMarks: 20,
    passMarks: 8,
    negativeMark: 0.25,
    questionCount: 5,
    isPublished: true,
    createdAt: '2026-11-26T09:00:00.000Z'
  },
  {
    examId: 'exam-chem-structure-01',
    subjectId: 'chemistry',
    chapterId: 'chm-03',
    title: 'রসায়ন: ৩য় অধ্যায় (পদার্থের গঠন) স্পেশাল কুইজ',
    description: 'পরমাণুর মডেল, রাদারফোর্ড ও বোর মডেল, আইসোটোপ ও ইলেকট্রন বিন্যাস সম্পর্কিত ২০টি প্রশ্ন।',
    examType: 'chapter',
    durationMinutes: 15,
    totalMarks: 20,
    passMarks: 8,
    negativeMark: 0.25,
    questionCount: 5,
    isPublished: true,
    createdAt: '2026-11-26T09:00:00.000Z'
  },
  {
    examId: 'exam-math-realnumber-01',
    subjectId: 'general-math',
    chapterId: 'gm-chap-01',
    title: 'সাধারণ গণিত: ১ম ও ৩য় অধ্যায় (বাস্তব সংখ্যা ও বীজগাণিতিক রাশি)',
    description: 'মূলদ-অমূলদ সংখ্যা, আবৃত্ত দশমিক, সূত্রের প্রয়োগ ও মান নির্ণয়ের বোর্ড প্রশ্ন সংকলন।',
    examType: 'chapter',
    durationMinutes: 20,
    totalMarks: 20,
    passMarks: 8,
    negativeMark: 0.25,
    questionCount: 5,
    isPublished: true,
    createdAt: '2026-11-26T09:00:00.000Z'
  },
  {
    examId: 'exam-bio-cell-01',
    subjectId: 'biology',
    chapterId: 'bio-02',
    title: 'জীববিজ্ঞান: ২য় অধ্যায় (জীবকোষ ও টিস্যু) ফাইনাল কুইজ',
    description: 'উদ্ভিদ ও প্রাণিকোষের অঙ্গাণু, প্লাস্টিড, মাইটোকন্ড্রিয়া ও ভাজক টিস্যু সংক্রান্ত প্রশ্নাবলি।',
    examType: 'chapter',
    durationMinutes: 15,
    totalMarks: 20,
    passMarks: 8,
    negativeMark: 0.25,
    questionCount: 5,
    isPublished: true,
    createdAt: '2026-11-26T09:00:00.000Z'
  },
  {
    examId: 'exam-ict-safety-01',
    subjectId: 'ict',
    chapterId: 'ict-01',
    title: 'তথ্য ও যোগাযোগ প্রযুক্তি: কম্পিউটার নিরাপত্তা ও ই-লার্নিং',
    description: 'তথ্যপ্রযুক্তি, সফটওয়্যার ইনস্টলেশন, ভাইরাস-অ্যান্টিভাইরাস ও সাইবার সুরক্ষা কুইজ।',
    examType: 'chapter',
    durationMinutes: 12,
    totalMarks: 15,
    passMarks: 6,
    negativeMark: 0.25,
    questionCount: 5,
    isPublished: true,
    createdAt: '2026-11-26T09:00:00.000Z'
  },
  {
    examId: 'exam-model-science-full-01',
    subjectId: 'physics',
    title: 'এসএসসি বিজ্ঞান বিভাগ: পূর্ণাঙ্গ মডেল টেস্ট ২০২৫ (বিজ্ঞান অল-রাউন্ডার)',
    description: 'পদার্থবিজ্ঞান, রসায়ন ও জীববিজ্ঞানের সমন্বয়ে প্রস্তুত বিশেষ প্রাক-নির্বাচনী পূর্ণাঙ্গ মডেল টেস্ট।',
    examType: 'model_test',
    durationMinutes: 25,
    totalMarks: 25,
    passMarks: 10,
    negativeMark: 0.25,
    questionCount: 6,
    isPublished: true,
    createdAt: '2026-11-26T09:00:00.000Z'
  }
];

export const INITIAL_QUESTIONS: Question[] = [
  // --- Physics (Motion) ---
  {
    questionId: 'q-phy-01',
    examId: 'exam-phy-motion-01',
    subjectId: 'physics',
    chapterId: 'phy-02',
    questionText: 'একটি চলন্ত বস্তুর বেগ প্রতি সেকেন্ডে ৪ m/s হারে বৃদ্ধি পায়। বস্তুটির ত্বরণ কত?',
    options: ['২ m/s²', '৪ m/s²', '৮ m/s²', '১৬ m/s²'],
    correctOption: 1, // '৪ m/s²'
    explanation: 'ত্বরণ হলো বেগের পরিবর্তনের হার (a = Δv / t)। যেহেতু প্রতি সেকেন্ডে বেগ ৪ m/s বৃদ্ধি পায়, তাই ত্বরণ ৪ m/s²।',
    marks: 1
  },
  {
    questionId: 'q-phy-02',
    examId: 'exam-phy-motion-01',
    subjectId: 'physics',
    chapterId: 'phy-02',
    questionText: 'স্থিরাবস্থা থেকে সুষম ত্বরণে চলমান কোনো বস্তুর অতিক্রান্ত দূরত্ব (s) এবং সময়ের (t) সম্পর্ক কোনটি?',
    options: ['s ∝ t', 's ∝ t²', 's ∝ √t', 's ∝ 1/t'],
    correctOption: 1, // 's ∝ t²'
    explanation: 'আমরা জানি s = ut + ½at²। যেহেতু স্থিরাবস্থা (u = 0) এবং ত্বরণ সুষম (a ধ্রুবক), সুতরাং s ∝ t²।',
    marks: 1
  },
  {
    questionId: 'q-phy-03',
    examId: 'exam-phy-motion-01',
    subjectId: 'physics',
    chapterId: 'phy-02',
    questionText: 'একটি গাড়ি ৭২ km/h বেগে চলছে। SI এককে এর বেগ কত m/s?',
    options: ['১০ m/s', '১৫ m/s', '২০ m/s', '২৫ m/s'],
    correctOption: 2, // '২০ m/s'
    explanation: '৭২ km/h = (৭২ × ১০০০) / ৩৬০০ = ৭২ / ৩.৬ = ২০ m/s।',
    marks: 1
  },
  {
    questionId: 'q-phy-04',
    examId: 'exam-phy-motion-01',
    subjectId: 'physics',
    chapterId: 'phy-02',
    questionText: 'কোনো বস্তুকে খাড়া উপরের দিকে ছুঁড়ে মারলে সর্বোচ্চ উচ্চতায় বস্তুটির বেগ কত হবে?',
    options: ['সর্বোচ্চ', 'শূন্য (0 m/s)', '৯.৮ m/s', 'অসীম'],
    correctOption: 1, // 'শূন্য (0 m/s)'
    explanation: 'অভিকর্ষজ বলের বিপরীতে ওঠার কারণে বস্তুর বেগ ক্রমাগত কমতে থাকে এবং সর্বোচ্চ বিন্দুতে ক্ষণিকের জন্য বেগ শূন্য (v = 0) হয়।',
    marks: 1
  },
  {
    questionId: 'q-phy-05',
    examId: 'exam-phy-motion-01',
    subjectId: 'physics',
    chapterId: 'phy-02',
    questionText: 'বেগ-সময় (v-t) লেখচিত্রের ঢাল (Slope) কী নির্দেশ করে?',
    options: ['দূরত্ব', 'সরণ', 'ত্বরণ', 'ভরবেগ'],
    correctOption: 2, // 'ত্বরণ'
    explanation: 'বেগ-সময় লেখচিত্রে উলম্ব অক্ষে বেগ এবং অনুভূমিক অক্ষে সময় থাকে। ঢাল = Δv/Δt = ত্বরণ (Acceleration)।',
    marks: 1
  },

  // --- Chemistry (Structure of Matter) ---
  {
    questionId: 'q-chm-01',
    examId: 'exam-chem-structure-01',
    subjectId: 'chemistry',
    chapterId: 'chm-03',
    questionText: 'সোডিয়াম (Na) পরমাণুর ইলেকট্রন বিন্যাস কোনটি?',
    options: ['২, ৮, ২', '২, ৮, ১', '২, ৭, ২', '২, ৮, ৩'],
    correctOption: 1, // '২, ৮, ১'
    explanation: 'সোডিয়ামের পারমাণবিক সংখ্যা ১১। এর ইলেকট্রন বিন্যাস হলো ১s² ২s² ২p⁶ ৩s¹ অর্থাৎ ২, ৮, ১।',
    marks: 1
  },
  {
    questionId: 'q-chm-02',
    examId: 'exam-chem-structure-01',
    subjectId: 'chemistry',
    chapterId: 'chm-03',
    questionText: 'রাদারফোর্ডের আলফা কণা বিচ্ছুরণ পরীক্ষায় পর্দার উপর কোন পদার্থের প্রলেপ ছিল?',
    options: ['জিংক ক্লোরাইড', 'জিংক সালফেট', 'জিংক সালফাইড (ZnS)', 'লেড অক্সাইড'],
    correctOption: 2, // 'জিংক সালফাইড (ZnS)'
    explanation: 'স্বর্ণপাত পরীক্ষার চারপাশে জিংক সালফাইড (ZnS) প্রলেপযুক্ত প্রতিপ্রভা সৃষ্টিকারী পর্দা ব্যবহৃত হয়েছিল।',
    marks: 1
  },
  {
    questionId: 'q-chm-03',
    examId: 'exam-chem-structure-01',
    subjectId: 'chemistry',
    chapterId: 'chm-03',
    questionText: 'যেসব পরমাণুর প্রোটন সংখ্যা সমান কিন্তু ভর সংখ্যা ভিন্ন, তাদের কী বলা হয়?',
    options: ['আইসোবার', 'আইসোটোন', 'আইসোটোপ', 'আইসোমার'],
    correctOption: 2, // 'আইসোটোপ'
    explanation: 'প্রোটন সংখ্যা সমান হলে তাকে আইসোটোপ বলা হয় (যেমন হাইড্রোজেনের তিনটি আইসোটোপ: প্রোটিয়াম, ডিউটেরিয়াম, ট্রিটিয়াম)।',
    marks: 1
  },
  {
    questionId: 'q-chm-04',
    examId: 'exam-chem-structure-01',
    subjectId: 'chemistry',
    chapterId: 'chm-03',
    questionText: 'কোনো প্রধান শক্তিস্তরে সর্বোচ্চ ইলেকট্রন ধারণক্ষমতা নির্ণয়ের সূত্র কোনটি?',
    options: ['2n', '2n²', 'n²', '2n³'],
    correctOption: 1, // '2n²'
    explanation: 'বোর পরমাণু মডেল অনুসারে n-তম প্রধান শক্তিস্তরে সর্বোচ্চ ইলেকট্রন সংখ্যা = 2n²।',
    marks: 1
  },
  {
    questionId: 'q-chm-05',
    examId: 'exam-chem-structure-01',
    subjectId: 'chemistry',
    chapterId: 'chm-03',
    questionText: 'ক্যান্সার চিকিৎসায় টিউমারের উপস্থিতি নির্ণয়ে ও ধ্বংস করতে কোন তেজস্ক্রিয় আইসোটোপ ব্যবহৃত হয়?',
    options: ['কার্বন-১৪', 'কোবাল্ট-৬০', 'আয়োডিন-১৩১', 'ফসফরাস-৩২'],
    correctOption: 1, // 'কোবাল্ট-৬০'
    explanation: 'কোবাল্ট-৬০ (Co-60) থেকে নির্গত গামা রশ্মি দিয়ে ক্যান্সার কোষ ধ্বংস করা হয়।',
    marks: 1
  },

  // --- General Math (Real Numbers) ---
  {
    questionId: 'q-math-01',
    examId: 'exam-math-realnumber-01',
    subjectId: 'general-math',
    chapterId: 'gm-chap-01',
    questionText: 'নিচের কোনটি অমূলদ সংখ্যা (Irrational Number)?',
    options: ['√৪', '√৯', '√৭', '√১৬'],
    correctOption: 2, // '√৭'
    explanation: 'যেসব সংখ্যার বর্গমূল পূর্ণসংখ্যা নয় এবং অসীম অনাবৃত্ত দশমিক, তারা অমূলদ সংখ্যা। এখানে √৭ একটি অমূলদ সংখ্যা।',
    marks: 1
  },
  {
    questionId: 'q-math-02',
    examId: 'exam-math-realnumber-01',
    subjectId: 'general-math',
    chapterId: 'gm-chap-01',
    questionText: 'যদি x + 1/x = 3 হয়, তবে x² + 1/x² এর মান কত?',
    options: ['৭', '৯', '১১', '৬'],
    correctOption: 0, // '৭'
    explanation: 'x² + 1/x² = (x + 1/x)² - 2 = 3² - 2 = 9 - 2 = 7।',
    marks: 1
  },
  {
    questionId: 'q-math-03',
    examId: 'exam-math-realnumber-01',
    subjectId: 'general-math',
    chapterId: 'gm-chap-01',
    questionText: '০.৩̇ (০.৩ পৌনঃপুনিক) এর সাধারণ ভগ্নাংশ রূপ কোনটি?',
    options: ['৩/১০', '১/৩', '৩/১০০', '১/৯'],
    correctOption: 1, // '১/৩'
    explanation: '০.৩̇ = ৩/৯ = ১/৩।',
    marks: 1
  },
  {
    questionId: 'q-math-04',
    examId: 'exam-math-realnumber-01',
    subjectId: 'general-math',
    chapterId: 'gm-chap-01',
    questionText: 'সবচেয়ে ছোট মৌলিক সংখ্যা কোনটি?',
    options: ['০', '১', '২', '৩'],
    correctOption: 2, // '২'
    explanation: '২ হলো একমাত্র জোড় মৌলিক সংখ্যা এবং এটিই সবচেয়ে ছোট মৌলিক সংখ্যা।',
    marks: 1
  },
  {
    questionId: 'q-math-05',
    examId: 'exam-math-realnumber-01',
    subjectId: 'general-math',
    chapterId: 'gm-chap-01',
    questionText: 'লগারিদমের ক্ষেত্রে log₁₀ 100 এর মান কত?',
    options: ['১', '২', '১০', '১০০'],
    correctOption: 1, // '২'
    explanation: 'log₁₀ 100 = log₁₀ (10²) = 2 log₁₀ 10 = 2 × 1 = 2।',
    marks: 1
  },

  // --- Biology (Cells & Tissues) ---
  {
    questionId: 'q-bio-01',
    examId: 'exam-bio-cell-01',
    subjectId: 'biology',
    chapterId: 'bio-02',
    questionText: 'কোষের শক্তিঘর (Powerhouse of Cell) বলা হয় কোন অঙ্গাণুকে?',
    options: ['রাইবোসোম', 'গলগি বডি', 'মাইটোকন্ড্রিয়া', 'লাইসোসোম'],
    correctOption: 2, // 'মাইটোকন্ড্রিয়া'
    explanation: 'কোষের যাবতীয় জৈবনিক কাজের শক্তি ATP তৈরির জন্য মাইটোকন্ড্রিয়াকে শক্তিঘর বলা হয়।',
    marks: 1
  },
  {
    questionId: 'q-bio-02',
    examId: 'exam-bio-cell-01',
    subjectId: 'biology',
    chapterId: 'bio-02',
    questionText: 'উদ্ভিদকোষের কোষপ্রাচীর প্রধানত কোন উপাদান দ্বারা গঠিত?',
    options: ['সেলুলোজ', 'লিপিড', 'প্রোটিন', 'গ্লুকোজ'],
    correctOption: 0, // 'সেলুলোজ'
    explanation: 'উদ্ভিদকোষের মৃত ও শক্ত কোষপ্রাচীর প্রধানত সেলুলোজ, হেমিসেলুলোজ ও পেকটিন দিয়ে তৈরি।',
    marks: 1
  },
  {
    questionId: 'q-bio-03',
    examId: 'exam-bio-cell-01',
    subjectId: 'biology',
    chapterId: 'bio-02',
    questionText: 'রক্তের কোন উপাদান রক্ত জমাট বাঁধতে সাহায্য করে?',
    options: ['লোহিত রক্তকণিকা', 'শ্বেত রক্তকণিকা', 'অণুচক্রিকা (Platelet)', 'হিমোগ্লোবিন'],
    correctOption: 2, // 'অণুচক্রিকা (Platelet)'
    explanation: 'অণুচক্রিকা রক্তনালি কেটে গেলে থ্রম্বোপ্লাস্টিন তৈরি করে রক্ত জমাট বাঁধায়।',
    marks: 1
  },
  {
    questionId: 'q-bio-04',
    examId: 'exam-bio-cell-01',
    subjectId: 'biology',
    chapterId: 'bio-02',
    questionText: 'উদ্ভিদের কোন টিস্যু খাদ্য ও পানি পরিবহনে সহায়তা করে?',
    options: ['প্যারেনকাইমা', 'কোলেনকাইমা', 'জাইলেম ও ফ্লোয়েম', 'স্ক্লেরেনকাইমা'],
    correctOption: 2, // 'জাইলেম ও ফ্লোয়েম'
    explanation: 'জাইলেম মূল থেকে পানি ও খনিজ লবণ পাতায় এবং ফ্লোয়েম প্রস্তুতকৃত খাদ্য সারা দেহে পরিবহন করে।',
    marks: 1
  },
  {
    questionId: 'q-bio-05',
    examId: 'exam-bio-cell-01',
    subjectId: 'biology',
    chapterId: 'bio-02',
    questionText: 'কোষে প্রোটিন সংশ্লেষণ বা তৈরির স্থান কোনটি?',
    options: ['সেন্ট্রোসোম', 'রাইবোসোম', 'ক্লোরোপ্লাস্ট', 'লাইসোজোম'],
    correctOption: 1, // 'রাইবোসোম'
    explanation: 'রাইবোসোমকে প্রোটিন তৈরির কারখানা বলা হয়।',
    marks: 1
  },

  // --- ICT ---
  {
    questionId: 'q-ict-01',
    examId: 'exam-ict-safety-01',
    subjectId: 'ict',
    chapterId: 'ict-01',
    questionText: 'VIRUS শব্দের পূর্ণরূপ কী?',
    options: [
      'Vital Information Resources Under Siege',
      'Very Important Record Under Security',
      'Virtual Information Real Utility System',
      'Vital Internet Routing User System'
    ],
    correctOption: 0,
    explanation: 'VIRUS = Vital Information Resources Under Siege (অধ্যাপক ফ্রেড কোহেন নামকরণ করেন)।',
    marks: 1
  },
  {
    questionId: 'q-ict-02',
    examId: 'exam-ict-safety-01',
    subjectId: 'ict',
    chapterId: 'ict-01',
    questionText: 'নিচের কোনটি স্প্রেডশিট সফটওয়্যারের উদাহরণ?',
    options: ['MS Word', 'MS Excel', 'MS PowerPoint', 'Photoshop'],
    correctOption: 1, // 'MS Excel'
    explanation: 'MS Excel হলো বহুল ব্যবহৃত একটি হিসাব-নিকাশের স্প্রেডশিট সফটওয়্যার।',
    marks: 1
  },
  {
    questionId: 'q-ict-03',
    examId: 'exam-ict-safety-01',
    subjectId: 'ict',
    chapterId: 'ict-01',
    questionText: 'নিরাপদ পাসওয়ার্ড তৈরির জন্য কোন কৌশলটি সঠিক?',
    options: ['শুধু নিজের নাম লেখা', 'মোবাইল নম্বর ব্যবহার করা', 'বড়-ছোট অক্ষর, সংখ্যা ও প্রতীকের মিশ্রণ ব্যবহার করা', '১২৩৪৫৬ ব্যবহার করা'],
    correctOption: 2,
    explanation: 'শক্তিশালী পাসওয়ার্ডে বড় হাতের অক্ষর, ছোট হাতের অক্ষর, সংখ্যা ও বিশেষ চিহ্নের সংমিশ্রণ থাকা আবশ্যক।',
    marks: 1
  },
  {
    questionId: 'q-ict-04',
    examId: 'exam-ict-safety-01',
    subjectId: 'ict',
    chapterId: 'ict-01',
    questionText: 'ই-মেইল পাঠানোর প্রোটোকল কোনটি?',
    options: ['HTTP', 'SMTP', 'FTP', 'IP'],
    correctOption: 1, // 'SMTP'
    explanation: 'ইমেইল পাঠানোর জন্য SMTP (Simple Mail Transfer Protocol) ব্যবহৃত হয়।',
    marks: 1
  },
  {
    questionId: 'q-ict-05',
    examId: 'exam-ict-safety-01',
    subjectId: 'ict',
    chapterId: 'ict-01',
    questionText: 'কম্পিউটার ডেটা সংরক্ষণের স্থায়ী মেমোরি কোনটি?',
    options: ['RAM', 'ROM', 'Cache', 'Register'],
    correctOption: 1, // 'ROM'
    explanation: 'ROM (Read Only Memory) হলো স্থায়ী ও অপরিবর্তনশীল মেমোরি।',
    marks: 1
  },

  // --- Model Test Special Questions ---
  {
    questionId: 'q-model-01',
    examId: 'exam-model-science-full-01',
    subjectId: 'physics',
    questionText: 'কোন রঙের আলোর তরঙ্গদৈর্ঘ্য সবচেয়ে বেশি?',
    options: ['নীল', 'সবুজ', 'লাল', 'হলুদ'],
    correctOption: 2, // 'লাল'
    explanation: 'দৃশ্যমান আলোর মধ্যে লাল আলোর তরঙ্গদৈর্ঘ্য সবচেয়ে বেশি (প্রায় ৭০০ ন্যানোমিটার)।',
    marks: 1
  },
  {
    questionId: 'q-model-02',
    examId: 'exam-model-science-full-01',
    subjectId: 'chemistry',
    questionText: 'নিচের কোন মৌলটির ইলেকট্রন আসক্তি সবচেয়ে বেশি?',
    options: ['ফ্লোরিন (F)', 'ক্লোরিন (Cl)', 'ব্রোমিন (Br)', 'আয়োডিন (I)'],
    correctOption: 1, // 'ক্লোরিন (Cl)'
    explanation: 'ছোট আকারের কারণে ফ্লোরিনের ইলেকট্রন ঘনত্ব বেশি হওয়ায় ইলেকট্রন বিকর্ষণ ঘটে, ফলে ক্লোরিনের ইলেকট্রন আসক্তি সর্বাধিক।',
    marks: 1
  },
  {
    questionId: 'q-model-03',
    examId: 'exam-model-science-full-01',
    subjectId: 'biology',
    questionText: 'শালোকসংশ্লেষণের আলোক পর্যায়ে পানির ভেঙে অক্সিজেন উৎপন্ন হওয়াকে কী বলে?',
    options: ['গ্লাইকোলাইসিস', 'ফটোলাইসিস', 'হাইড্রোলাইসিস', 'অক্সিডেশন'],
    correctOption: 1, // 'ফটোলাইসিস'
    explanation: 'সূর্যালোকের উপস্থিতিতে পানি ভেঙে অক্সিজেন, ইলেকট্রন ও প্রোটন তৈরির প্রক্রিয়াকে ফটোলাইসিস বলে।',
    marks: 1
  },
  {
    questionId: 'q-model-04',
    examId: 'exam-model-science-full-01',
    subjectId: 'physics',
    questionText: '১ অশ্বক্ষমতা (1 Horse Power) সমান কত ওয়াট?',
    options: ['৭৪৬ ওয়াট', '১০০০ ওয়াট', '৫০০ ওয়াট', '৭২০ ওয়াট'],
    correctOption: 0, // '৭৪৬ ওয়াট'
    explanation: '১ অশ্বক্ষমতা (1 HP) = ৭৪৬ ওয়াট (Watt)।',
    marks: 1
  },
  {
    questionId: 'q-model-05',
    examId: 'exam-model-science-full-01',
    subjectId: 'chemistry',
    questionText: 'বিশুদ্ধ পানির pH এর মান কত?',
    options: ['০', '৫', '৭', '১৪'],
    correctOption: 2, // '৭'
    explanation: 'বিশুদ্ধ পানি নিরপেক্ষ দ্রবণ, যার pH মান ঠিক ৭.০।',
    marks: 1
  },
  {
    questionId: 'q-model-06',
    examId: 'exam-model-science-full-01',
    subjectId: 'general-math',
    questionText: 'একটি ত্রিভুজের তিনটি কোণের সমষ্টি কত ডিগ্রি?',
    options: ['৯০°', '১৮০°', '২৭০°', '৩৬০°'],
    correctOption: 1, // '১৮০°'
    explanation: 'ইউক্লিডীয় জ্যামিতি অনুসারে যেকোনো ত্রিভুজের তিন কোণের সমষ্টি ১৮০° বা দুই সমকোণ।',
    marks: 1
  }
];
