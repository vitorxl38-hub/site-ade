import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeBusinessPerformance(data: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Você é um consultor estratégico da APEX Inteligência Empresarial.
        Analise os seguintes dados financeiros e operacionais de um cliente e forneça insights estratégicos, sugestões de economia e oportunidades de crescimento.
        
        Dados: ${JSON.stringify(data)}
        
        Sua resposta deve ser em Markdown, com tom profissional, encorajador e prático. Foque no crescimento do lucro e organização contábil.
      `
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Não foi possível gerar a análise no momento. Por favor, tente novamente mais tarde.";
  }
}
