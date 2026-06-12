import { GoogleGenerativeAI } from "@google/generative-ai";

// Use an environment variable for the API key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Mock mode if key is missing
const IS_MOCK_MODE = !API_KEY || API_KEY === 'dummy_key' || API_KEY.startsWith('your_');

export const generateListingFromImage = async (base64Image) => {
  if (IS_MOCK_MODE) {
    console.log("AI Service: Running in MOCK mode. Provide VITE_GEMINI_API_KEY for real analysis.");
    return simulateAI(base64Image);
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this image and create a professional Poshmark listing. 
    Return the result in JSON format with the following keys:
    - title: An optimized, catchy title (max 80 chars)
    - description: A detailed, persuasive description including features and potential flaws.
    - tags: 5 relevant style tags, comma separated.
    - hashtags: 5 relevant hashtags.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image.split(',')[1],
          mimeType: "image/jpeg",
        },
      },
    ]);

    const text = result.response.text();
    
    // Attempt to parse JSON from the response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", text);
    }

    return {
      title: "AI Generated Listing",
      description: text,
      tags: "Resale, Fashion",
      hashtags: "#poshmark #reseller"
    };
  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
};

const simulateAI = async (image) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return {
    title: "Premium Patagonia Better Sweater 1/4 Zip - Men's M",
    description: "Authentic Patagonia Better Sweater in excellent condition. This versatile quarter-zip fleece offers a sweater-knit aesthetic with a warm fleece interior. Perfect for outdoor adventures or casual everyday wear.\n\nFeatures:\n- 100% recycled polyester fleece\n- Quarter-zip closure with wind flap\n- Left-chest pocket\n- Shape-holding micropolyester jersey trim",
    tags: "Patagonia, Outdoors, Fleece, Sustainable, Gorpcore",
    hashtags: "#patagonia #bettersweater #outdoors #hiking #fleece"
  };
};
