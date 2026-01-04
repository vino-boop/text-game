
import { GoogleGenAI } from "@google/genai";
import { Region } from "./types";

/**
 * Creates a fresh GoogleGenAI instance using the current environment's API key.
 * This ensures we always use the latest key selected by the user.
 */
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates an atmospheric narrative description based on the current game stage and player stats.
 */
export async function generateNarrative(stage: Region, lucidity: number, vocabulary: number): Promise<string> {
  const ai = getAI();
  const modelName = 'gemini-3-pro-preview';
  
  const systemInstruction = `
    你是一名正在剥蚀现实的古神之声，负责《褪色的余晖》这款黑暗风文字冒险游戏的叙事。
    当前处于：${stage}。
    
    规则：
    1. 根据“清晰度（Lucidity）”改变叙事风格。
       - 100-80: 描述客观、冷静、阴森但清晰。
       - 79-50: 描述开始出现大量比喻、逻辑漂移，感觉现实在扭曲。
       - 49-20: 极度疯狂，描述不再符合物理逻辑，充满感官干扰。
       - <20: 支离破碎，词汇堆砌，文字重叠，充满象征死亡的隐喻。
    2. 根据“词汇量（Vocabulary）”决定描述的完整度。当词汇量低于40时，句子中某些名词会被占位符替换。
    3. 背景是克苏鲁式的文字恐怖，不强调触手，强调逻辑的崩坏和“定义”的丢失。
    4. 每次生成的描述长度在150字以内。
    
    当前状态：
    清晰度: ${lucidity}
    词汇量: ${vocabulary}
  `;

  const prompt = `生成一段当前区域的探索描述，引导玩家继续深入废墟。`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.9,
      }
    });

    return response.text || "现实变得一片空白，你无法理解眼前的存在。";
  } catch (error) {
    console.error("Gemini narrative error:", error);
    return "由于逻辑崩落，描述已失效。";
  }
}

/**
 * Generates an eldritch enemy with a name and description using JSON response mode.
 */
export async function generateEnemyDescription(region: Region): Promise<{ name: string, description: string }> {
    const ai = getAI();
    const prompt = `为区域 ${region} 生成一个不可名状的敌人的名称和简短描述（100字内）。格式为 JSON: { "name": "...", "description": "..." }`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });
        // Correctly using .text property for string extraction
        const data = JSON.parse(response.text || "{}");
        return {
            name: data.name || "失真体",
            description: data.description || "一个正在剥离现实定义的块状物。"
        };
    } catch (error) {
        console.error("Gemini enemy generation error:", error);
        return { name: "无名者", description: "它没有定义，它甚至不存在于此。" };
    }
}
