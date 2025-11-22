import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FlowerAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the Data-URL prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeFlowerImage = async (file: File): Promise<FlowerAnalysis> => {
  const imagePart = await fileToGenerativePart(file);

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      flowerName: {
        type: Type.STRING,
        description: "The common name of the flower identified in the image.",
      },
      geographicArea: {
        type: Type.STRING,
        description: "The primary geographic region or continent where this flower is natively most widespread.",
      },
      confidence: {
        type: Type.NUMBER,
        description: "A confidence score between 0 and 100 representing certainty.",
      },
    },
    required: ["flowerName", "geographicArea", "confidence"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
            imagePart,
            { text: "Analyze this image. Identify the flower species and its native geographic origin." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response text from Gemini");
    
    const data = JSON.parse(jsonText);

    return {
      fileName: file.name,
      flowerName: data.flowerName || "Unknown",
      geographicArea: data.geographicArea || "Unknown",
      confidence: data.confidence || 0,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};