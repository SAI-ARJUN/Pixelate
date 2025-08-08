// controllers/gemini.js

import { GoogleGenAI, Modality } from "@google/genai";
import userModel from "../models/userModel.js";

export const generateGeminiImage = async (req, res) => {
  try {
    const user = req.user;
    const { prompt } = req.body;

    if (!prompt) {
      return res.json({ success: false, message: "Prompt is required" });
    }

    if (user.creditBalance <= 0) {
      return res.json({
        success: false,
        message: "No Credit Balance",
        creditBalance: user.creditBalance
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.API, // store key in .env
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: prompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    let base64Image = null;

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        base64Image = part.inlineData.data;
        break;
      }
    }

    if (!base64Image) {
      return res.json({
        success: false,
        message: "No image data received from Gemini"
      });
    }

    const resultImage = `data:image/png;base64,${base64Image}`;

    // Deduct 1 credit
    user.creditBalance -= 1;
    await user.save();

    res.json({
      success: true,
      message: "Image Generated",
      creditBalance: user.creditBalance,
      resultImage,
    });

  } catch (error) {
    console.error("Gemini Image Generation Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

