/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import ContentRenderer from './ContentRenderer';
import {
  FileText,
  Image as ImageIcon,
  Send,
  CheckCircle2,
  ChevronRight,
  Loader2,
  RefreshCw,
  BookOpen,
  HelpCircle,
  Gamepad2,
  AlertCircle,
  Sigma,
  Settings,
  X,
  KeyRound,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import VuaTiengVietGame from './VuaTiengVietGame';
import VuotAiTriThucGame from './VuotAiTriThucGame';
import SanKhoBauGame from './SanKhoBauGame';
import BucTranhBiAnGame from './BucTranhBiAnGame';
import OngTimChuGame from './OngTimChuGame';
import TranhTaiKeoCoGame from './TranhTaiKeoCoGame';
import CapDoiHoanHaoGame from './CapDoiHoanHaoGame';
import ThapTriTueGame from './ThapTriTueGame';
import KeoCoKienThucGame from './KeoCoKienThucGame';
import PhongThoatHiemGame from './PhongThoatHiemGame';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Game Library with compatibility mapping
const QUESTION_TYPES = [
  { id: 'Đúng / Sai', label: 'Đúng / Sai', emoji: '✅' },
  { id: 'Trắc nghiệm khách quan', label: 'Trắc nghiệm', emoji: '🔤' },
  { id: 'Trả lời ngắn', label: 'Trả lời ngắn', emoji: '✏️' },
  { id: 'Điền khuyết', label: 'Điền khuyết', emoji: '📝' },
  { id: 'Kéo thả', label: 'Kéo thả', emoji: '🔀' },
];

const GAME_LIBRARY = [
  {
    id: 'default',
    name: 'Quiz Mở Thẻ',
    emoji: '🎴',
    icon3d: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Flower%20playing%20cards/3D/flower_playing_cards_3d.png',
    description: 'Trả lời đúng để lật mở từng thẻ bài.',
    compatibleTypes: ['Trắc nghiệm khách quan', 'Đúng / Sai'],
    colorFrom: 'from-indigo-500', colorTo: 'to-violet-500',
    hoverBorder: 'hover:border-indigo-400',
  },
  {
    id: 'vuot_ai',
    name: 'Vượt Ải Tri Thức',
    emoji: '⚔️',
    icon3d: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Crossed%20swords/3D/crossed_swords_3d.png',
    description: 'Giao diện tối. Trả lời nhanh vượt qua từng ải.',
    compatibleTypes: ['Trắc nghiệm khách quan', 'Đúng / Sai'],
    colorFrom: 'from-sky-500', colorTo: 'to-blue-600',
    hoverBorder: 'hover:border-sky-400',
  },
  {
    id: 'vua_tieng_viet',
    name: 'Vua Tiếng Việt',
    emoji: '👑',
    icon3d: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Crown/3D/crown_3d.png',
    description: 'Sắp xếp chữ cái trong thời gian giới hạn.',
    compatibleTypes: ['Trả lời ngắn', 'Điền khuyết'],
    colorFrom: 'from-pink-500', colorTo: 'to-rose-500',
    hoverBorder: 'hover:border-pink-400',
  },
  {
    id: 'san_kho_bau',
    name: 'Săn Kho Báu',
    emoji: '🪙',
    icon3d: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Coin/3D/coin_3d.png',
    description: 'Thu thập vàng bằng cách trả lời đúng. Hỗ trợ kéo-thả điền khuyết.',
    compatibleTypes: ['Trắc nghiệm khách quan', 'Đúng / Sai', 'Trả lời ngắn', 'Điền khuyết', 'Kéo thả'],
    colorFrom: 'from-amber-500', colorTo: 'to-yellow-600',
    hoverBorder: 'hover:border-amber-400',
  },
  {
    id: 'buc_tranh_bi_an',
    name: 'Bức Tranh Bí Ẩn',
    emoji: '🖼️',
    icon3d: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Framed%20picture/3D/framed_picture_3d.png',
    description: 'Trả lời đúng để lộ dần bức tranh ẩn. Hình ảnh tùy chỉnh.',
    compatibleTypes: ['Trắc nghiệm khách quan', 'Đúng / Sai', 'Trả lời ngắn'],
    colorFrom: 'from-slate-600', colorTo: 'to-slate-800',
    hoverBorder: 'hover:border-yellow-400',
  },
  {
    id: 'ong_tim_chu',
    name: 'Ong Tìm Chữ',
    emoji: '🐝',
    icon3d: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Honeybee/3D/honeybee_3d.png',
    description: 'Tìm đáp án ẩn trong bảng chữ cái. Kéo để chọn, ngang/dọc/chéo.',
    compatibleTypes: ['Trả lời ngắn', 'Điền khuyết'],
    colorFrom: 'from-yellow-400', colorTo: 'to-orange-500',
    hoverBorder: 'hover:border-amber-400',
  },
  {
    id: 'tranh_tai_keo_co',
    name: 'Tranh Tài Kéo Co',
    emoji: '🏆',
    icon3d: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Trophy/3D/trophy_3d.png',
    description: '2 đội đấu đả luân phiên, kéo dây về phía chiến thắng!',
    compatibleTypes: ['Trắc nghiệm khách quan', 'Đúng / Sai'],
    colorFrom: 'from-blue-700', colorTo: 'to-red-700',
    hoverBorder: 'hover:border-yellow-400',
  },
  {
    id: 'cap_doi',
    name: 'Cặp Đôi Hoàn Hảo',
    emoji: '🔗',
    icon3d: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Link/3D/link_3d.png',
    description: 'Nối các cặp nội dung tương ứng ở cột A và cột B',
    compatibleTypes: ['Ghép nối', 'Trả lời ngắn'],
    colorFrom: 'from-teal-500', colorTo: 'to-cyan-600',
    hoverBorder: 'hover:border-teal-400',
  },
  {
    id: 'thap_tri_tue',
    name: 'Tháp Trí Tuệ',
    emoji: '🏰',
    icon3d: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Castle/3D/castle_3d.png',
    description: 'Trả lời đúng để xây từng tầng tháp. Sai 3 câu thì tháp đổ!',
    compatibleTypes: ['Đúng / Sai', 'Trả lời ngắn', 'Điền khuyết'],
    colorFrom: 'from-sky-400', colorTo: 'to-blue-500',
    hoverBorder: 'hover:border-sky-400',
  },
  {
    id: 'keo_co_kien_thuc',
    name: 'Kéo Co Kiến Thức',
    emoji: '🪢',
    icon3d: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Rope/3D/rope_3d.png',
    description: 'Đối kháng 2 đội! Chọn chế độ Tốc Độ hoặc Đường Dài. Có đếm giờ từng câu.',
    compatibleTypes: ['Trắc nghiệm khách quan', 'Đúng / Sai'],
    colorFrom: 'from-orange-500', colorTo: 'to-red-600',
    hoverBorder: 'hover:border-orange-400',
  },
  {
    id: 'phong_thoat_hiem',
    name: 'Phòng Thoát Hiểm',
    emoji: '🚪',
    icon3d: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Locked%20with%20key/3D/locked_with_key_3d.png',
    description: 'Giải câu đố — thu mã bí mật — mở ổ khóa thoát phòng! 4 kịch bản chủ đề khác nhau.',
    compatibleTypes: ['Trắc nghiệm khách quan', 'Đúng / Sai', 'Kéo thả', 'Điền khuyết'],
    colorFrom: 'from-violet-600', colorTo: 'to-purple-800',
    hoverBorder: 'hover:border-violet-400',
  },
];

// Types
type AppStage = 'home' | 'm1_type' | 'm1_input' | 'm1_edit' | 'm1_game' | 'm2_analyze' | 'm2_needs' | 'm2_questions' | 'm2_game';

interface LessonAnalysis {
  subject: string;
  level: string;
  keyConcepts: string[];
  rawText: string;
}

interface TeacherNeeds {
  questionType: string[];
  cognitiveLevel: string[];
  studentLevel: string;
  purpose: string;
  counts: Record<string, number>; // key format: "type|level"
}

interface QuestionItem {
  id: string;
  content: string;
  options?: string[]; // Cho trắc nghiệm
  correctAnswer?: string;
  type: string;
  level: string;
  imageUrl?: string; // base64 data URL nếu câu hỏi có ảnh
}

const AI_MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview (Mặc định)', icon: '⚡' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', icon: '🧠' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', icon: '🚀' },
];

export default function App() {
  const [stage, setStage] = useState<AppStage>('home');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryStatus, setRetryStatus] = useState<string | null>(null);

  // Settings & API Key State
  const [apiKey, setApiKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3-flash-preview');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isApiKeyRequired, setIsApiKeyRequired] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    const storedModel = localStorage.getItem('preferred_ai_model');
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setIsSettingsOpen(true);
      setIsApiKeyRequired(true);
    }

    if (storedModel && AI_MODELS.some(m => m.id === storedModel)) {
      setSelectedModel(storedModel);
    }
  }, []);

  const saveSettings = (newKey: string, newModel: string) => {
    if (newKey) {
      localStorage.setItem('gemini_api_key', newKey);
      setApiKey(newKey);
      setIsApiKeyRequired(false);
    }
    localStorage.setItem('preferred_ai_model', newModel);
    setSelectedModel(newModel);
    setIsSettingsOpen(false);
    setKeyTestResult(null);
  };

  const testApiKey = async (keyToTest: string) => {
    if (!keyToTest || keyToTest.length < 10) {
      setKeyTestResult({ ok: false, msg: 'API Key quá ngắn, vui lòng kiểm tra lại.' });
      return;
    }
    setIsTestingKey(true);
    setKeyTestResult(null);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keyToTest}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'Hi' }] }] }),
        }
      );
      const json = await res.json();
      if (res.ok && json?.candidates) {
        setKeyTestResult({ ok: true, msg: '✅ API Key hợp lệ và hoạt động tốt!' });
      } else {
        const errCode = json?.error?.code || res.status;
        if (errCode === 429) {
          setKeyTestResult({ ok: false, msg: '⚠️ Key hợp lệ nhưng đang bị rate limit. Chờ vài phút rồi thử lại.' });
        } else if (errCode === 400 || errCode === 401 || errCode === 403) {
          setKeyTestResult({ ok: false, msg: '❌ API Key không hợp lệ hoặc bị từ chối. Hãy tạo key mới tại aistudio.google.com.' });
        } else {
          setKeyTestResult({ ok: false, msg: `❌ Lỗi ${errCode}: ${json?.error?.message || 'Không xác định'}` });
        }
      }
    } catch {
      setKeyTestResult({ ok: false, msg: '❌ Không kết nối được đến Google API. Kiểm tra mạng internet.' });
    } finally {
      setIsTestingKey(false);
    }
  };

  // Stage 1 State
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);

  // Stage 2 State
  const [needs, setNeeds] = useState<TeacherNeeds>({
    questionType: [],
    cognitiveLevel: ['Nhận biết'],
    studentLevel: 'Trung bình',
    purpose: 'Luyện tập',
    counts: {}
  });

  // Mode 1 State
  const [m1QuestionTypes, setM1QuestionTypes] = useState<string[]>([]);
  const [m1RawText, setM1RawText] = useState('');
  const [m1IsExtracting, setM1IsExtracting] = useState(false);
  const [m1FileInfo, setM1FileInfo] = useState<{ name: string; type: string } | null>(null);
  const [m1DocxImages, setM1DocxImages] = useState<string[]>([]); // base64 data URLs of images in DOCX
  const m1FileInputRef = useRef<HTMLInputElement>(null);

  // Mode 2 / Shared State
  const [questions, setQuestions] = useState<string | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<QuestionItem[]>([]);
  const [activities, setActivities] = useState<string | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const callGeminiWithFallback = async (parts: any[], onStatus?: (msg: string | null) => void) => {
    const currentApiKey = apiKey || process.env.GEMINI_API_KEY || '';
    if (!currentApiKey) {
      throw new Error("Vui lòng thiết lập API Key trong phần Cài đặt.");
    }
    const genAI = new GoogleGenAI({ apiKey: currentApiKey });

    // Helper: parse error code from error object
    const getErrCode = (err: any): number => {
      try {
        const parsed = typeof err.message === 'string' ? JSON.parse(err.message) : err;
        return parsed?.error?.code || err?.status || 0;
      } catch { return err?.status || 0; }
    };

    const getRetryDelay = (err: any): number => {
      try {
        const parsed = typeof err.message === 'string' ? JSON.parse(err.message) : err;
        const details = parsed?.error?.details || [];
        const retryInfo = details.find((d: any) => d['@type']?.includes('RetryInfo'));
        if (retryInfo?.retryDelay) {
          return parseInt(retryInfo.retryDelay) || 15;
        }
      } catch { /* ignore */ }
      return 15;
    };

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Determine priority list
    const modelsToTry = [selectedModel, ...AI_MODELS.filter(m => m.id !== selectedModel).map(m => m.id)];
    let lastError: any = null;
    const MAX_RETRIES = 3;

    for (const modelId of modelsToTry) {
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          const response = await genAI.models.generateContent({
            model: modelId,
            contents: { parts }
          });
          return response.text;
        } catch (err: any) {
          console.warn(`Lỗi khi gọi model ${modelId} (lần ${attempt + 1}):`, err);
          lastError = err;
          const code = getErrCode(err);

          // Auto-retry on rate limit (429) or server error (503)
          if ((code === 429 || code === 503) && attempt < MAX_RETRIES) {
            const delaySec = code === 429 ? getRetryDelay(err) : 5;
            const delayMs = Math.min(delaySec * 1000, 60000); // tối đa 60 giây
            const msg = `⏳ Đang chờ ${delaySec}s, thử lại lần ${attempt + 1}/${MAX_RETRIES}...`;
            console.log(msg);
            onStatus?.(msg);
            setRetryStatus(msg);
            await sleep(delayMs);
            onStatus?.(null);
            setRetryStatus(null);
            continue; // thử lại cùng model
          }

          // Non-retriable error or exhausted retries → switch to next model
          break;
        }
      }
    }

    // Build a friendly Vietnamese error message
    const code = getErrCode(lastError);
    if (code === 429) {
      throw new Error(`⚠️ Đã vượt quá giới hạn API miễn phí. Vui lòng chờ 1-2 phút rồi thử lại, hoặc kiểm tra hạn mức tại https://ai.dev/rate-limit`);
    } else if (code === 404) {
      throw new Error("⚠️ Model AI không tồn tại hoặc không được hỗ trợ. Vui lòng vào Cài đặt và chọn model khác.");
    } else if (code === 401 || code === 403) {
      throw new Error("⚠️ API Key không hợp lệ hoặc không có quyền. Vui lòng kiểm tra lại API Key trong Cài đặt.");
    } else if (code === 500 || code === 503) {
      throw new Error("⚠️ Máy chủ Gemini đang gặp sự cố. Vui lòng thử lại sau ít phút.");
    } else {
      throw new Error(lastError?.message?.startsWith('{')
        ? "⚠️ Đã xảy ra lỗi khi gọi API. Vui lòng thử lại."
        : (lastError?.message || "⚠️ Tất cả các model đều thất bại. Vui lòng thử lại sau."));
    }
  };

  const compressImage = (dataUrl: string, maxSize = 1024, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Scale down if larger than maxSize
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        // Compress as JPEG
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.src = dataUrl;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const raw = reader.result as string;
        // Compress image to reduce API payload and speed up analysis
        const compressed = await compressImage(raw);
        setSelectedImage(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    if (!inputText && !selectedImage) {
      setError('Vui lòng nhập văn bản hoặc tải lên hình ảnh bài học.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const parts: any[] = [
        {
          text: `Bạn là TRỢ LÍ ẢO THIẾT KẾ BÀI HỌC (AI đồng hành). Hãy thực hiện BƯỚC 1: PHÂN TÍCH BÀI HỌC.
        
        Nhiệm vụ: Trích xuất kiến thức chính từ dữ liệu.
        
        Cấu trúc phản hồi:
        ✅ Đã xong bước 1: Phân tích nội dung.
        
        📘 THẺ KIẾN THỨC BÀI HỌC:
        - 🏫 Cấp học: ...
        - 📚 Môn học: ...
        - 🔑 Kiến thức trọng tâm: (Gạch đầu dòng ngắn gọn)
        - ⚗️ Công thức/Quy trình: (Sử dụng LaTeX nếu có)
        
        👉 Tiếp theo, chúng ta sẽ cùng làm rõ nhu cầu của bạn nhé!` }
      ];

      if (inputText) {
        parts.push({ text: `Nội dung văn bản: ${inputText}` });
      }

      if (selectedImage) {
        const base64Data = selectedImage.split(',')[1];
        // Detect MIME type from data URL
        const mimeMatch = selectedImage.match(/^data:(image\/\w+);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType
          }
        });
      }

      const text = await callGeminiWithFallback(parts);

      setAnalysis(text || "Không thể phân tích nội dung.");
      setStage('m2_needs');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Đã có lỗi xảy ra trong quá trình phân tích. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuestionsAndActivities = async () => {
    if (needs.questionType.length === 0) {
      setError('Vui lòng chọn ít nhất một dạng câu hỏi.');
      return;
    }
    if (needs.cognitiveLevel.length === 0) {
      setError('Vui lòng chọn ít nhất một mức độ nhận thức.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const countDetails = Object.entries(needs.counts)
        .filter(([key, val]) => val > 0)
        .map(([key, val]) => {
          const [type, level] = key.split('|');
          return `- ${type} [${level}]: ${val} câu`;
        })
        .join('\n');

      const prompt = `Bạn là TRỢ LÍ ẢO THIẾT KẾ BÀI HỌC (AI đồng hành). 
      Dựa trên nội dung bài học: ${analysis}
      
      Hãy thực hiện BƯỚC 3: SINH HỆ THỐNG CÂU HỎI và BƯỚC 4: GỢI Ý HOẠT ĐỘNG.
      
      Lựa chọn của giáo viên:
      - Dạng câu hỏi: ${needs.questionType.join(', ')}
      - Mức độ: ${needs.cognitiveLevel.join(', ')}
      - Học sinh: ${needs.studentLevel}
      - Mục đích: ${needs.purpose}
      - Số lượng: ${countDetails}

      Cấu trúc phản hồi BẮT BUỘC:
      
      ✅ Đã xong bước 2: Xác định nhu cầu.
      👉 Tiếp theo, chúng ta sẽ đến với hệ thống câu hỏi và hoạt động!

      ### 🎯 BƯỚC 3: HỆ THỐNG CÂU HỎI
      - Tạo đúng số lượng và định dạng.
      - QUAN TRỌNG: Bạn PHẢI trả về danh sách câu hỏi dưới định dạng mã JSON. Hãy bọc mã JSON này trong block \`\`\`json ... \`\`\`.
      - Cấu trúc JSON mong muốn là một mảng các đối tượng: 
      [
        {
          "id": "q1",
          "content": "Nội dung câu hỏi...",
          "options": ["Nội dung đáp án A", "Nội dung đáp án B", "Nội dung đáp án C", "Nội dung đáp án D"],
          "correctAnswer": "A",
          "type": "Trắc nghiệm khách quan",
          "level": "Nhận biết"
        }
      ]
      - LUẦN TUÂN THỦ: Options KHÔNG có chữ cái đầu (A., B., C.) — chỉ ghi thuần nội dung.
      - Công thức hóa học/toán học PHẢI dùng LaTeX bọc trong $...$. Ví dụ: $C_6H_{12}O_6$, $H_2O$.

      ### 🎮 BƯỚC 4: GỢI Ý HOẠT ĐỘNG HỌC TẬP
      
      🤖 HƯỚNG 1: HOẠT ĐỘNG TRỰC TIẾP (XU HƯỚNG HIỆN ĐẠI)
      - Gợi ý 2-3 hoạt động cuốn hút (như đóng vai, tranh biện, trạm học tập, giải mã).
      - Mỗi hoạt động: Tên bắt tai, Mục tiêu, Cách tổ chức sáng tạo.

      🌐 HƯỚNG 2: TRÒ CHƠI TƯƠNG TÁC SỐ & GEN Z
      - Gợi ý các trò chơi mang tính xu hướng (như Escape room, thi đấu xếp hạng) trên Kahoot, Quizizz, Blooket, Wordwall.
      - Mỗi trò chơi: Tên trò chơi, Mô tả ý tưởng kịch bản hấp dẫn ứng dụng kiến thức bài học, format dễ dàng để giáo viên tự tạo trên nền tảng.

      Ngôn ngữ thân thiện, ngắn gọn, tích cực. Sử dụng biểu tượng 📘 🎯 🎮 🤖.`;

      const text = await callGeminiWithFallback([{ text: prompt }]);

      const fullText = text || "";
      setQuestions(fullText);
      setStage('m2_questions');
      
      // Parse JSON from fullText
      const jsonMatch = fullText.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          const parsed = safeParseJSON(jsonMatch[1]);
          if (Array.isArray(parsed)) {
            setParsedQuestions(applyLatexToQuestions(parsed));
          }
        } catch (e) {
          console.error("Lỗi parse JSON câu hỏi:", e);
        }
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Đã có lỗi xảy ra khi tạo câu hỏi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionChange = (id: string, field: string, value: any, optionIndex?: number) => {
    setParsedQuestions(prev => prev.map(q => {
      if (q.id === id) {
        if (field === 'options' && optionIndex !== undefined && q.options) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return { ...q, [field]: value };
      }
      return q;
    }));
  };

  const removeQuestion = (id: string) => {
    setParsedQuestions(prev => prev.filter(q => q.id !== id));
  };
  
  const addQuestion = () => {
    const newId = `q${Date.now()}`;
    setParsedQuestions(prev => [...prev, {
      id: newId,
      content: '',
      type: m1QuestionTypes[0] || needs.questionType[0] || 'Trắc nghiệm khách quan',
      level: needs.cognitiveLevel[0] || 'Nhận biết',
      options: ['', '', '', ''],
      correctAnswer: 'A'
    }]);
  };

  /**
   * Auto-convert plain chemical/math patterns to LaTeX if not already wrapped.
   * e.g.  C6H12O6  →  $C_6H_{12}O_6$
   *       (C6H10O5)n → $(C_6H_{10}O_5)_n$
   *       10^-10   →  $10^{-10}$
   */
  const autoLatex = (text: string): string => {
    if (!text) return text;
    
    // Bảo vệ markdown image syntax — tránh autoLatex phá URL base64
    const imgPlaceholders: string[] = [];
    let safeText = text.replace(/!\[[^\]]*\]\([^)]+\)/g, (match) => {
      imgPlaceholders.push(match);
      return `__IMG_PH_${imgPlaceholders.length - 1}__`;
    });
    
    // Chemical formula: sequences like C6H12O6, Fe2O3, H2SO4, (C6H10O5)n etc.
    safeText = safeText.replace(
      /(?<!\$)\b([A-Z][a-z]?\d*(?:[A-Z][a-z]?\d*)+(?:\([A-Z][a-z]?\d*(?:[A-Z][a-z]?\d*)*\)\d*)*)(?!\w)(?![^$]*\$)/g,
      (match) => {
        if (match.includes('__IMG_PH_')) return match;
        if (safeText.includes(`$${match}$`)) return match;
        const latex = match
          .replace(/\(([^)]+)\)(\d+)/g, '($1)_{$2}')
          .replace(/([A-Za-z])([0-9]+)/g, (_, l, n) => n.length > 1 ? `${l}_{${n}}` : `${l}_${n}`);
        return `$${latex}$`;
      }
    );
    
    // Khôi phục markdown image
    imgPlaceholders.forEach((img, idx) => {
      safeText = safeText.replace(`__IMG_PH_${idx}__`, img);
    });
    
    return safeText;
  };

  // Apply autoLatex to all fields in a question array
  const applyLatexToQuestions = (qs: any[]): any[] => qs.map(q => ({
    ...q,
    content: autoLatex(q.content || ''),
    options: (q.options || []).map((o: string) => {
      // Strip leading letter prefix like "A. ", "B) ", "A - " if present
      const stripped = o.replace(/^[A-Da-d][.)\-–]\s*/u, '').trim();
      return autoLatex(stripped);
    }),
    correctAnswer: autoLatex(q.correctAnswer || ''),
  }));

  /**
   * Export parsedQuestions to a Word-compatible .doc file (HTML-in-DOC technique).
   * Works without any extra npm packages — Word opens HTML blobs with .doc extension.
   */

  /**
   * Safely parse JSON from AI output.
   * Handles bad escape sequences that AI models sometimes produce.
   */
  const safeParseJSON = (raw: string): any => {
    try { return JSON.parse(raw); } catch { /* fall through */ }
    const fixed = raw
      .replace(/\\'/g, "'")
      .replace(/([^\\])\\([^"\\/bfnrtu0-9x])/g, '$1\\\\$2')
      .replace(/\r\n/g, '\\n').replace(/\r/g, '\\n').replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t');
    try { return JSON.parse(fixed); } catch { /* fall through */ }
    // Only match arrays that start with an object [{...}], NOT [Hình N] etc.
    const arrMatch = raw.match(/\[\s*\{[\s\S]*?\}\s*\]/);
    if (arrMatch) {
      try { return JSON.parse(arrMatch[0]); } catch { /* fall through */ }
      const fixedArr = arrMatch[0]
        .replace(/\\'/g, "'")
        .replace(/([^\\])\\([^"\\/bfnrtu0-9x])/g, '$1\\\\$2')
        .replace(/\r\n/g, '\\n').replace(/\r/g, '\\n').replace(/\n/g, '\\n')
        .replace(/\t/g, '\\t');
      try { return JSON.parse(fixedArr); } catch { /* fall through */ }
    }
    throw new Error('Kh\u00f4ng th\u1ec3 ph\u00e2n t\u00edch JSON t\u1eeb ph\u1ea3n h\u1ed3i AI.');
  };

  // Load JSZip from CDN (for extracting images from DOCX)
  const loadJSZip = (): Promise<any> => new Promise((resolve, reject) => {
    const w = window as any;
    if (w.JSZip) { resolve(w.JSZip); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    script.onload = () => resolve(w.JSZip);
    script.onerror = () => reject(new Error('Không tải được JSZip.'));
    document.head.appendChild(script);
  });

  // Load PDF.js from CDN (for extracting images from PDF)
  const loadPdfJs = (): Promise<any> => new Promise((resolve, reject) => {
    const w = window as any;
    if (w.pdfjsLib) { resolve(w.pdfjsLib); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.9.155/pdf.min.mjs';
    script.type = 'module';
    // Fallback: use dynamic import for module
    import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.9.155/pdf.min.mjs' as any)
      .then((mod: any) => {
        w.pdfjsLib = mod;
        mod.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.9.155/pdf.worker.min.mjs';
        resolve(mod);
      })
      .catch(() => {
        // If dynamic import fails, try script tag approach
        script.onload = () => resolve(w.pdfjsLib);
        script.onerror = () => reject(new Error('Không tải được PDF.js.'));
        document.head.appendChild(script);
      });
  });

  /**
   * Trích xuất ảnh từ PDF bằng kỹ thuật render canvas + grid-based image detection.
   * Tham khảo từ pdf-processor.js trong thư mục "code web pdf to word".
   */
  const extractImagesFromPdf = async (arrayBuffer: ArrayBuffer): Promise<string[]> => {
    try {
      const pdfjsLib = await loadPdfJs();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pageCount = pdf.numPages;
      const allImages: string[] = [];
      const SCALE = 2.5;

      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: SCALE });

          // Render page to canvas
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d')!;
          await page.render({ canvasContext: ctx, viewport }).promise;

          // Get text bounding boxes to exclude text regions
          const textContent = await page.getTextContent();
          const textBoxes: { x: number; y: number; w: number; h: number }[] = [];
          for (const item of textContent.items as any[]) {
            if (!item.str || !item.str.trim()) continue;
            const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
            const x = tx[4];
            const y = tx[5] - Math.abs(item.height * SCALE);
            const w = Math.abs(item.width * SCALE);
            const h = Math.abs(item.height * SCALE) + 4;
            if (w > 0 && h > 0) {
              textBoxes.push({ x: x - 2, y: y - 2, w: w + 4, h: h + 4 });
            }
          }

          // Grid-based image region detection
          const gridSize = 6;
          const W = canvas.width, H = canvas.height;
          const minArea = W * H * 0.008;
          const imageData = ctx.getImageData(0, 0, W, H);
          const pixels = imageData.data;
          const cols = Math.ceil(W / gridSize), rows = Math.ceil(H / gridSize);
          const contentMask = new Uint8Array(cols * rows);

          // Build content mask: mark cells with non-white content that aren't text
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const cellX = c * gridSize, cellY = r * gridSize;
              const cellW = Math.min(gridSize, W - cellX), cellH = Math.min(gridSize, H - cellY);

              // Skip cells covered by text
              let coveredByText = false;
              for (const box of textBoxes) {
                if (cellX < box.x + box.w && cellX + cellW > box.x && cellY < box.y + box.h && cellY + cellH > box.y) {
                  coveredByText = true; break;
                }
              }
              if (coveredByText) continue;

              // Sample pixels in cell
              let nonWhiteCount = 0;
              const step = Math.max(1, Math.floor(gridSize / 3));
              let totalSamples = 0;
              for (let dy = 0; dy < cellH; dy += step) {
                for (let dx = 0; dx < cellW; dx += step) {
                  const px = cellX + dx, py = cellY + dy;
                  if (px >= W || py >= H) continue;
                  totalSamples++;
                  const idx = (py * W + px) * 4;
                  const R = pixels[idx], G = pixels[idx + 1], B = pixels[idx + 2], A = pixels[idx + 3];
                  if (A < 10) continue;
                  if (!(R >= 240 && G >= 240 && B >= 240)) nonWhiteCount++;
                }
              }
              if (totalSamples > 0 && nonWhiteCount / totalSamples >= 0.2) {
                contentMask[r * cols + c] = 1;
              }
            }
          }

          // Flood fill to find connected regions
          const visited = new Uint8Array(cols * rows);
          const regions: { x: number; y: number; width: number; height: number }[] = [];
          const pad = 10;

          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              if (!contentMask[r * cols + c] || visited[r * cols + c]) continue;
              const queue: [number, number][] = [[r, c]];
              visited[r * cols + c] = 1;
              let minR = r, maxR = r, minC = c, maxC = c, cellCount = 0;

              while (queue.length > 0) {
                const [cr, cc] = queue.shift()!;
                cellCount++;
                minR = Math.min(minR, cr); maxR = Math.max(maxR, cr);
                minC = Math.min(minC, cc); maxC = Math.max(maxC, cc);
                for (let dr = -1; dr <= 1; dr++) {
                  for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = cr + dr, nc = cc + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && contentMask[nr * cols + nc] && !visited[nr * cols + nc]) {
                      visited[nr * cols + nc] = 1;
                      queue.push([nr, nc]);
                    }
                  }
                }
              }

              const rx = Math.max(0, minC * gridSize - pad);
              const ry = Math.max(0, minR * gridSize - pad);
              const rw = Math.min(W - rx, (maxC - minC + 1) * gridSize + pad * 2);
              const rh = Math.min(H - ry, (maxR - minR + 1) * gridSize + pad * 2);
              const area = cellCount * gridSize * gridSize;

              if (area >= minArea && rw >= 60 && rh >= 40) {
                regions.push({ x: rx, y: ry, width: rw, height: rh });
              }
            }
          }

          // Merge overlapping regions
          let merged = [...regions];
          let changed = true;
          while (changed) {
            changed = false;
            const result: typeof merged = [];
            const used = new Array(merged.length).fill(false);
            for (let i = 0; i < merged.length; i++) {
              if (used[i]) continue;
              let a = merged[i];
              for (let j = i + 1; j < merged.length; j++) {
                if (used[j]) continue;
                const b = merged[j];
                const gap = 20;
                if (a.x < b.x + b.width + gap && a.x + a.width + gap > b.x &&
                    a.y < b.y + b.height + gap && a.y + a.height + gap > b.y) {
                  const nx = Math.min(a.x, b.x), ny = Math.min(a.y, b.y);
                  a = { x: nx, y: ny, width: Math.max(a.x + a.width, b.x + b.width) - nx, height: Math.max(a.y + a.height, b.y + b.height) - ny };
                  used[j] = true; changed = true;
                }
              }
              result.push(a);
            }
            merged = result;
          }

          // Crop each region to data URL
          for (const region of merged) {
            const offscreen = document.createElement('canvas');
            offscreen.width = Math.max(1, region.width);
            offscreen.height = Math.max(1, region.height);
            const offCtx = offscreen.getContext('2d')!;
            offCtx.drawImage(canvas, region.x, region.y, region.width, region.height, 0, 0, region.width, region.height);
            const dataUrl = offscreen.toDataURL('image/png', 0.95);
            // Skip tiny images (likely noise)
            if (dataUrl.length > 1000) {
              allImages.push(dataUrl);
            }
          }

          console.log(`📄 PDF Trang ${pageNum}: ${merged.length} ảnh phát hiện`);
        } catch (e) {
          console.warn(`PDF Trang ${pageNum} lỗi trích xuất ảnh:`, e);
        }
      }

      console.log(`✅ PDF: Tổng ${allImages.length} ảnh trích xuất`);
      return allImages;
    } catch (e) {
      console.warn('Không thể trích xuất ảnh từ PDF:', e);
      return [];
    }
  };

  // Extract text + images from DOCX or PDF.
  // DOCX: XML technique — parse word/document.xml to preserve layout + image positions exactly.
  // PDF: Gemini inline base64.
  const extractTextFromFile = async (file: File) => {
    setM1IsExtracting(true); setError(null); setM1DocxImages([]);
    try {
      const currentApiKey = apiKey || process.env.GEMINI_API_KEY || '';
      if (!currentApiKey) { setError('Vui lòng thiết lập API Key trước.'); setM1IsExtracting(false); return; }

      const isDocx = file.name.toLowerCase().endsWith('.docx');
      const arrayBuffer = await file.arrayBuffer();

      if (isDocx) {
        // ── DOCX: kỹ thuật XML ────────────────────────────────────
        const JSZip = await loadJSZip();
        const zip = await JSZip.loadAsync(arrayBuffer);

        // 1. Extract images from word/media/
        const imageFiles = Object.keys(zip.files)
          .filter(n => n.startsWith('word/media/') && !zip.files[n].dir)
          .sort();
        const imageDataUrls: string[] = await Promise.all(
          imageFiles.map(async (imgPath) => {
            const ext = imgPath.split('.').pop()?.toLowerCase() || 'png';
            const mimeMap: Record<string, string> = {
              png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
              gif: 'image/gif', bmp: 'image/bmp', webp: 'image/webp',
            };
            const imgMime = mimeMap[ext] || 'image/png';
            const b64 = await zip.files[imgPath].async('base64');
            return `data:${imgMime};base64,${b64}`;
          })
        );
        setM1DocxImages(imageDataUrls);

        // 2. Parse relationships: rId → image index (1-based)
        const relsXml = await zip.files['word/_rels/document.xml.rels']?.async('string') || '';
        const relsDoc = new DOMParser().parseFromString(relsXml, 'text/xml');
        const rIdToImg: Record<string, number> = {};
        Array.from(relsDoc.getElementsByTagName('Relationship')).forEach(rel => {
          const target = rel.getAttribute('Target') || '';
          const id = rel.getAttribute('Id') || '';
          if (target.startsWith('media/')) {
            const basename = target.replace('media/', '');
            const fileIdx = imageFiles.findIndex(f => f.endsWith('/' + basename));
            if (fileIdx >= 0) rIdToImg[id] = fileIdx + 1;
          }
        });

        // 3. Parse word/document.xml — walk body → build structured text
        const docXml = await zip.files['word/document.xml']?.async('string') || '';
        const xmlDoc = new DOMParser().parseFromString(docXml, 'text/xml');
        const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
        const DML = 'http://schemas.openxmlformats.org/drawingml/2006/main';
        const RREL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
        const WPD = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing';

        const getParagraphText = (para: Element): string => {
          // Find drawing elements (images) in this paragraph
          const imageLabels: string[] = [];
          ['inline', 'anchor'].forEach(tag => {
            Array.from(para.getElementsByTagNameNS(WPD, tag)).forEach(d => {
              const blips = d.getElementsByTagNameNS(DML, 'blip');
              if (blips.length > 0) {
                const rId = blips[0].getAttributeNS(RREL, 'embed') || blips[0].getAttribute('r:embed') || '';
                const imgNum = rIdToImg[rId];
                if (imgNum) imageLabels.push(`[Hình ${imgNum}]`);
              }
            });
          });

          // Get text runs
          let text = '';
          Array.from(para.getElementsByTagNameNS(W, 'r')).forEach(run => {
            Array.from(run.getElementsByTagNameNS(W, 't')).forEach(t => {
              text += t.textContent || '';
            });
          });

          return imageLabels.length > 0
            ? `${imageLabels.join(' ')} ${text}`.trim()
            : text.trim();
        };

        const body = xmlDoc.getElementsByTagNameNS(W, 'body')[0];
        if (!body) throw new Error('Không tìm thấy nội dung trong file Word.');

        const lines: string[] = [];
        Array.from(body.childNodes).forEach(node => {
          if (!(node instanceof Element)) return;
          if (node.localName === 'p') {
            const line = getParagraphText(node);
            if (line) lines.push(line);
          } else if (node.localName === 'tbl') {
            Array.from(node.getElementsByTagNameNS(W, 'tr')).forEach(row => {
              const cells = Array.from(row.getElementsByTagNameNS(W, 'tc'))
                .map(cell => {
                  return Array.from(cell.getElementsByTagNameNS(W, 'p'))
                    .map(p => getParagraphText(p)).filter(Boolean).join(' ');
                });
              if (cells.some(c => c)) lines.push(cells.join('\t'));
            });
          }
        });

        // Use directly — no Gemini needed for DOCX text extraction
        setM1RawText(lines.join('\n'));

      } else {
        // ── PDF: Gemini inline base64 + trích xuất ảnh ─────────────
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        const base64 = btoa(binary);

        const prompt = `Hãy trích xuất TOÀN BỘ nội dung văn bản từ tài liệu PDF này (câu hỏi, đáp án, v.v.). Nếu có hình ảnh/biểu đồ, đánh dấu vị trí bằng [Hình 1], [Hình 2]... theo thứ tự. Giữ nguyên cấu trúc, đánh số. Chỉ trả về văn bản thuần túy.`;
        const text = await callGeminiWithFallback([
          { text: prompt },
          { inlineData: { data: base64, mimeType: 'application/pdf' } },
        ]);
        setM1RawText(text || '');

        // Trích xuất ảnh từ PDF bằng kỹ thuật render canvas
        try {
          const pdfImages = await extractImagesFromPdf(arrayBuffer);
          if (pdfImages.length > 0) {
            setM1DocxImages(pdfImages);
            console.log(`✅ PDF: đã trích xuất ${pdfImages.length} ảnh`);
          }
        } catch (imgErr) {
          console.warn('Không trích xuất được ảnh từ PDF:', imgErr);
        }
      }

      setM1IsExtracting(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Đã có lỗi xảy ra khi trích xuất nội dung. Vui lòng thử lại.');
      setM1IsExtracting(false);
    }
  };

  const parseM1QuestionsWithAI = async () => {
    if (!m1RawText.trim()) { setError('Vui lòng nhập nội dung câu hỏi.'); return; }
    setIsLoading(true); setError(null);
    try {
      const currentApiKey = apiKey || process.env.GEMINI_API_KEY || '';
      if (!currentApiKey) { setError('Vui lòng thiết lập API Key trước.'); setIsLoading(false); return; }

      const questionTypes = m1QuestionTypes.join(', ') || 'Trắc nghiệm khách quan';
      const firstType = m1QuestionTypes[0] || 'Trắc nghiệm khách quan';

      // ── Prompt cực ngắn gọn, rõ ràng ──────────────────────────
      const prompt = `Phân tích văn bản câu hỏi sau. Dạng câu hỏi: ${questionTypes}.
Trả về JSON object với key "questions" chứa mảng câu hỏi.
Mỗi câu: {"id":"q1","content":"...","options":["...","...","...","..."],"correctAnswer":"A","type":"${firstType}","level":"Nhận biết"}
Quy tắc:
- content: nội dung câu hỏi đầy đủ (giữ [Hình 1], [Hình 2] nếu có)
- options: chỉ nội dung, KHÔNG có "A." "B." "C." "D."
- correctAnswer: "A"/"B"/"C"/"D"; câu Đúng/Sai: "Đúng"/"Sai"; trả lời ngắn: đáp án thực tế
- Công thức: $H_2O$, $C_6H_{12}O_6$ (LaTeX trong dấu $)

Văn bản:
${m1RawText}`;

      // ── Thử JSON mode với object wrapper (hỗ trợ tốt hơn array top-level) ──
      const MODELS = [selectedModel, ...AI_MODELS.filter(m => m.id !== selectedModel).map(m => m.id)];
      let parsed: any[] | null = null;
      let lastAiResponse = '';

      for (const modelId of MODELS) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${currentApiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  responseMimeType: 'application/json',
                  responseSchema: {
                    type: 'object',
                    properties: {
                      questions: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id:            { type: 'string' },
                            content:       { type: 'string' },
                            options:       { type: 'array', items: { type: 'string' } },
                            correctAnswer: { type: 'string' },
                            type:          { type: 'string' },
                            level:         { type: 'string' },
                          },
                          required: ['id', 'content', 'correctAnswer', 'type', 'level'],
                        },
                      },
                    },
                    required: ['questions'],
                  },
                },
              }),
            }
          );
          const data = await res.json();

          if (!res.ok) {
            const code = data?.error?.code || res.status;
            // 400/404 = model/feature không hỗ trợ → thử model tiếp
            if (code === 400 || code === 404) continue;
            // 429 rate limit → thử model tiếp
            if (code === 429) { await new Promise(r => setTimeout(r, 3000)); continue; }
            throw new Error(data?.error?.message || `Lỗi API ${res.status}`);
          }

          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          lastAiResponse = rawText;
          console.log('[JSON Mode] Response:', rawText.slice(0, 300));

          if (rawText) {
            try {
              const obj = JSON.parse(rawText);
              const arr = Array.isArray(obj) ? obj : (obj?.questions || []);
              if (Array.isArray(arr) && arr.length > 0) { parsed = arr; break; }
            } catch { /* tiếp tục */ }
          }
        } catch (modelErr: any) {
          console.warn(`JSON mode failed [${modelId}]:`, modelErr.message);
        }
      }

      // ── Fallback: text mode + regex ──────────────────────────────
      if (!parsed) {
        console.log('[Fallback] Trying text mode...');
        const fallbackPrompt = `Trả về JSON mảng câu hỏi từ văn bản này. Bọc trong \`\`\`json\n...\n\`\`\`.
Dạng: ${questionTypes}. Mỗi phần tử: {"id":"q1","content":"...câu hỏi...","options":["...","...","...","..."],"correctAnswer":"A","type":"${firstType}","level":"Nhận biết"}
options không có A. B. — chỉ nội dung. correctAnswer: A/B/C/D hoặc Đúng/Sai hoặc đáp án thực.
Văn bản:\n${m1RawText.slice(0, 8000)}`; // Giới hạn 8000 ký tự

        try {
          const fallbackText = await callGeminiWithFallback([{ text: fallbackPrompt }]);
          lastAiResponse = fallbackText || '';
          console.log('[Fallback] Response:', lastAiResponse.slice(0, 300));

          // Thử tất cả cách parse
          const raw = lastAiResponse;

          // (1) Tìm ```json block
          const blockMatch = raw.match(/```json\s*\r?\n?([\s\S]*?)\r?\n?\s*```/);
          const candidate1 = blockMatch?.[1]?.trim();

          // (2) Tìm [{...}] array
          const arrMatch = raw.match(/\[\s*\{[\s\S]*\}\s*\]/);

          // (3) Tìm {...} object
          const objMatch = raw.match(/\{[\s\S]*"questions"[\s\S]*\}/);

          for (const candidate of [candidate1, arrMatch?.[0], objMatch?.[0]].filter(Boolean)) {
            try {
              const obj = JSON.parse(candidate as string);
              const arr = Array.isArray(obj) ? obj : (obj?.questions || []);
              if (Array.isArray(arr) && arr.length > 0) { parsed = arr; break; }
            } catch { /* tiếp tục */ }
          }
        } catch (fallbackErr: any) {
          console.error('[Fallback] Error:', fallbackErr);
        }
      }

      // ── Không parse được → thông báo rõ lý do ──────────────────
      if (!parsed || parsed.length === 0) {
        const preview = lastAiResponse?.slice(0, 200) || '(trống)';
        setError(`AI không trả về câu hỏi hợp lệ. Phản hồi AI: "${preview}..." — Hãy thử lại hoặc nhập thủ công.`);
        return;
      }

      // ── Inject ảnh DOCX/PDF ──────────────────────────────────────
      const withImages = parsed.map((q: any) => {
        let content: string = q.content || '';
        let firstImageUrl: string | undefined = undefined;
        content = content.replace(/\[Hình\s*(\d+)\]/gi, (_m: string, n: string) => {
          const i = parseInt(n, 10) - 1;
          if (i >= 0 && i < m1DocxImages.length) {
            if (!firstImageUrl) firstImageUrl = m1DocxImages[i];
            return `\n\n![Hình ${n}](${m1DocxImages[i]})\n\n`;
          }
          return _m;
        });
        return { ...q, content, imageUrl: firstImageUrl || q.imageUrl };
      });

      setParsedQuestions(applyLatexToQuestions(withImages));
      setStage('m1_edit');

    } catch (e: any) {
      setError(e.message || 'Lỗi không xác định. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };


  const reset = () => {
    setStage('home');
    setInputText(''); setSelectedImage(null); setAnalysis(null);
    setQuestions(null); setParsedQuestions([]); setActivities(null);
    setError(null); setSelectedGameId(null);
    setM1QuestionTypes([]); setM1RawText(''); setM1DocxImages([]);
  };

  const processLatexForWord = (text: string): string => {
    if (!text) return '';

    // Unicode superscript/subscript digit maps
    const supDigits: Record<string, string> = { '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','+':'⁺','-':'⁻','n':'ⁿ','a':'ᵃ','b':'ᵇ','c':'ᶜ','d':'ᵈ','e':'ᵉ','i':'ⁱ','j':'ʲ','k':'ᵏ','m':'ᵐ','o':'ᵒ','p':'ᵖ','r':'ʳ','s':'ˢ','t':'ᵗ','u':'ᵘ','v':'ᵛ','x':'ˣ' };
    const subDigits: Record<string, string> = { '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉','+':'₊','-':'₋','a':'ₐ','e':'ₑ','o':'ₒ','x':'ₓ','n':'ₙ','i':'ᵢ' };

    const toSup = (s: string) => s.split('').map(c => supDigits[c] ?? c).join('');
    const toSub = (s: string) => s.split('').map(c => subDigits[c] ?? c).join('');

    // Greek and common math symbols
    const greekMap: Record<string, string> = {
      'alpha':'α','beta':'β','gamma':'γ','delta':'δ','epsilon':'ε','zeta':'ζ','eta':'η','theta':'θ',
      'iota':'ι','kappa':'κ','lambda':'λ','mu':'μ','nu':'ν','xi':'ξ','pi':'π','rho':'ρ',
      'sigma':'σ','tau':'τ','upsilon':'υ','phi':'φ','chi':'χ','psi':'ψ','omega':'ω',
      'Alpha':'Α','Beta':'Β','Gamma':'Γ','Delta':'Δ','Theta':'Θ','Lambda':'Λ','Pi':'Π',
      'Sigma':'Σ','Phi':'Φ','Psi':'Ψ','Omega':'Ω',
      'pm':'±','times':'×','div':'÷','leq':'≤','geq':'≥','neq':'≠','approx':'≈',
      'infty':'∞','cdot':'·','rightarrow':'→','leftarrow':'←','Rightarrow':'⇒',
      'sqrt':'√','sum':'∑','prod':'∏','int':'∫','partial':'∂','nabla':'∇',
      'AA':'Å', 'degree':'°',
    };

    const convertLatex = (math: string): string => {
      let result = math.trim();

      // Remove display mode markers
      result = result.replace(/\\displaystyle\s*/g, '');

      // Replace \text{...} → content as-is
      result = result.replace(/\\text\{([^}]*)\}/g, '$1');

      // Replace \mathrm{...}, \mathbf{...}, \mathit{...} → content
      result = result.replace(/\\math(?:rm|bf|it|sf|tt|cal)\{([^}]*)\}/g, '$1');

      // Replace \frac{a}{b} → a⁄b
      result = result.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1⁄$2)');

      // Replace \sqrt{x} → √(x)
      result = result.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');

      // Replace superscripts: ^{...} → unicode sup chars, ^x → single sup
      result = result.replace(/\^\{([^}]+)\}/g, (_, g) => toSup(g));
      result = result.replace(/\^([A-Za-z0-9+\-])/g, (_, g) => toSup(g));

      // Replace subscripts: _{...} → unicode sub chars, _x → single sub
      result = result.replace(/_\{([^}]+)\}/g, (_, g) => toSub(g));
      result = result.replace(/_([A-Za-z0-9+\-])/g, (_, g) => toSub(g));

      // Replace known \commands
      result = result.replace(/\\([A-Za-z]+)/g, (_, cmd) => greekMap[cmd] ?? cmd);

      // Cleanup braces
      result = result.replace(/[{}]/g, '');

      return result;
    };

    // Replace $$ ... $$ (display) and $ ... $ (inline)
    return text.replace(/\$\$([\s\S]*?)\$\$|\$([^$\n]+?)\$/g, (match, g1, g2) => {
      const inner = (g1 ?? g2 ?? '').trim();
      if (!inner) return match;
      return convertLatex(inner);
    });
  };


  const downloadAsWord = () => {
    if (!parsedQuestions || parsedQuestions.length === 0) {
      alert("Chưa có câu hỏi nào để tải xuống!");
      return;
    }

    let html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
      <meta charset='utf-8'>
      <title>Export</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.5; }
        p { margin: 0 0 8pt 0; }
        .q-blue { color: #002da7; font-weight: bold; }
        .opt-letter { font-weight: bold; }
        u { text-decoration: underline; }
      </style>
      </head>
      <body>
    `;

    parsedQuestions.forEach((q, idx) => {
      const qContent = processLatexForWord(q.content);
      html += `<p><span class="q-blue">Câu ${idx + 1}.</span> ${qContent}</p>`;
      
      if (q.options && q.options.length > 0) {
        // Bảng 4 cột cân bằng để hiển thị đáp án giống MS Word chuẩn
        html += `<table width="100%" style="margin-bottom: 8pt; border-collapse: collapse; border: none;"><tr>`;
        q.options.forEach((opt, oIdx) => {
          const letter = ['A', 'B', 'C', 'D'][oIdx] || '';
          let optHtml = `<span class="opt-letter">${letter}.</span> ${processLatexForWord(opt)}`;
          if (q.correctAnswer === letter) {
            optHtml = `<u>${optHtml}</u>`;
          }
          // Tự động chia độ rộng tương ứng số đáp án (thường là 4 -> 25%)
          html += `<td width="${100 / q.options.length}%" valign="top">${optHtml}</td>`;
        });
        html += `</tr></table>`;
      } else if (q.correctAnswer) {
         html += `<p><b><u>Đáp án:</u></b> ${processLatexForWord(q.correctAnswer)}</p>`;
      }
    });

    html += `</body></html>`;

    // Export dưới dạng .doc (MS Word hỗ trợ đọc HTML schema native)
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'CauHoi_SmartEdu.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const getQuestionsPart = () => {
    if (!questions) return '';
    const parts = questions.split('### 🎮 BƯỚC 4');
    return parts[0] || questions;
  };

  const getActivitiesPart = () => {
    if (!questions) return '';
    const parts = questions.split('### 🎮 BƯỚC 4');
    if (!parts[1]) return 'Đang chuẩn bị các hoạt động thú vị cho bạn...';

    return `### 🎮 BƯỚC 4${parts[1]}`;
  };

  // ─────────────── HELPERS ───────────────
  const m2Steps = ['Nhập bài học', 'Phân tích', 'Nhu cầu', 'Sửa câu hỏi', 'Chọn game'];
  const m2StepIdx: Record<AppStage, number> = {
    home: -1, m1_type: -1, m1_input: -1, m1_edit: -1, m1_game: -1,
    m2_analyze: 0, m2_needs: 2, m2_questions: 3, m2_game: 4,
  };
  const m1Steps = ['Dạng câu hỏi', 'Nhập câu hỏi', 'Chỉnh sửa', 'Chọn game'];
  const m1StepIdx: Record<AppStage, number> = {
    home: -1, m2_analyze: -1, m2_needs: -1, m2_questions: -1, m2_game: -1,
    m1_type: 0, m1_input: 1, m1_edit: 2, m1_game: 3,
  };
  const isM1 = ['m1_type','m1_input','m1_edit','m1_game'].includes(stage);
  const isM2 = ['m2_analyze','m2_needs','m2_questions','m2_game'].includes(stage);
  const curM1 = m1StepIdx[stage];
  const curM2 = m2StepIdx[stage];

  const StepBar = ({ steps, current }: { steps: string[]; current: number }) => (
    <div className="steps">
      {steps.map((s, i) => (
        <>
          {i > 0 && <div key={`sep-${i}`} className={`step-sep${i <= current ? ' step-sep--done' : ''}`} />}
          <div key={s} className={`step${i < current ? ' step--done' : i === current ? ' step--active' : ''}`}>
            <div className="step-num">
              {i < current ? '✓' : i + 1}
            </div>
            <span className="hidden sm:inline">{s}</span>
          </div>
        </>
      ))}
    </div>
  );

  return (
    <div className="app-layout">
      {/* ── HEADER ── */}
      <header className="app-header">
        <div className="app-header-inner">
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={reset}>
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center overflow-hidden hover:scale-105 transition-transform active:scale-95 duration-200">
              <img alt="friendly mascot character" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmSJiKl98tZVAYx7gkYOpRphmxgZYcAPnF1fDMF1Fs7TQkYXkT6pHEnuQkBuAEwsX7Dm8zbjm3kero3MYDxmIRkLbRPTVKCsv5jX37c0EShmANz5NqiegbtKb9zWOeUdrTEqlJ-54EXf3NdB0Sc9xv_Lq1DNPmul5AzaqWx1BOZu9tkU2w4VwouYs6M5lWZi_4GrMspVjGR57BPuzcG7GQrQHBmAZL_Qtyx01p9gl8i1EBm0MkE9dzC6dkAuzQaDW4F-xyqLX0kPU"/>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-headline font-black text-3xl leading-none bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent tracking-tight">SmartEdu Play</h1>
              <p className="text-[11px] text-on-surface-variant/70 font-semibold mt-0.5 tracking-wide">Chào mừng bạn đến với SmartEdu Play! 👋</p>
              <p className="text-[9px] text-on-surface-variant/35 font-medium mt-0.5 tracking-wide select-none">Developed by cô Quỳnh Trang</p>
            </div>
          </div>

          {/* Step bar (center) */}
          <div className="flex-1 flex justify-center px-4 hidden md:flex">
            {isM1 && <StepBar steps={m1Steps} current={curM1} />}
            {isM2 && <StepBar steps={m2Steps} current={curM2} />}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {stage !== 'home' && (
              <button className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-primary hover:scale-105 transition-transform active:scale-95 duration-200" onClick={reset}>
                <span className="material-symbols-outlined">home</span>
              </button>
            )}
            <button className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-primary hover:scale-105 transition-transform active:scale-95 duration-200" onClick={() => setIsSettingsOpen(true)}>
                <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className={
        (stage === 'm1_game' || stage === 'm2_game') && selectedGameId
          ? 'app-main--fullwidth'
          : 'app-main'
      }>
        <AnimatePresence mode="wait">

          {/* ═══ HOME ═══ */}
          {stage === 'home' && (
            <motion.div key="home" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="space-y-12 max-w-5xl mx-auto w-full">
              {/* Combined Hero + Action Cards in one frame */}
              <section className="relative bg-gradient-to-br from-primary-container to-primary text-on-primary rounded-2xl overflow-hidden shadow-xl">
                {/* Decorative blobs */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-tertiary-container/30 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-secondary-container/20 rounded-full blur-2xl pointer-events-none" />

                {/* Hero row: text + small robot */}
                <div className="relative z-10 flex flex-row items-center justify-between gap-4 px-8 pt-8 pb-4">
                  <div className="flex-1 space-y-3">
                    <h2 className="font-headline text-3xl md:text-4xl font-extrabold leading-tight uppercase tracking-wide">SMART EDU PLAY<br/><span className="opacity-90">TẠO ĐIỂM NHẤN</span></h2>
                    <p className="text-base opacity-90 font-medium font-body">Học tập chưa bao giờ vui đến thế cùng người bạn robot thông minh.</p>
                  </div>
                  {/* Smaller robot image */}
                  <div className="relative flex-shrink-0 flex items-center justify-center">
                    <div className="absolute w-28 h-28 bg-white/20 rounded-full blur-2xl" />
                    <img
                      alt="friendly robot mascot"
                      className="w-28 md:w-36 z-10 drop-shadow-2xl"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDx7oooeNSK1o3faWc94sY9mdm9aBQwrKEMpY76Ddq3s8-oQ64EMeREZjJ-z3_2dFarh4rV5g1o2OimUsY12bExLWX2NJuwCWVsBAVjxoASsYnV6nequuzlvUKWwuiAat3PJuIH8iOp4iusp0hArmIbv7mfh5rktskgt7JJiSzm_8APCchfjulBapLIMBAvLAT_HF3y7HbYZv-_G7nrH7mVbwutEDemxhDA0vfzDitoJEC8nOazl_Rd1s5JgjviwYTmf-A1Ry4iTcM"
                    />
                  </div>
                </div>

                {/* Divider label */}
                <div className="relative z-10 px-8 pb-2">
                  <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Chọn chế độ</span>
                </div>

                {/* Two mode cards - inside same frame */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 px-8 pb-8">
                  {/* Mode 1: Tạo trò chơi — nền TRẮNG */}
                  <div
                    onClick={() => setStage('m1_type')}
                    className="group bg-white hover:bg-gray-50 rounded-2xl p-5 cursor-pointer transition-all duration-300 border border-white/60 hover:shadow-2xl"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                        <img alt="game mascot" className="w-8 h-8 rounded-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpp1vHqRfnLazWrQG9rlQmQtXCl8Y3kYF1e9q42pxWRdppCQ83fJJpM8aGMAzFO-GH7CgUZE4dO2FD-rUCBihAb997Nr_EpmeIqsqBmxKLfzDCRp24vg-tcw3X0YhJyw_sYp-OQiwyO-9m7ZBayduTqgaxSvjRwCVk7FsBpp9SoIHasMGqy97_jDFQ8uSRnqAKxUWp2DfffFBRPL5tcTX4LWGhgWJAx4P-xQFDASXP8bSfEFznpDz_5CeKFj0Q4FKTC5MeHzmC-BI"/>
                      </div>
                      <div>
                        <h3 className="font-headline text-lg font-extrabold text-primary">Tạo trò chơi</h3>
                        <p className="text-on-surface-variant text-xs font-medium">Dùng khi đã có bộ câu hỏi</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {[
                        { icon: 'checklist', text: 'Chọn dạng câu hỏi' },
                        { icon: 'upload_file', text: 'Dán text hoặc tải Word / PDF' },
                        { icon: 'sports_esports', text: 'Chọn trò chơi & chơi ngay' },
                      ].map(f => (
                        <div key={f.icon} className="flex items-center gap-2 bg-primary/8 rounded-xl px-2.5 py-1.5" style={{ background: 'rgba(0,85,196,0.06)' }}>
                          <span className="material-symbols-outlined text-primary text-sm">{f.icon}</span>
                          <span className="text-xs font-semibold text-on-surface-variant">{f.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mode 2: AI tạo câu hỏi — nền VÀNG */}
                  <div
                    onClick={() => { if (!apiKey) { setIsSettingsOpen(true); setIsApiKeyRequired(true); } else setStage('m2_analyze'); }}
                    className="group rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:shadow-2xl border border-yellow-300/60 hover:border-yellow-400"
                    style={{ background: 'linear-gradient(135deg, #fde68a 0%, #fbbf24 100%)' }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-yellow-900/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                        <img alt="AI mascot" className="w-8 h-8 rounded-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLAWUo7m24evPHHWO9qAHFbPleP_8DiagfcwiEq-oxB4YYZ5BVr8xyxy2x1fJmOOQallFzgP09uL1ZMaUmpNqQPbtnZUnVG3CM3tM0bN4U23fmTICpZiQeqtgDRyZ4EW_nYhV7qSDXKfomxqGQ9rKikVbxcJSZWu5KCOMSfi2HS6ejzAnBCKtgo8zibdHnLyW3dN3s7MO4Tsuz0Lu9IZ47IgJ2VYoFIwKGUP9FBiJdOLSv3N9BRc0q36RH39mCQIrPeHcuEokS49E"/>
                      </div>
                      <div>
                        <h3 className="font-headline text-lg font-extrabold text-yellow-900">AI tạo câu hỏi</h3>
                        <p className="text-yellow-800 text-xs font-medium">Tạo đề thông minh trong tích tắc</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {[
                        { icon: 'add_photo_alternate', text: 'Tải ảnh sách / nhập văn bản' },
                        { icon: 'auto_awesome', text: 'AI phân tích & sinh câu hỏi tự động' },
                        { icon: 'download', text: 'Tải về bản Word ngay sau khi tạo' },
                      ].map(f => (
                        <div key={f.icon} className="flex items-center gap-2 bg-yellow-900/10 rounded-xl px-2.5 py-1.5">
                          <span className="material-symbols-outlined text-yellow-800 text-sm">{f.icon}</span>
                          <span className="text-xs font-semibold text-yellow-900">{f.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>


              {/* Game Library Section */}
              <section className="space-y-8 pb-12">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-secondary font-bold tracking-widest text-sm font-label">XU HƯỚNG</span>
                    <h2 className="font-headline text-3xl font-extrabold text-primary">Trò chơi hot nhất</h2>
                  </div>
                  <button className="text-primary font-bold hover:underline font-label">Xem tất cả</button>
                </div>
                {/* Grid of Game Box Art */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {GAME_LIBRARY.slice(0, 4).map((g, idx) => {
                    const bgColors = [
                      'from-blue-400 to-indigo-500', 
                      'from-orange-400 to-red-500', 
                      'from-green-400 to-emerald-600', 
                      'from-purple-400 to-pink-500'
                    ];
                    const imgs = [
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuBuGX0aADHvsdFGMot8-B_C_FnNP_ltq1tg_ZecXP3jZ_C1J2OqrBKeli0DEf7po0Yv_ca1MdxyMNCWR4O7n_bbemaH8Xrjl3Tw-9A_2AK7StcAt2k8Tvgu9pVSo9geQeAMpg9kbJQbpG2JTNpnVie0SHl5aFMJQf41Sa82ODYLMMXPHPwvhSPEK4b87ScUh-JEAbUXPpdZTEdnJV0_ptE1V2ebnC9K_jep-y-6qzLbeuanTIYx4Unsy4PbIQ0g4oVY4tulrqaWkeU",
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuBl15WfhyoEmweWP4Uh9O0Bci8CbJYGciP7CbModpedBr-NlrOh0XLlLeI4Xgu6Xg3B37KzEM-JRP5EtpLdwoJjH5Pua3Nd8qytna1_z_8seQR8Nookx8EOnbK_HeURILqOIPdWD5p-axdTh66bOcDul0h9oFYGD51-ANhExbaGpXGHDY_ruwx8Bfmisa7j2KzmUWUwvldVCgxWtj8virtN_FDUKzJNRv0DNy6oq4uCGTiHR2EG6g42YyjRwbK0IyMVvoQWXkWhq0A",
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuBPFldud1i7ZwyWSfPsNIUlPlcnyveBjBgi2Kgb9enF33HmsH6zEKLIcBMuRhgazDM71SXtZZZJLLINhfH5JKievik24q7Onwii-TIbTq6sgmu5xgVn15l6wPrKwQZ0q2h9lyIiHUCoB3-MHDqU4qws47jOuomCRE5NGWPHT7hk1Q5byGaPZBzZ9dU7aup6dehnygW-isvjlpgAqwQHEnMWbewfLhl42BefL_GUJNMErxW8H2K_1fzCwFL40aC-2aD63v3BzRBrFBE",
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuBsD9nhM7F5F8XpJhSU6bGBgSkTFEHfiBrXXz61fGR4E1uMZoDjQKxZEEUaBCI0mMTWkJM5JT_lgn_SUmyRdrGoIOoJLLhPxB27cBvlmggimVU_wfMpdfQLLVWH6gmx3PWWzA71vBw5nIMLh1JAk0SkKZsnB4mR9WedRT_iMHDpsS4BFkrudNg7Tg9lq4_pGEzEWPSO3ULdz-wK6s5XEYRbeEELJMdceH3j7PoBtNWTj_Yx2Sxy2m9BhELsGwb2OTGCFPGgxdfCJGQ"
                    ];
                    return (
                      <div key={g.id} className="bg-surface-container-low rounded-xl overflow-hidden hover:scale-105 transition-transform cursor-pointer shadow-sm hover:shadow-xl">
                        <div className={`aspect-square bg-gradient-to-tr ${bgColors[idx]} p-4 relative`}>
                          <img alt="game box" className="w-full h-full object-contain" src={imgs[idx]}/>
                          <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-yellow-500 text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                            <span className="text-xs font-bold text-on-surface">{(5.0 - idx * 0.1).toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="p-4 bg-white">
                          <h4 className="font-headline font-bold text-on-surface truncate">{g.name}</h4>
                          <div className="flex items-center gap-2 mt-2">
                             <span className="text-xs font-semibold text-on-surface-variant line-clamp-1">{g.description}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </motion.div>
          )}


          {/* ═══ M1 BƯỜC 1: Chọn dạng câu hỏi ═══ */}
          {stage === 'm1_type' && (
            <motion.div key="m1_type" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
              style={{ maxWidth:760, margin:'0 auto' }}>
              <div className="card">
                <button className="btn btn-ghost btn--sm" style={{ marginBottom:12 }} onClick={reset}>
                  <ChevronRight size={14} style={{ transform:'rotate(180deg)' }} /> Trang chủ
                </button>
                <h2 style={{ fontSize:22, fontWeight:800, marginBottom:6, color:'var(--text)' }}>Chọn dạng câu hỏi bạn đang có</h2>
                <p style={{ color:'var(--text-3)', fontSize:13, marginBottom:20 }}>Chọn tối đa <strong>3 dạng</strong> — hệ thống sẽ gợi ý trò chơi phù hợp.</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginBottom:20 }}>
                  {QUESTION_TYPES.map(qt => {
                    const selected = m1QuestionTypes.includes(qt.id);
                    const disabled = !selected && m1QuestionTypes.length >= 3;
                    const compatibleGames = GAME_LIBRARY.filter(g => g.compatibleTypes.includes(qt.id));
                    return (
                      <button key={qt.id} disabled={disabled}
                        onClick={() => setM1QuestionTypes(prev => selected ? prev.filter(t => t !== qt.id) : [...prev, qt.id])}
                        style={{
                          padding:'14px 12px', borderRadius:12, border: selected ? '2px solid var(--blue)' : '1.5px solid var(--border)',
                          background: selected ? 'var(--blue-light)' : 'var(--white)', textAlign:'left', cursor: disabled ? 'not-allowed' : 'pointer',
                          opacity: disabled ? 0.4 : 1, transition:'all .2s'
                        }}>
                        <div style={{ fontSize:28, marginBottom:8 }}>{qt.emoji}</div>
                        <div style={{ fontWeight:700, fontSize:13, color: selected ? 'var(--blue-dark)' : 'var(--text)', marginBottom:4 }}>{qt.label}</div>
                        <div style={{ fontSize:11, color:'var(--text-3)' }}>{compatibleGames.map(g => g.name).join(' · ')}</div>
                      </button>
                    );
                  })}
                </div>

                {m1QuestionTypes.length > 0 && (
                  <div style={{ background:'var(--blue-light)', borderRadius:12, padding:'12px 16px', marginBottom:20 }}>
                    <p style={{ fontSize:13, fontWeight:600, color:'var(--blue-dark)', marginBottom:10 }}>🎮 Trò chơi phù hợp:</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                      {GAME_LIBRARY.filter(g => m1QuestionTypes.some(t => g.compatibleTypes.includes(t))).map(g => (
                        <span key={g.id} className="badge badge-blue">{g.emoji} {g.name}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <button className="btn btn-primary" onClick={() => setStage('m1_input')} disabled={m1QuestionTypes.length === 0}>
                    Tiếp theo: Nhập câu hỏi <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}


          {/* ═══ M1 BƯỜC 2: Nhập câu hỏi ═══ */}
          {stage === 'm1_input' && (
            <motion.div key="m1_input" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
              style={{ maxWidth:760, margin:'0 auto' }}>
              <div className="card">
                <button className="btn btn-ghost btn--sm" style={{ marginBottom:12 }} onClick={() => setStage('m1_type')}>
                  <ChevronRight size={14} style={{ transform:'rotate(180deg)' }} /> Quay lại
                </button>
                <h2 style={{ fontSize:22, fontWeight:800, marginBottom:4, color:'var(--text)' }}>Nhập câu hỏi</h2>
                <p style={{ color:'var(--text-3)', fontSize:13, marginBottom:20 }}>Tải file Word/PDF hoặc dán trực tiếp — AI sẽ phân tích cấu trúc ({m1QuestionTypes.join(', ')}).</p>

                {/* File upload */}
                <div
                  onClick={() => !m1IsExtracting && m1FileInputRef.current?.click()}
                  style={{
                    border: m1FileInfo ? '2px solid #10b981' : '2px dashed var(--border)',
                    background: m1IsExtracting ? 'var(--blue-light)' : m1FileInfo ? '#f0fdf4' : '#fafafa',
                    borderRadius:12, padding:'20px 16px', cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:12,
                    flexDirection:'column', minHeight:100, marginBottom:16, transition:'all .2s'
                  }}>
                  <input ref={m1FileInputRef} type="file" className="hidden" accept=".docx,.pdf"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) { setM1RawText(''); setM1FileInfo(null); await extractTextFromFile(file); }
                      e.target.value = '';
                    }} />
                  {m1IsExtracting ? (
                    <div className="ai-loading" style={{ border:'none', background:'transparent', padding:0 }}>
                      <div className="spinner" />
                      <span className="ai-loading-text">🤖 AI đang đọc và trích xuất nội dung tập…</span>
                    </div>
                  ) : m1FileInfo ? (
                    <div style={{ display:'flex', alignItems:'center', gap:12, width:'100%' }}>
                      <div style={{ fontSize:28 }}>{m1FileInfo.type.includes('pdf') ? '📄' : '📝'}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600, fontSize:13, color:'#15803d' }}>{m1FileInfo.name}</div>
                        <div style={{ fontSize:12, color:'#16a34a' }}>✅ Đã trích xuất thành công</div>
                      </div>
                      <button className="btn btn-ghost btn--icon" onClick={e => { e.stopPropagation(); setM1FileInfo(null); setM1RawText(''); }}>
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize:32 }}>📂</div>
                      <div style={{ textAlign:'center' }}>
                        <div style={{ fontWeight:600, fontSize:13, color:'var(--text-2)', marginBottom:4 }}>Tải lên file Word hoặc PDF</div>
                        <div style={{ fontSize:12, color:'var(--text-3)' }}>Hỗ trợ <strong>.docx</strong> và <strong>.pdf</strong> · AI sẽ tự đọc và trích xuất</div>
                      </div>
                      <span className="btn btn-primary btn--sm">↑ Chọn tệp</span>
                    </>
                  )}
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                  <div style={{ flex:1, height:1, background:'var(--border)' }} />
                  <span style={{ fontSize:12, color:'var(--text-3)', fontWeight:500 }}>hoặc dán văn bản thủ công</span>
                  <div style={{ flex:1, height:1, background:'var(--border)' }} />
                </div>

                <textarea className="input textarea"
                  placeholder={`Dán câu hỏi vào đây...\nVí dụ:\nCâu 1: Nguyên tử là gì?\nA. Hạt nhân nhỏ\nB. Khối cầu rắt\nĐáp án: B`}
                  value={m1RawText} onChange={e => setM1RawText(e.target.value)}
                  style={{ height:200 }} />
                {m1RawText.trim() && (
                  <div style={{ fontSize:12, color:'var(--text-3)', marginTop:6 }}>
                    {m1RawText.split('\n').filter(l => l.trim()).length} dòng · {m1RawText.length.toLocaleString()} ký tự
                  </div>
                )}

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:20, gap:12 }}>
                  <button className="btn btn-secondary" onClick={() => { setParsedQuestions([]); setStage('m1_edit'); }}>Nhập thủ công</button>
                  <button className="btn btn-primary"
                    onClick={parseM1QuestionsWithAI}
                    disabled={isLoading || m1IsExtracting || !m1RawText.trim()}>
                    {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                    Phân tích với AI
                  </button>
                </div>
              </div>
            </motion.div>
          )}


          {/* ═══ M2 BƯỜC 1: Nhập bài học ═══ */}
          {stage === 'm2_analyze' && (
            <motion.div key="m2_analyze" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              style={{ maxWidth:900, margin:'0 auto' }}>
              <div style={{ marginBottom:20 }}>
                <button className="btn btn-ghost btn--sm" style={{ marginBottom:10 }} onClick={reset}>
                  <ChevronRight size={14} style={{ transform:'rotate(180deg)' }} /> Trang chủ
                </button>
                <h2 style={{ fontSize:22, fontWeight:800, color:'var(--text)', marginBottom:4 }}>📚 Nhập nội dung bài học</h2>
                <p style={{ color:'var(--text-3)', fontSize:13 }}>Nhập văn bản hoặc tải ảnh, AI sẽ phân tích kiến thức chính.</p>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
                {/* Text input */}
                <div className="card" style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, fontWeight:600, fontSize:14, color:'var(--blue)' }}>
                    <FileText size={18} /> Nội dung văn bản
                  </div>
                  <textarea className="input textarea" style={{ flex:1, minHeight:220 }}
                    placeholder="Dán nội dung bài học tại đây..."
                    value={inputText} onChange={e => setInputText(e.target.value)} />
                </div>

                {/* Image upload */}
                <div className="card" style={{
                    border: selectedImage ? '2px solid var(--blue)' : '2px dashed var(--border)',
                    cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center',
                    justifyContent:'center', gap:12, minHeight:220, transition:'all .2s'
                  }}
                  onClick={() => fileInputRef.current?.click()}>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  {selectedImage ? (
                    <div style={{ position:'relative', width:'100%', display:'flex', justifyContent:'center' }}>
                      <img src={selectedImage} alt="Preview" style={{ maxHeight:200, borderRadius:8 }} />
                      <button onClick={e => { e.stopPropagation(); setSelectedImage(null); }}
                        style={{ position:'absolute', top:4, right:4, background:'white', border:'none', borderRadius:'50%', padding:4, cursor:'pointer', boxShadow:'var(--shadow-sm)' }}>
                        <RefreshCw size={13} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize:36 }}>🖼️</div>
                      <div style={{ textAlign:'center' }}>
                        <div style={{ fontWeight:600, fontSize:13, color:'var(--text-2)', marginBottom:4 }}>Tải lên hình ảnh</div>
                        <div style={{ fontSize:12, color:'var(--text-3)' }}>JPG, PNG, WEBP</div>
                      </div>
                      <span className="btn btn-secondary btn--sm">↑ Chọn ảnh</span>
                    </>
                  )}
                </div>
              </div>

              {isLoading && (
                <div className="ai-loading" style={{ marginBottom:16 }}>
                  <div className="spinner" />
                  <span className="ai-loading-text">🤖 AI đang phân tích nội dung bài học…</span>
                </div>
              )}

              <div style={{ display:'flex', justifyContent:'center' }}>
                <button className="btn btn-primary btn--lg"
                  onClick={runAnalysis}
                  disabled={isLoading || (!inputText && !selectedImage)}>
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : <ChevronRight size={18} />}
                  Phân tích bài học
                </button>
              </div>
            </motion.div>
          )}

          {/* M2_NEEDS: Teacher needs form */}
          {stage === 'm2_needs' && (
            <motion.div
              key="stage2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Analysis Result */}
              <div className="lg:col-span-1 space-y-6">
                <div className="glass-card p-6 rounded-3xl">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-500" size={20} />
                    📘 Bước 1: Thẻ kiến thức
                  </h3>
                  <div className="prose prose-slate prose-sm max-w-none">
                    <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {analysis || ''}
                    </Markdown>
                  </div>
                  <button
                    onClick={() => setStage('m2_analyze')}
                    className="mt-6 text-sm text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw size={14} /> Làm lại bước 1
                  </button>
                </div>
              </div>

              {/* Needs Form */}
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-card p-8 rounded-3xl space-y-8">
                  <h3 className="text-xl font-bold">🎯 Bước 2: Xác định nhu cầu</h3>
                  <p className="text-sm text-slate-500">Bạn muốn mình tạo câu hỏi như thế nào nhỉ? Hãy chọn các thẻ bên dưới nhé!</p>
                  {/* Question Types */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700">1. Dạng câu hỏi mong muốn? <span className="text-xs font-normal text-slate-400">(Tối đa 2)</span></label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {['Đúng / Sai', 'Trắc nghiệm khách quan', 'Trả lời ngắn', 'Điền khuyết', 'Kéo thả'].map(type => (
                        <button
                          key={type}
                          disabled={!needs.questionType.includes(type) && needs.questionType.length >= 2}
                          onClick={() => {
                            const newTypes = needs.questionType.includes(type)
                              ? needs.questionType.filter(t => t !== type)
                              : needs.questionType.length < 2 ? [...needs.questionType, type] : needs.questionType;
                            setNeeds({ ...needs, questionType: newTypes });
                          }}
                          className={cn(
                            "px-4 py-2 rounded-lg border text-sm transition-all text-left",
                            needs.questionType.includes(type)
                              ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-medium"
                              : !needs.questionType.includes(type) && needs.questionType.length >= 2
                                ? "border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50"
                                : "border-slate-200 hover:border-slate-300 text-slate-600"
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cognitive Level */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Sigma size={16} className="text-indigo-600" />
                      <label className="text-sm font-semibold text-slate-700">2. Mức độ nhận thức? (Có thể chọn nhiều)</label>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {['Nhận biết', 'Thông hiểu', 'Vận dụng'].map(level => {
                        const isSelected = needs.cognitiveLevel.includes(level);
                        const colors: Record<string, string> = {
                          'Nhận biết': isSelected ? 'bg-emerald-100 border-emerald-500 text-emerald-800 shadow-sm shadow-emerald-200' : 'bg-emerald-50/50 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300',
                          'Thông hiểu': isSelected ? 'bg-amber-100 border-amber-500 text-amber-800 shadow-sm shadow-amber-200' : 'bg-amber-50/50 border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300',
                          'Vận dụng': isSelected ? 'bg-rose-100 border-rose-500 text-rose-800 shadow-sm shadow-rose-200' : 'bg-rose-50/50 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300'
                        };
                        return (
                          <button
                            key={level}
                            onClick={() => {
                              const newLevels = isSelected
                                ? needs.cognitiveLevel.filter(l => l !== level)
                                : [...needs.cognitiveLevel, level];
                              setNeeds({ ...needs, cognitiveLevel: newLevels });
                            }}
                            className={cn(
                              "px-5 py-3 rounded-xl border-2 text-sm font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98]",
                              colors[level]
                            )}
                          >
                            {level}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Student Level */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700">3. Đối tượng học sinh?</label>
                    <div className="flex flex-wrap gap-3">
                      {['Yếu', 'Trung bình', 'Khá – Giỏi'].map(level => (
                        <button
                          key={level}
                          onClick={() => setNeeds({ ...needs, studentLevel: level })}
                          className={cn(
                            "px-4 py-2 rounded-lg border text-sm transition-all",
                            needs.studentLevel === level
                              ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-medium"
                              : "border-slate-200 hover:border-slate-300 text-slate-600"
                          )}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Purpose */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700">4. Mục đích sử dụng?</label>
                    <div className="flex flex-wrap gap-3">
                      {['Khởi động', 'Hình thành kiến thức', 'Luyện tập', 'Củng cố cuối bài', 'Kiểm tra nhanh'].map(p => (
                        <button
                          key={p}
                          onClick={() => setNeeds({ ...needs, purpose: p })}
                          className={cn(
                            "px-4 py-2 rounded-lg border text-sm transition-all",
                            needs.purpose === p
                              ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-medium"
                              : "border-slate-200 hover:border-slate-300 text-slate-600"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question Counts Matrix */}
                  {needs.questionType.length > 0 && needs.cognitiveLevel.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <HelpCircle size={16} className="text-indigo-600" />
                        <label className="text-sm font-semibold text-slate-700">5. Số lượng câu hỏi chi tiết</label>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                        {needs.questionType.map(type => (
                          <div key={type} className="space-y-2">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{type}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {needs.cognitiveLevel.map(level => {
                                const key = `${type}|${level}`;
                                return (
                                  <div key={level} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                                    <span className="text-xs text-slate-600">{level}</span>
                                    <input
                                      type="number"
                                      min="0"
                                      max="20"
                                      className="w-12 text-right text-sm font-bold text-indigo-600 outline-none"
                                      value={needs.counts[key] || 0}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        setNeeds({
                                          ...needs,
                                          counts: { ...needs.counts, [key]: val }
                                        });
                                      }}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={generateQuestionsAndActivities}
                      disabled={isLoading || needs.questionType.length === 0 || needs.cognitiveLevel.length === 0}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                      👉 Tiếp theo: Sinh câu hỏi & Hoạt động!
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* M1_EDIT & M2_QUESTIONS: Question editor + activities */}
          {(stage === 'm1_edit' || stage === 'm2_questions') && (
            <motion.div
              key="stage3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{stage === 'm1_edit' ? '✏️ Chỉnh sửa câu hỏi' : '🤖 Kết quả đồng hành cùng bạn'}</h2>
                  <p className="text-slate-500">{stage === 'm1_edit' ? 'Kiểm tra lại câu hỏi và chỉnh sửa nếu cần nhé.' : 'Mọi thứ đã sẵn sàng! Bạn có thể xem và chỉnh sửa nhé.'}</p>
                </div>
                <button
                  onClick={reset}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2"
                >
                  <RefreshCw size={16} /> Bắt đầu hành trình mới
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Questions */}
                <div className="glass-card p-8 rounded-3xl space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 to-violet-500 rounded-l-3xl"></div>
                  <div className="flex items-center gap-2 text-indigo-600 mb-6">
                    <HelpCircle size={24} />
                    <h3 className="text-xl font-bold">🎯 Bước 3: Chỉnh sửa Câu hỏi</h3>
                  </div>
                  
                  {parsedQuestions.length > 0 ? (
                    <div className="space-y-6">
                      {parsedQuestions.map((q, idx) => (
                        <div key={q.id} className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm relative group">
                          <button 
                            onClick={() => removeQuestion(q.id)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={16} />
                          </button>
                          
                          <div className="flex items-center gap-3 mb-3">
                            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded text-xs">Câu {idx + 1}</span>
                            <span className="text-xs text-slate-500">{q.type} - {q.level}</span>
                          </div>

                          <textarea
                            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-sm mb-3 font-medium"
                            value={q.content.replace(/!\[Hình \d+\]\([^)]+\)/g, '').trim()}
                            onChange={(e) => {
                              // Preserve image markdown when editing text
                              const imgParts = q.content.match(/!\[Hình \d+\]\([^)]+\)/g) || [];
                              const newContent = imgParts.length > 0 
                                ? e.target.value + '\n\n' + imgParts.join('\n\n')
                                : e.target.value;
                              handleQuestionChange(q.id, 'content', newContent);
                            }}
                            rows={3}
                            placeholder="Nội dung câu hỏi..."
                          />

                          {/* Hiển thị ảnh inline nếu câu hỏi có ảnh */}
                          {(() => {
                            const imgMatches = q.content.match(/!\[([^\]]*)\]\(([^)]+)\)/g);
                            if (!imgMatches || imgMatches.length === 0) return null;
                            return (
                              <div className="flex flex-wrap gap-2 mb-3 p-2 bg-blue-50 rounded-xl border border-blue-100">
                                {imgMatches.map((match: string, imgIdx: number) => {
                                  const srcMatch = match.match(/!\[([^\]]*)\]\(([^)]+)\)/);
                                  if (!srcMatch) return null;
                                  const [, alt, src] = srcMatch;
                                  return (
                                    <div key={imgIdx} className="relative group">
                                      <img 
                                        src={src} 
                                        alt={alt} 
                                        className="max-h-32 rounded-lg border border-blue-200 object-contain bg-white"
                                        style={{ maxWidth: 200 }}
                                      />
                                      <span className="absolute bottom-1 left-1 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-md font-medium">{alt || `Ảnh ${imgIdx + 1}`}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}

                          {q.options && q.options.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                              {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex flex-col gap-1 text-sm">
                                  <span className="text-xs text-slate-500 font-medium">Đáp án {['A', 'B', 'C', 'D'][oIdx]}</span>
                                  <input
                                    type="text"
                                    className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={opt}
                                    onChange={(e) => handleQuestionChange(q.id, 'options', e.target.value, oIdx)}
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Correct answer: select if has options, text input otherwise */}
                          {q.options && q.options.length > 0 ? (
                            <div className="flex items-center gap-2 text-sm mt-3 pt-3 border-t border-slate-100">
                              <span className="font-semibold text-emerald-600">Đáp án đúng:</span>
                              <select 
                                value={q.correctAnswer}
                                onChange={(e) => handleQuestionChange(q.id, 'correctAnswer', e.target.value)}
                                className="p-1.5 rounded-lg border border-slate-200 bg-emerald-50 text-emerald-700 outline-none"
                              >
                                {q.options.map((opt, oIdx) => (
                                  <option key={oIdx} value={['A', 'B', 'C', 'D'][oIdx]}>
                                    {['A', 'B', 'C', 'D'][oIdx]}: {opt}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm mt-3 pt-3 border-t border-slate-100">
                              <span className="font-semibold text-emerald-600 shrink-0">Đáp án đúng:</span>
                              <input
                                type="text"
                                className="flex-1 p-1.5 rounded-lg border border-slate-200 bg-emerald-50 text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-400"
                                placeholder="Nhập đáp án..."
                                value={q.correctAnswer || ''}
                                onChange={(e) => handleQuestionChange(q.id, 'correctAnswer', e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                      
                      <button 
                        onClick={addQuestion}
                        className="w-full py-3 border-2 border-dashed border-indigo-200 text-indigo-600 rounded-xl font-medium hover:bg-indigo-50 hover:border-indigo-400 transition-all"
                      >
                        + Thêm câu hỏi
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-slate-500">
                      Không thể trích xuất dưới dạng chỉnh sửa được. Hãy xem kết quả gốc bên dưới.
                      <div className="prose prose-indigo prose-sm mt-4 text-left">
                        <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {getQuestionsPart()}
                        </Markdown>
                      </div>
                    </div>
                  )}

                  {/* Game Launch Section */}
                  {parsedQuestions.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-indigo-100 space-y-3">
                      {/* Download Word — chỉ hiển thị ở Chế độ 2 */}
                      {stage === 'm2_questions' && (
                        <button
                          onClick={downloadAsWord}
                          className="w-full py-3 bg-white border-2 border-emerald-500 text-emerald-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 hover:shadow-md transition-all"
                        >
                          <Download size={20} />
                          Tải về file Word (.doc)
                        </button>
                      )}
                       <button
                         onClick={() => {
                            setStage(stage === 'm1_edit' ? 'm1_game' : 'm2_game');
                            setSelectedGameId(null);
                         }}
                         className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-300 hover:-translate-y-1 transition-all"
                       >
                         <Gamepad2 size={24} />
                         Lưu & Chơi thử Game
                       </button>
                    </div>
                  )}
                </div>

                {/* Activities — chỉ hiển thị ở Mode 2 (m2_questions) */}
                {stage === 'm2_questions' && (
                  <div className="glass-card p-8 rounded-3xl space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-emerald-500 to-teal-500 rounded-r-3xl"></div>
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Gamepad2 size={24} />
                      <h3 className="text-xl font-bold">🎮 Bước 4: Hoạt động học tập</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="prose prose-emerald prose-sm max-w-none bg-white/70 p-6 rounded-2xl border border-emerald-100 shadow-inner backdrop-blur-sm">
                        <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {getActivitiesPart()}
                        </Markdown>
                      </div>
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                        <AlertCircle className="text-amber-500 shrink-0" size={20} />
                        <p className="text-xs text-amber-800 leading-relaxed">
                          <strong>Lưu ý:</strong> Hãy luôn kiểm tra lại nội dung trước khi sử dụng trong lớp học để đảm bảo tính chính xác tuyệt đối.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══ GAME SELECTOR: m1_game / m2_game ═══ */}
          {(stage === 'm1_game' || stage === 'm2_game') && (
            <motion.div key="game" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="w-full">
              {!selectedGameId ? (
                <div style={{ maxWidth:1100, margin:'0 auto' }}>


                  {/* Game selector header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-primary font-label mb-1">🎮 TRÒ CHƠI TƯƠNG TÁC ONLINE</p>
                      <h2 className="font-headline text-2xl font-extrabold text-on-surface">Chọn trò chơi</h2>
                      <p className="text-on-surface-variant text-sm mt-1">
                        {stage === 'm1_game' ? 'Lọc theo dạng câu hỏi đã chọn.' : 'Chọn trò chơi phù hợp với bộ câu hỏi AI vừa tạo.'}
                      </p>
                    </div>
                    <button className="btn btn-secondary" onClick={() => setStage(stage === 'm1_game' ? 'm1_edit' : 'm2_questions')}>
                      <ChevronRight size={15} style={{ transform:'rotate(180deg)' }} /> Quay lại
                    </button>
                  </div>

                  {/* Cards grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {GAME_LIBRARY.filter(g => {
                      const activeTypes = stage === 'm1_game' ? m1QuestionTypes : [...new Set(parsedQuestions.map(q => q.type))];
                      return activeTypes.length === 0 || activeTypes.some(t => g.compatibleTypes.includes(t));
                    }).map((g, idx) => {
                      // Stitch-style vivid gradient palettes per card
                      const palettes = [
                        { from: '#a855f7', to: '#7c3aed', shadow: 'rgba(168,85,247,0.35)' },
                        { from: '#0ea5e9', to: '#0055c4', shadow: 'rgba(14,165,233,0.35)' },
                        { from: '#f59e0b', to: '#f97316', shadow: 'rgba(245,158,11,0.35)' },
                        { from: '#1a1a2e', to: '#374151', shadow: 'rgba(26,26,46,0.45)' },
                        { from: '#ec4899', to: '#f43f5e', shadow: 'rgba(244,114,182,0.35)' },
                        { from: '#10b981', to: '#059669', shadow: 'rgba(16,185,129,0.35)' },
                        { from: '#14b8a6', to: '#0891b2', shadow: 'rgba(20,184,166,0.35)' },
                        { from: '#ef4444', to: '#b91c1c', shadow: 'rgba(239,68,68,0.35)' },
                        { from: '#8b5cf6', to: '#6366f1', shadow: 'rgba(139,92,246,0.35)' },
                      ];
                      const pal = palettes[idx % palettes.length];
                      return (
                        <div
                          key={g.id}
                          className="group flex flex-col rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2"
                          style={{
                            background: 'var(--color-surface-container-lowest)',
                            boxShadow: '0 4px 24px rgba(0,85,196,0.07)',
                          }}
                          onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 40px ${pal.shadow}`}
                          onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(0,85,196,0.07)'}
                        >
                          {/* ── TOP: gradient banner with 3D icon ── */}
                          <div
                            className="relative flex items-center justify-between overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, ${pal.from} 0%, ${pal.to} 100%)`,
                              minHeight: 148,
                              padding: '16px 20px',
                            }}
                          >
                            {/* Glare blobs */}
                            <div style={{ position:'absolute', top:-30, right:-30, width:100, height:100, background:'rgba(255,255,255,0.15)', borderRadius:'50%', filter:'blur(14px)', pointerEvents:'none' }} />
                            <div style={{ position:'absolute', bottom:-20, left:10, width:70, height:70, background:'rgba(255,255,255,0.08)', borderRadius:'50%', filter:'blur(10px)', pointerEvents:'none' }} />

                            {/* 3D game icon image */}
                            <div
                              className="select-none group-hover:scale-115 group-hover:-rotate-6 group-hover:-translate-y-1 transition-all duration-300 ease-out"
                              style={{ zIndex: 2, filter: 'drop-shadow(0 14px 28px rgba(0,0,0,0.45)) drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
                            >
                              {g.icon3d ? (
                                <img
                                  src={g.icon3d}
                                  alt={g.name}
                                  style={{
                                    width: 110,
                                    height: 110,
                                    objectFit: 'contain',
                                    transform: 'rotate(-10deg)',
                                  }}
                                  onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.style.display = 'none';
                                    if (target.nextSibling) (target.nextSibling as HTMLElement).style.display = 'block';
                                  }}
                                />
                              ) : (
                                <span style={{ fontSize: 80, lineHeight: 1, display: 'block', transform: 'rotate(-10deg)' }}>{g.emoji}</span>
                              )}
                            </div>

                            {/* Game name chip — glassmorphism */}
                            <div
                              className="self-start ml-auto"
                              style={{
                                background: 'rgba(255,255,255,0.22)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                borderRadius: '0.85rem',
                                padding: '6px 14px',
                                border: '1px solid rgba(255,255,255,0.3)',
                                zIndex: 2,
                              }}
                            >
                              <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-headline)', lineHeight: 1.3, display: 'block', textAlign: 'right' }}>
                                {g.name}
                              </span>
                            </div>
                          </div>

                          {/* ── BOTTOM: info + CTA ── */}
                          <div className="flex flex-col gap-3 p-5 flex-1">
                            <p className="text-sm text-on-surface-variant leading-relaxed" style={{ margin: 0 }}>
                              {g.description}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {g.compatibleTypes.map(t => (
                                <span
                                  key={t}
                                  className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                                  style={{ background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface-variant)' }}
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                            <button
                              className="btn btn-primary btn--sm mt-auto"
                              style={{ width: '100%', justifyContent: 'center' }}
                              onClick={() => setSelectedGameId(g.id)}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>sports_esports</span>
                              Chọn trò chơi
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>

              ) : (
                <div className="w-full min-h-[600px]">
                  {/* ── Thanh đổi game (luôn hiển thị khi đang chơi) ── */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2 text-sm text-on-surface-variant font-medium">
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>sports_esports</span>
                      <span>Đang chơi: <strong className="text-on-surface">{GAME_LIBRARY.find(g => g.id === selectedGameId)?.name || selectedGameId}</strong></span>
                    </div>
                    <button
                      onClick={() => setSelectedGameId(null)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-semibold transition-all"
                      style={{ background: 'var(--color-primary-container)', color: 'var(--color-on-primary-container)' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>swap_horiz</span>
                      Đổi Game
                    </button>
                  </div>
                  {selectedGameId === 'default' && (
                    <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 text-white min-h-[500px] relative">
                      <button
                        onClick={() => setSelectedGameId(null)}
                        className="absolute top-4 left-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                      >
                        <ChevronRight size={16} className="rotate-180" /> Đổi Game
                      </button>
                      <div className="mt-8 h-full">
                        {parsedQuestions.length > 0 ? (
                          <GameComponent questions={parsedQuestions} />
                        ) : (
                          <div className="flex items-center justify-center h-full text-white/50">
                            Chưa có câu hỏi nào để hiển thị trong game.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {selectedGameId === 'vuot_ai' && (
                    <VuotAiTriThucGame 
                      initialQuestions={parsedQuestions.map(q => ({
                        ...q,
                        options: q.options || ['Đúng', 'Sai']
                      }))} 
                      onBack={() => setSelectedGameId(null)} 
                    />
                  )}
                  {selectedGameId === 'vua_tieng_viet' && (
                    <VuaTiengVietGame 
                      initialQuestions={parsedQuestions.map(q => {
                        let answer = q.correctAnswer || (q.options ? q.options[0] : 'ĐÁP ÁN');
                        if (['A', 'B', 'C', 'D'].includes(answer) && q.options) {
                           const idx = ['A', 'B', 'C', 'D'].indexOf(answer);
                           if (idx >= 0 && q.options[idx]) answer = q.options[idx];
                        }
                        return {
                          text: q.content, answer,
                          scrambled: answer
                            .replace(/\$\$?([^$]+)\$\$?/g, '$1')  // strip $...$ delimiters
                            .replace(/\\[a-zA-Z]+\s*/g, '')        // strip \commands
                            .replace(/[{}_^$\\]/g, '')             // strip LaTeX special chars
                            .split('').sort(() => Math.random() - 0.5).join('').toUpperCase(),
                          image: null
                        };
                      })} 
                      onBack={() => setSelectedGameId(null)} 
                    />
                  )}
                  {selectedGameId === 'san_kho_bau' && (
                    <SanKhoBauGame
                      initialQuestions={parsedQuestions}
                      onBack={() => setSelectedGameId(null)}
                    />
                  )}
                  {selectedGameId === 'buc_tranh_bi_an' && (
                    <BucTranhBiAnGame
                      initialQuestions={parsedQuestions}
                      onBack={() => setSelectedGameId(null)}
                    />
                  )}
                  {selectedGameId === 'ong_tim_chu' && (
                    <OngTimChuGame
                      initialQuestions={parsedQuestions}
                      onBack={() => setSelectedGameId(null)}
                    />
                  )}
                  {selectedGameId === 'tranh_tai_keo_co' && (
                    <TranhTaiKeoCoGame
                      initialQuestions={parsedQuestions}
                      onBack={() => setSelectedGameId(null)}
                    />
                  )}
                  {selectedGameId === 'cap_doi' && (
                    <CapDoiHoanHaoGame
                      initialQuestions={parsedQuestions}
                      onBack={() => setSelectedGameId(null)}
                    />
                  )}
                  {selectedGameId === 'thap_tri_tue' && (
                    <ThapTriTueGame
                      initialQuestions={parsedQuestions}
                      onBack={() => setSelectedGameId(null)}
                    />
                  )}
                  {selectedGameId === 'keo_co_kien_thuc' && (
                    <KeoCoKienThucGame
                      initialQuestions={parsedQuestions}
                      onBack={() => setSelectedGameId(null)}
                    />
                  )}
                  {selectedGameId === 'phong_thoat_hiem' && (
                    <PhongThoatHiemGame
                      initialQuestions={parsedQuestions}
                      onBack={() => setSelectedGameId(null)}
                    />
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Toast */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-red-600/95 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl flex items-start gap-3 z-[100] border border-red-500/50"
            >
              <AlertCircle size={24} className="shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-sm mb-1">Lỗi hệ thống</p>
                <p className="text-xs leading-relaxed opacity-90 break-words">{(() => {
                  const msg = error || '';
                  // Try to parse raw JSON error message
                  try {
                    const start = msg.indexOf('{');
                    if (start !== -1) {
                      const parsed = JSON.parse(msg.slice(start));
                      const code = parsed?.error?.code;
                      const details = parsed?.error?.details || [];
                      const retryInfo = details.find((d: any) => d['@type']?.includes('RetryInfo'));
                      const delay = retryInfo?.retryDelay ? parseInt(retryInfo.retryDelay) : null;
                      if (code === 429) return `⚠️ Đã vượt quá giới hạn API miễn phí.${delay ? ` Vui lòng chờ ${delay} giây rồi thử lại.` : ' Vui lòng thử lại sau.'}`;
                      if (code === 404) return '⚠️ Model AI không được hỗ trợ. Vào Cài đặt và chọn model khác.';
                      if (code === 401 || code === 403) return '⚠️ API Key không hợp lệ. Kiểm tra lại trong Cài đặt.';
                      if (code === 500 || code === 503) return '⚠️ Máy chủ Gemini đang gặp sự cố. Thử lại sau ít phút.';
                    }
                  } catch { /* not JSON, show as-is */ }
                  return msg;
                })()}</p>
              </div>
              <button onClick={() => setError(null)} className="p-1 hover:bg-white/20 rounded-lg transition-colors shrink-0">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Modal */}
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                      <Settings size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Cấu hình hệ thống</h2>
                      <p className="text-xs text-slate-500">Thiết lập API Key và Model AI</p>
                    </div>
                  </div>
                  {!isApiKeyRequired && (
                    <button
                      onClick={() => setIsSettingsOpen(false)}
                      className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>

                <div className="p-6 overflow-y-auto space-y-8 flex-1">

                  {/* API Key Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                      <KeyRound size={18} className="text-amber-500" />
                      <h3>Google Gemini API Key</h3>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 space-y-2">
                      <p>
                        Để sử dụng ứng dụng, bạn cần cung cấp API Key của Google Gemini.
                        Key của bạn được <strong>lưu trữ cục bộ trên trình duyệt</strong> và không lưu trên máy chủ của chúng tôi.
                      </p>
                      <p className="font-semibold mt-2">
                        👉 Lấy API key miễn phí tại: <br />
                        <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-1 mt-1">
                          aistudio.google.com/api-keys <ChevronRight size={14} />
                        </a>
                      </p>
                      <p className="font-semibold mt-2">
                        🎬 Xem hướng dẫn lấy API key tại: <br />
                        <a href="https://www.youtube.com/watch?v=Dd_HvfBLgrE" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline inline-flex items-center gap-1 mt-1">
                          youtube.com/watch?v=Dd_HvfBLgrE <ChevronRight size={14} />
                        </a>
                      </p>
                    </div>

                    <div>
                      <input
                        type="password"
                        placeholder="Nhập API Key bắt đầu bằng AIzaSy..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                      />
                      {isApiKeyRequired && !apiKey && (
                        <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                          <AlertCircle size={12} /> Bắt buộc phải có API Key để tiếp tục
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Model Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                      <BookOpen size={18} className="text-indigo-500" />
                      <h3>Lựa chọn Model AI</h3>
                    </div>

                    <p className="text-xs text-slate-500 mb-3">Hệ thống sẽ thử lại tự động với Model thay thế nếu có sự cố (VD: Lỗi Quota).</p>

                    <div className="grid gap-3">
                      {AI_MODELS.map(model => (
                        <button
                          key={model.id}
                          onClick={() => setSelectedModel(model.id)}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left group",
                            selectedModel === model.id
                              ? "border-indigo-500 bg-indigo-50/30"
                              : "border-slate-100 hover:border-indigo-200 hover:bg-slate-50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{model.icon}</span>
                            <div>
                              <p className={cn(
                                "font-bold",
                                selectedModel === model.id ? "text-indigo-700" : "text-slate-700"
                              )}>{model.name}</p>
                              <p className="text-xs text-slate-500 font-mono mt-0.5">{model.id}</p>
                            </div>
                          </div>
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center transition-all",
                            selectedModel === model.id ? "bg-indigo-600 text-white" : "border-2 border-slate-300"
                          )}>
                            {selectedModel === model.id && <CheckCircle2 size={12} />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-3">
                  {/* Key test result */}
                  {keyTestResult && (
                    <div className={`px-4 py-3 rounded-xl text-sm font-medium ${keyTestResult.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      {keyTestResult.msg}
                    </div>
                  )}
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => testApiKey(apiKey)}
                      disabled={isTestingKey || !apiKey || apiKey.length < 10}
                      className="px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {isTestingKey ? <Loader2 size={16} className="animate-spin" /> : <HelpCircle size={16} />}
                      Kiểm tra Key
                    </button>
                    <button
                      onClick={() => saveSettings(apiKey, selectedModel)}
                      disabled={!apiKey || apiKey.length < 10}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2"
                    >
                      <CheckCircle2 size={18} />
                      Lưu cấu hình
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer / Bottom Navigation */}
      <footer style={{ maxWidth:1400, margin:'0 auto', padding:'16px 16px', borderTop:'1px solid var(--border)', textAlign:'center', paddingBottom: '100px' }}>
        <p style={{ fontSize:12, color:'var(--text-3)' }}>© 2025 Trợ lí tạo trò chơi học tập · Powered by Gemini AI</p>
      </footer>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-[100] flex justify-around items-center px-4 py-1.5 bg-white/70 backdrop-blur-lg shadow-2xl rounded-t-xl pb-safe">
        {/* Home (Active) */}
        <button className="flex flex-col items-center justify-center bg-gradient-to-b from-primary to-primary-container text-white rounded-full p-2.5 scale-105 -translate-y-1 shadow-[0_8px_20px_rgba(0,85,196,0.3)] transition-all duration-300 ease-out border-none" onClick={reset}>
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>home</span>
          <span className="font-label font-bold text-[10px] mt-1">Home</span>
        </button>
        {/* Games */}
        <button className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-container-low rounded-full transition-transform active:scale-90 border-none bg-transparent" onClick={() => setStage('m1_type')}>
          <span className="material-symbols-outlined">sports_esports</span>
          <span className="font-label font-bold text-[10px] mt-1">Games</span>
        </button>
        {/* Settings */}
        <button className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-container-low rounded-full transition-transform active:scale-90 border-none bg-transparent" onClick={() => setIsSettingsOpen(true)}>
        <span className="material-symbols-outlined">settings</span>
          <span className="font-label font-bold text-[10px] mt-1">Settings</span>
        </button>
      </nav>

      {/* Retry Status Toast */}
      <AnimatePresence>
        {retryStatus && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] bg-amber-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold whitespace-nowrap"
          >
            <Loader2 size={18} className="animate-spin flex-shrink-0" />
            {retryStatus}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple Game Component integration
function GameComponent({ questions }: { questions: QuestionItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const currentQ = questions[currentIndex];

  const handleSelect = (idxStr: string) => {
    if (showAnswer) return;
    setSelectedOpt(idxStr);
    setShowAnswer(true);
    
    if (idxStr === currentQ.correctAnswer) {
      setScore(s => s + 10);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOpt(null);
      setShowAnswer(false);
    } else {
      setGameOver(true);
    }
  };

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-center space-y-6">
        <h2 className="text-5xl font-bold text-yellow-400">🎉 Hoàn Thành! 🎉</h2>
        <p className="text-3xl">Điểm của bạn: <span className="font-bold text-white text-5xl">{score}</span></p>
        <button 
          onClick={() => {
            setCurrentIndex(0);
            setScore(0);
            setGameOver(false);
            setSelectedOpt(null);
            setShowAnswer(false);
          }}
          className="px-8 py-3 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors"
        >
          Chơi lại
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex justify-between items-center mb-8">
        <div className="bg-white/20 px-4 py-2 rounded-full font-bold text-sm tracking-widest backdrop-blur-sm">
          CÂU {currentIndex + 1} / {questions.length}
        </div>
        <div className="bg-yellow-400/20 text-yellow-300 px-4 py-2 rounded-full font-bold text-sm tracking-widest backdrop-blur-sm">
          ⭐ ĐIỂM: {score}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <h3 className="text-2xl font-bold text-center leading-relaxed mb-8">
          <ContentRenderer content={currentQ.content} />
        </h3>

        {currentQ.options && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto w-full">
            {currentQ.options.map((opt, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              let btnClass = "bg-white/10 hover:bg-white/20 border-white/20";
              
              if (showAnswer) {
                if (letter === currentQ.correctAnswer) {
                  btnClass = "bg-emerald-500 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] z-10 scale-105";
                } else if (letter === selectedOpt) {
                  btnClass = "bg-red-500 border-red-400 opacity-80";
                } else {
                  btnClass = "bg-white/5 border-transparent opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(letter)}
                  className={cn(
                    "p-6 rounded-2xl border-2 text-left transition-all duration-300 backdrop-blur-sm",
                    btnClass
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center font-bold text-lg shrink-0 text-white">
                      {letter}
                    </span>
                    <span className="text-lg font-medium text-white">
                      <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{opt}</Markdown>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="h-20 flex items-center justify-end mt-8">
        {showAnswer && (
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-white text-indigo-900 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-50 shadow-xl"
          >
            {currentIndex < questions.length - 1 ? "Câu tiếp theo" : "Xem kết quả"} <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}

function StageIndicator({ currentStage }: { currentStage: AppStage }) {
  const m2Stages: { id: AppStage; label: string }[] = [
    { id: 'm2_analyze', label: 'Phân tích' },
    { id: 'm2_needs', label: 'Nhu cầu' },
    { id: 'm2_questions', label: 'Câu hỏi' },
    { id: 'm2_game', label: 'Chơi' },
  ];
  const m1Stages: { id: AppStage; label: string }[] = [
    { id: 'm1_type', label: 'Dạng' },
    { id: 'm1_input', label: 'Nhập' },
    { id: 'm1_edit', label: 'Kiểm tra' },
    { id: 'm1_game', label: 'Chơi' },
  ];
  const isM1 = currentStage.startsWith('m1');
  const isM2 = currentStage.startsWith('m2');
  if (!isM1 && !isM2) return null;

  const stages = isM1 ? m1Stages : m2Stages;
  const curIdx = stages.findIndex(s => s.id === currentStage);

  return (
    <div className="flex items-center gap-2">
      {stages.map((s, idx) => {
        const isCompleted = idx < curIdx;
        const isCurrent = idx === curIdx;
        return (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                isCompleted ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-slate-200 text-slate-500'
              )}>
                {isCompleted ? <CheckCircle2 size={14} /> : idx + 1}
              </div>
              <span className="hidden md:block text-[10px] text-slate-400 whitespace-nowrap">{s.label}</span>
            </div>
            {idx < stages.length - 1 && <div className={cn('w-8 h-0.5', isCompleted ? 'bg-emerald-400' : 'bg-slate-200')} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
