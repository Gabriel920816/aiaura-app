
import { GoogleGenAI, Type } from "@google/genai";

const getAIClient = () => {
  const key = process.env.API_KEY;
  if (!key) {
    console.error("Aura Error: API_KEY is missing. Please check your Netlify environment variables.");
  }
  return new GoogleGenAI({ apiKey: key as string });
};

// 简单的确定性种子生成器
const generateSeed = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

// 增强的重试逻辑，针对 429 错误进行指数级退避
const fetchWithRetry = async (fn: () => Promise<any>, retries = 3, delay = 3000) => {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error?.message || "";
    const isRateLimited = errorMsg.includes("429") || errorMsg.includes("quota") || error?.status === 429;
    
    if (retries > 0 && isRateLimited) {
      console.warn(`Aura API: Rate limited (429). Retrying in ${delay/1000}s...`);
      await new Promise(r => setTimeout(r, delay + Math.random() * 1000));
      return fetchWithRetry(fn, retries - 1, delay * 2.5);
    }
    throw error;
  }
};

export const getZodiacSign = (date: string) => {
  if (!date) return "Aries";
  const d = new Date(date);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return "Aries";
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return "Taurus";
  if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return "Gemini";
  if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return "Cancer";
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return "Leo";
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return "Virgo";
  if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return "Libra";
  if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return "Scorpio";
  if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return "Sagittarius";
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return "Capricorn";
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
};

export const generateHoroscope = async (sign: string, birthDate: string, forceRefresh = false) => {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `aura_horoscope_v7_${sign}_${today}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached && !forceRefresh) {
    return JSON.parse(cached);
  }

  const ai = getAIClient();
  const seed = generateSeed(`${sign}-${today}`);

  try {
    const response = await fetchWithRetry(async () => {
      // 统一使用 gemini-3-flash-preview 以获得更高的 RPM 限额
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Current Date: ${today}. 
        Subject: ${sign} zodiac.
        Task: Provide a sophisticated daily horoscope based on current astrological movements.
        Strictly use JSON format. 
        Theme summary must be exactly 1 word.`,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.2,
          seed: seed,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              prediction: { type: Type.STRING },
              luckyNumber: { type: Type.STRING },
              luckyColor: { type: Type.STRING },
              ratings: {
                type: Type.OBJECT,
                properties: {
                  love: { type: Type.NUMBER },
                  work: { type: Type.NUMBER },
                  health: { type: Type.NUMBER },
                  wealth: { type: Type.NUMBER }
                },
                required: ["love", "work", "health", "wealth"]
              }
            },
            required: ["summary", "prediction", "luckyNumber", "luckyColor", "ratings"]
          }
        }
      });
      
      const jsonContent = JSON.parse(res.text || '{}');
      const chunks = res.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = chunks
        .map(c => c.web)
        .filter((w): w is { title: string; uri: string } => !!(w && w.title && w.uri))
        .map(w => ({ title: w.title, uri: w.uri }));

      return { ...jsonContent, sources };
    });

    localStorage.setItem(cacheKey, JSON.stringify(response));
    return response;
  } catch (error) {
    console.error("Horoscope API Critical Failure:", error);
    // 即使完全失败，也要提供一个有意义的回退，而不是直接报错
    return { 
      summary: "Evolving",
      prediction: "The cosmic alignment today suggests a period of internal growth. Focus on your immediate surroundings and trust your instincts.", 
      luckyNumber: "11", 
      luckyColor: "Silver Grey",
      ratings: { love: 4, work: 3, health: 4, wealth: 3 },
      sources: []
    };
  }
};

export const processAssistantQuery = async (query: string, currentContext: any) => {
  const ai = getAIClient();
  try {
    return await fetchWithRetry(async () => {
      // 统一使用 gemini-3-flash-preview
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Identity: Aura AI. 
        Context: ${JSON.stringify(currentContext)}. 
        User Message: "${query}". 
        Response must be JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING },
              action: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["ADD_EVENT", "CHANGE_COUNTRY", "NONE"] },
                  data: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, date: { type: Type.STRING }, startTime: { type: Type.STRING }, endTime: { type: Type.STRING } } }
                },
                required: ["type"]
              }
            },
            required: ["reply", "action"]
          }
        }
      });
      return JSON.parse(response.text || '{}');
    });
  } catch (error) {
    console.error("Assistant Query Critical Failure:", error);
    return {
      reply: "I'm currently adjusting my cosmic sensors. Please try again in a moment.",
      action: { type: "NONE" }
    };
  }
};
