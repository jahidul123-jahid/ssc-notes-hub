import { ChatMessage } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'https://ssc-notebox-api.workers.dev';

export interface AISubjectPrompt {
  id: string;
  name: string;
  icon: string;
  starterPrompt: string;
}

export const SSC_AI_PROMPTS: AISubjectPrompt[] = [
  {
    id: 'math',
    name: 'গণিত সমাধান',
    icon: '📐',
    starterPrompt: 'SSC সাধারণ গণিত ও উচ্চতর গণিতের যেকোনো উপপাদ্য, সূত্র বা গাণিতিক সমস্যার ধাপভিত্তিক সহজ সমাধান বুঝিয়ে দাও।'
  },
  {
    id: 'physics',
    name: 'পদার্থবিজ্ঞান',
    icon: '⚡',
    starterPrompt: 'পদার্থবিজ্ঞানের গতি, বল, কাজ শক্তি ক্ষমতা এবং আলোর প্রতিফলনের সূত্র ও গাণিতিক সমস্যাগুলোর ব্যাখ্যা দাও।'
  },
  {
    id: 'chemistry',
    name: 'রসায়ন বিজ্ঞান',
    icon: '🧪',
    starterPrompt: 'পর্যায় সারণি, রাসায়নিক বন্ধন, জারণ-বিজারণ ও বিক্রিয়ার সমতাকরণ সহজ উদাহরণসহ বুঝিয়ে দাও।'
  },
  {
    id: 'biology',
    name: 'জীববিজ্ঞান',
    icon: '🧬',
    starterPrompt: 'জীবকোষের গঠন, সালোকসংশ্লেষণ, শ্বসন এবং মানবদেহের সংবহন তন্ত্র নিয়ে গুরুত্বপূর্ণ জ্ঞান ও অনুধাবনমূলক তথ্য দাও।'
  },
  {
    id: 'english',
    name: 'English Grammar',
    icon: '📖',
    starterPrompt: 'Explain Right Forms of Verbs, Transformation of Sentences, and Preposition rules with clear SSC exam examples in Bangla.'
  }
];

export async function sendChatMessage(messages: ChatMessage[], subjectContext?: string): Promise<string> {
  const lastMsg = messages[messages.length - 1];
  if (!lastMsg) return 'অনুগ্রহ করে প্রশ্ন লিখুন।';

  const systemInstruction = `তুমি "SSC Note Box" প্ল্যাটফর্মের একজন বিশেষজ্ঞ শিক্ষক ও একাডেমিক এআই অ্যাসিস্ট্যান্ট। তোমার দায়িত্ব হলো বাংলাদেশের মাধ্যমিক (SSC - Class 9 & 10) NCTB কারিকুলাম অনুযায়ী শিক্ষার্থীদের সহজ, প্রাঞ্জল বাংলায় পড়াশোনায় সাহায্য করা।
- সর্বদা সহজ ভাষায়, প্রয়োজনে পয়েন্ট আকারে ধাপভিত্তিক উত্তর দিবে।
- গণিত বা বিজ্ঞানের ক্ষেত্রে সূত্র ও গাণিতিক উদাহরণ স্পষ্ট করে লিখবে।
- অযথা দীর্ঘ না করে পরীক্ষার খাতায় লেখার মতো মানসম্মত ও নির্ভুল উত্তর দিবে।
- ইংরেজি গ্রামারের ক্ষেত্রে বাংলা অর্থসহ ব্যাখ্যা করবে।`;

  const conversationHistory = messages.map(m => ({
    role: m.sender === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }]
  }));

  try {
    const response = await fetch(`${API_BASE}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: conversationHistory,
        systemInstruction: subjectContext ? `${systemInstruction}\nবর্তমান বিষয়: ${subjectContext}` : systemInstruction,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.reply) {
        return data.reply;
      }
    }
  } catch (err) {
    console.warn('Backend AI proxy request failed, checking fallback...', err);
  }

  // Educational Fallback Generator if network/worker is unreachable
  return generateIntelligentFallback(lastMsg.text || lastMsg.content || '');
}

function generateIntelligentFallback(query: string): string {
  const lower = query.toLowerCase();

  if (lower.includes('গতি') || lower.includes('বেগ') || lower.includes('ত্বরণ')) {
    return `### ⚡ গতির গুরুত্বপূর্ণ সমীকরণসমূহ (Physics Ch 2):
1. **v = u + at** (শেষ বেগ নির্ণয়)
2. **s = ((u + v) / 2) * t** (গড় বেগে দূরত্ব)
3. **s = ut + (1/2)at²** (সমত্বরণে দূরত্ব)
4. **v² = u² + 2as** (সময় অনুপস্থিত থাকলে)

💡 **টিপস:** পরন্ত বস্তুর ক্ষেত্রে 'a' এর স্থলে অভিকর্ষজ ত্বরণ **g (9.8 ms⁻²)** এবং 's' এর স্থলে উচ্চতা **h** ব্যবহার করবে।`;
  }

  if (lower.includes('পর্যায় সারণি') || lower.includes('বন্ধন') || lower.includes('ইলেকট্রন')) {
    return `### 🧪 পর্যায় সারণি ও যোজনী কৌশল (Chemistry Ch 4):
- **যোজনী (Valency):** কোনো মৌলের সর্বশেষ কক্ষপথের অযুগ্ম ইলেকট্রন সংখ্যা বা অন্য মৌলের সাথে যুক্ত হওয়ার ক্ষমতা।
- **গ্রুপ নির্ণয়:** বহিস্থ স্তরে s অরবিটালে ইলেকট্রন থাকলে গ্রুপ = s এর ইলেকট্রন সংখ্যা; s ও p থাকলে = s + p + 10।
- **ধাতব ধর্ম:** একই পর্যায়ে বাম থেকে ডানে গেলে ধাতব ধর্ম হ্রাস পায় এবং একই গ্রুপে উপর থেকে নিচে গেলে বৃদ্ধি পায়।`;
  }

  if (lower.includes('right form') || lower.includes('grammar') || lower.includes('tense')) {
    return `### 📖 Right Forms of Verbs (SSC Golden Rules):
1. **Rule 1:** Subject যদি 3rd person singular number হয় এবং বাক্যটি Present Indefinite Tense হয়, তবে verb-এর শেষে **s/es** যুক্ত হয়। (e.g. He *reads* a book).
2. **Rule 2:** As well as, along with, together with দ্বারা দুটি Subject যুক্ত থাকলে **প্রথম Subject** অনুযায়ী verb নির্ধারিত হয়।
3. **Rule 3:** 'No sooner had ... than' যুক্ত বাক্যে had-এর পর Past Participle (V3) এবং than-এর পর Past Indefinite (V2) বসে।`;
  }

  if (lower.includes('উৎপাদক') || lower.includes('সমীকরণ') || lower.includes('ত্রিকোণমিতি')) {
    return `### 📐 গণিত সূত্র ও সমাধানের সূত্রাবলি:
1. **a² - b² = (a + b)(a - b)**
2. **(a + b)³ = a³ + 3a²b + 3ab² + b³**
3. **ত্রিকোণমিতি মৌলিক অনুপাত:**
   - sin²θ + cos²θ = 1
   - sec²θ - tan²θ = 1
   - cosec²θ - cot²θ = 1`;
  }

  return `আপনার প্রশ্নটি পেয়েছি: "${query}"।\n\nSSC কারিকুলাম অনুযায়ী এই টপিকের ক্ষেত্রে মূল বইয়ের সংজ্ঞা, প্রয়োজনীয় সূত্র এবং বিগত বছরের বোর্ড প্রশ্নের সমাধান ভালোভাবে অনুশীলন করা প্রয়োজন। নির্দিষ্ট কোনো গাণিতিক সমস্যা থাকলে প্রশ্নটি বিস্তারিত উল্লেখ করুন, আমি ধাপভিত্তিক সমাধান করে দেব!`;
}
