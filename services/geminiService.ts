import { GoogleGenAI, Modality } from "@google/genai";

// This is a placeholder for the API_KEY. In a real environment,
// this would be securely managed.
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  // In a production environment, you'd want to handle this more gracefully.
  // For this example, we'll throw an error to make it clear.
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = 'gemini-2.5-flash-image-preview';

export interface ImageState {
  base64: string;
  mimeType: string;
}
interface EditResult {
  newImage: ImageState | null;
  text: string | null;
}

export const editImage = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string,
  promptImages: ImageState[] = []
): Promise<EditResult> => {
  try {
    const parts: any[] = [
      {
        inlineData: {
          data: base64ImageData,
          mimeType: mimeType,
        },
      },
      {
        text: prompt,
      },
      ...promptImages.map(img => ({
        inlineData: {
          data: img.base64,
          mimeType: img.mimeType,
        },
      })),
    ];

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: parts,
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    let newImage: EditResult['newImage'] = null;
    let text: string | null = null;
    
    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          text = part.text;
        } else if (part.inlineData) {
          newImage = {
            base64: part.inlineData.data,
            mimeType: part.inlineData.mimeType,
          };
        }
      }
    } else {
        const safetyFeedback = response.promptFeedback;
        const blockReason = safetyFeedback?.blockReason;
        const safetyRatings = safetyFeedback?.safetyRatings?.map(r => `${r.category}: ${r.probability}`).join(', ');

        let errorMessage = "Image generation failed. The prompt might have been blocked.";
        if (blockReason) {
            errorMessage += ` Reason: ${blockReason}.`;
        }
        if (safetyRatings) {
             errorMessage += ` Details: ${safetyRatings}.`;
        }
        throw new Error(errorMessage);
    }

    return { newImage, text };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while contacting the Gemini API.");
  }
};
