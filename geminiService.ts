
import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  const key = process.env.API_KEY;
  if (!key) {
    console.error("Aura Error: API_KEY is missing. Please check your Netlify environment variables.");
  }
  return new GoogleGenAI({ apiKey: key as string });
};

const generateSeed = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

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

// 解析非 JSON 响应的辅助函数
const parseHoroscopeResponse = (text: string) => {
  const getVal = (regex: RegExp, fallback: string) => {
    const match = text.match(regex);
    return match ? match[1].trim() : fallback;
  };

  const getNum = (regex: RegExp, fallback: number) => {
    const val = getVal(regex, "");
    const parsed = parseInt(val);
    return isNaN(parsed) ? fallback : Math.min(5, Math.max(1, parsed));
  };

  return {
    summary: getVal(/SUMMARY:\s*(.*)/i, "Evolving"),
    prediction: getVal(/PREDICTION:\s*([\s\S]*?)(?=\n[A-Z_]+:|$)/i, "The cosmic energies are aligning in your favor today."),
    luckyNumber: getVal(/LUCKY_NUMBER:\s*(.*)/i, "7"),
    luckyColor: getVal(/LUCKY_COLOR:\s*(.*)/i, "Gold"),
    ratings: {
      love: getNum(/LOVE_RATING:\s*(.*)/i, 4),
      work: getNum(/WORK_RATING:\s*(.*)/i, 4),
      health: getNum(/HEALTH_RATING:\s*(.*)/i, 4),
      wealth: getNum(/WEALTH_RATING:\s*(.*)/i, 4),
    }
  };
};

export const generateHoroscope = async (sign: string, birthDate: string, forceRefresh = false) => {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `aura_horoscope_v8_${sign}_${today}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached && !forceRefresh) {
    return JSON.parse(cached);
  }

  const ai = getAIClient();
  const seed = generateSeed(`${sign}-${today}`);

  try {
    const responseData = await fetchWithRetry(async () => {
      // 开启搜索模式时，不能使用 JSON 模式
      const res = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Today is ${today}. Sign: ${sign}. 
        Provide a daily horoscope using REAL astronomical data for today.
        Respond exactly in this format:
        SUMMARY: [one word theme]
        PREDICTION: [2-3 sentences of actual astrological advice]
        LOVE_RATING: [1-5]
        WORK_RATING: [1-5]
        HEALTH_RATING: [1-5]
        WEALTH_RATING: [1-5]
        LUCKY_NUMBER: [number]
        LUCKY_COLOR: [color]`,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.3,
          seed: seed
        }
      });
      
      const rawText = res.text || "";
      const parsedData = parseHoroscopeResponse(rawText);
      
      const chunks = res.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = chunks
        .map(c => c.web)
        .filter((w): w is { title: string; uri: string } => !!(w && w.title && w.uri))
        .map(w => ({ title: w.title, uri: w.uri }));

      return { ...parsedData, sources };
    });

    localStorage.setItem(cacheKey, JSON.stringify(responseData));
    return responseData;
  } catch (error) {
    console.error("Horoscope API Critical Failure:", error);
    return { 
      summary: "Dynamic",
      prediction: "The stars suggest a day of balanced energy. Trust your intuition and move forward with confidence.", 
      luckyNumber: "8", 
      luckyColor: "Deep Blue",
      ratings: { love: 4, work: 4, health: 4, wealth: 4 },
      sources: []
    };
  }
};

export const processAssistantQuery = async (query: string, currentContext: any) => {
  const ai = getAIClient();
  try {
    return await fetchWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Identity: Aura AI. 
        Context: ${JSON.stringify(currentContext)}. 
        User Message: "${query}". 
        Response must be JSON.`,
        config: {
          responseMimeType: "application/json"
        }
      });
      return JSON.parse(response.text || '{}');
    });
  } catch (error) {
    return {
      reply: "I'm currently adjusting my cosmic sensors. Please try again in a moment.",
      action: { type: "NONE" }
    };
  }
};
