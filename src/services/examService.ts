import { Exam, Question, ExamAttempt, ExamType } from '../types';
import { INITIAL_EXAMS, INITIAL_QUESTIONS } from '../data/initialExamData';
import { getCloudflareApiUrl, isCloudflareConfigured } from './cloudflareService';

const STORAGE_KEYS = {
  EXAMS: 'ssc_hub_exams_v1',
  QUESTIONS: 'ssc_hub_questions_v1',
  ATTEMPTS: 'ssc_hub_exam_attempts_v1'
};

// Initialize persistent local storage if empty
function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.EXAMS)) {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS)) {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
  }
}

export const examService = {
  // -------------------------------------------------------------
  // GET EXAMS
  // -------------------------------------------------------------
  async getExams(subjectId?: string, examType?: ExamType): Promise<Exam[]> {
    initStorage();

    // 1. Try Cloudflare backend when configured
    if (isCloudflareConfigured()) {
      try {
        const baseUrl = getCloudflareApiUrl();
        const url = new URL(`${baseUrl}/api/exams`);
        if (subjectId) url.searchParams.append('subject_id', subjectId);
        if (examType) url.searchParams.append('exam_type', examType);

        const res = await fetch(url.toString());
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            return json.data;
          }
        }
      } catch (err) {
        console.warn('Cloudflare getExams fallback to local:', err);
      }
    }

    // 2. Local fallback
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.EXAMS);
      const all: Exam[] = raw ? JSON.parse(raw) : INITIAL_EXAMS;
      return all.filter(e => {
        if (!e.isPublished) return false;
        if (subjectId && e.subjectId !== subjectId) return false;
        if (examType && e.examType !== examType) return false;
        return true;
      });
    } catch {
      return INITIAL_EXAMS;
    }
  },

  // -------------------------------------------------------------
  // GET EXAM DETAILS WITH QUESTIONS
  // -------------------------------------------------------------
  async getExamById(examId: string, includeAnswers = false): Promise<{ exam: Exam; questions: Question[] } | null> {
    initStorage();

    // 1. Try Cloudflare backend when configured
    if (isCloudflareConfigured()) {
      try {
        const baseUrl = getCloudflareApiUrl();
        const res = await fetch(`${baseUrl}/api/exams/${examId}?answers=${includeAnswers}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const { questions, ...exam } = json.data;
            return { exam, questions };
          }
        }
      } catch (err) {
        console.warn('Cloudflare getExamById fallback to local:', err);
      }
    }

    // 2. Local fallback
    try {
      const rawExams = localStorage.getItem(STORAGE_KEYS.EXAMS);
      const exams: Exam[] = rawExams ? JSON.parse(rawExams) : INITIAL_EXAMS;
      const exam = exams.find(e => e.examId === examId);
      if (!exam) return null;

      const rawQuestions = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      const allQuestions: Question[] = rawQuestions ? JSON.parse(rawQuestions) : INITIAL_QUESTIONS;
      const questions = allQuestions
        .filter(q => q.examId === examId)
        .map(q => ({
          ...q,
          correctOption: includeAnswers ? q.correctOption : 0, // hide answer while taking test
          explanation: includeAnswers ? q.explanation : ''
        }));

      return { exam, questions };
    } catch {
      return null;
    }
  },

  // -------------------------------------------------------------
  // SUBMIT EXAM & VERIFIED GRADING
  // -------------------------------------------------------------
  async submitExam(
    examId: string,
    answers: Record<string, number>,
    timeTakenSeconds: number,
    studentName = 'SSC Student',
    studentRoll = ''
  ): Promise<{
    attempt: ExamAttempt;
    reviewQuestions: (Question & { selectedOption?: number; isCorrect: boolean })[];
  }> {
    initStorage();

    // 1. Try Cloudflare backend for secure server-side grading
    if (isCloudflareConfigured()) {
      try {
        const baseUrl = getCloudflareApiUrl();
        const res = await fetch(`${baseUrl}/api/exams/${examId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_name: studentName,
            student_roll: studentRoll,
            answers,
            time_taken_seconds: timeTakenSeconds
          })
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const data = json.data;
            const attempt: ExamAttempt = {
              attemptId: data.attemptId,
              id: data.attemptId,
              examId: data.examId,
              examTitle: data.examTitle,
              subjectId: data.subjectId || '',
              studentName,
              studentRoll,
              score: data.score,
              totalMarks: data.totalMarks,
              correctCount: data.correctCount,
              correctAnswers: data.correctCount,
              incorrectCount: data.incorrectCount,
              incorrectAnswers: data.incorrectCount,
              unansweredCount: data.unansweredCount,
              unanswered: data.unansweredCount,
              percentage: data.percentage,
              isPassed: data.isPassed,
              passed: data.isPassed,
              timeTakenSeconds: data.timeTakenSeconds,
              timeSpentSeconds: data.timeTakenSeconds,
              totalQuestions: (data.correctCount || 0) + (data.incorrectCount || 0) + (data.unansweredCount || 0),
              answers,
              completedAt: data.completedAt
            };
            this.saveAttemptLocally(attempt);
            return { attempt, reviewQuestions: data.reviewQuestions };
          }
        }
      } catch (err) {
        console.warn('Cloudflare submitExam fallback to client grading:', err);
      }
    }

    // 2. Deterministic Client-Side Grading Fallback
    const rawExams = localStorage.getItem(STORAGE_KEYS.EXAMS);
    const exams: Exam[] = rawExams ? JSON.parse(rawExams) : INITIAL_EXAMS;
    const exam = exams.find(e => e.examId === examId) || INITIAL_EXAMS[0];

    const rawQuestions = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    const allQuestions: Question[] = rawQuestions ? JSON.parse(rawQuestions) : INITIAL_QUESTIONS;
    const questions = allQuestions.filter(q => q.examId === examId);

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    let score = 0;
    const negativeMark = exam.negativeMark || 0.25;

    const reviewQuestions = questions.map(q => {
      const selected = answers[q.questionId];
      const isAnswered = selected !== undefined && selected !== null;
      let isCorrect = false;

      if (!isAnswered) {
        unansweredCount++;
      } else if (selected === q.correctOption) {
        isCorrect = true;
        correctCount++;
        score += q.marks || 1;
      } else {
        incorrectCount++;
        score -= negativeMark;
      }

      return {
        ...q,
        selectedOption: selected,
        isCorrect
      };
    });

    const finalScore = Math.max(0, Number(score.toFixed(2)));
    const totalMarks = exam.totalMarks || questions.length;
    const percentage = Math.round((finalScore / totalMarks) * 100);
    const isPassed = finalScore >= (exam.passMarks || totalMarks * 0.4);

    const newAttemptId = `attempt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const attempt: ExamAttempt = {
      attemptId: newAttemptId,
      id: newAttemptId,
      examId,
      examTitle: exam.title,
      subjectId: exam.subjectId,
      studentName,
      studentRoll,
      score: finalScore,
      totalMarks,
      correctCount,
      correctAnswers: correctCount,
      incorrectCount,
      incorrectAnswers: incorrectCount,
      unansweredCount,
      unanswered: unansweredCount,
      percentage,
      isPassed,
      passed: isPassed,
      timeTakenSeconds,
      timeSpentSeconds: timeTakenSeconds,
      totalQuestions: questions.length,
      answers,
      completedAt: new Date().toISOString()
    };

    this.saveAttemptLocally(attempt);
    return { attempt, reviewQuestions };
  },

  // -------------------------------------------------------------
  // STUDENT ATTEMPTS & DASHBOARD
  // -------------------------------------------------------------
  saveAttemptLocally(attempt: ExamAttempt) {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
      const attempts: ExamAttempt[] = raw ? JSON.parse(raw) : [];
      attempts.unshift(attempt);
      localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts.slice(0, 100)));
    } catch (err) {
      console.warn('Failed to save attempt in localStorage:', err);
    }
  },

  getStudentAttempts(): ExamAttempt[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  // -------------------------------------------------------------
  // ADMIN ACTIONS
  // -------------------------------------------------------------
  async saveExam(exam: Exam, questions: Question[]): Promise<void> {
    initStorage();
    try {
      const rawExams = localStorage.getItem(STORAGE_KEYS.EXAMS);
      const exams: Exam[] = rawExams ? JSON.parse(rawExams) : INITIAL_EXAMS;
      const idx = exams.findIndex(e => e.examId === exam.examId);
      if (idx !== -1) {
        exams[idx] = exam;
      } else {
        exams.unshift(exam);
      }
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));

      // Save questions
      const rawQ = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      let allQ: Question[] = rawQ ? JSON.parse(rawQ) : INITIAL_QUESTIONS;
      allQ = allQ.filter(q => q.examId !== exam.examId);
      allQ.push(...questions);
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(allQ));
    } catch (err) {
      console.error('Failed to save exam:', err);
    }
  },

  async deleteExam(examId: string): Promise<void> {
    try {
      const rawExams = localStorage.getItem(STORAGE_KEYS.EXAMS);
      if (rawExams) {
        const exams: Exam[] = JSON.parse(rawExams);
        localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams.filter(e => e.examId !== examId)));
      }
      const rawQ = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (rawQ) {
        const q: Question[] = JSON.parse(rawQ);
        localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(q.filter(item => item.examId !== examId)));
      }
    } catch (err) {
      console.error('Failed to delete exam:', err);
    }
  }
};

export const getExams = examService.getExams.bind(examService);
export const getExamById = examService.getExamById.bind(examService);
export const submitExam = examService.submitExam.bind(examService);
export const getStudentAttempts = examService.getStudentAttempts.bind(examService);
export const getExamAttempts = examService.getStudentAttempts.bind(examService);
export const createExam = examService.saveExam.bind(examService);

