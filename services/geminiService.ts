import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }
  return new GoogleGenAI({ apiKey });
};

export const improveText = async (text: string, instruction: string): Promise<string> => {
  try {
    const ai = getAI();
    // Using gemini-2.5-flash for speed and efficiency on text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert Markdown editor helper. 
      
      Task: ${instruction}
      
      Input Text:
      """
      ${text}
      """
      
      Output ONLY the improved/modified markdown text. Do not add conversational filler.`,
    });
    
    return response.text || text;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw error;
  }
};

export const streamContinueWriting = async (
  currentContent: string, 
  onChunk: (text: string) => void
): Promise<void> => {
  try {
    const ai = getAI();
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: `You are a creative writing assistant. Continue the following markdown text naturally.
      
      Current Text:
      """
      ${currentContent}
      """
      
      Keep the style consistent. Return only the added text.`,
    });

    for await (const chunk of responseStream) {
       if (chunk.text) {
         onChunk(chunk.text);
       }
    }
  } catch (error) {
    console.error("Gemini Stream Error:", error);
    throw error;
  }
};
