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
    
    // Clean the text from possible markdown code blocks
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // Attempt to parse JSON from the response
    try {
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", cleanedText);
    }

    return {
      title: "AI Generated Listing",
      description: cleanedText,
      tags: "Resale, Fashion",
      hashtags: "#poshmark #reseller"
    };
  } catch (error) {
    console.error("AI Service Error:", error);
    throw new Error("AI analysis failed. Make sure your API key is valid.");
  }
};

export const refineBlogContent = async (draftContent) => {
  if (IS_MOCK_MODE) {
    console.log("AI Service (Refine): Running in MOCK mode.");
    await new Promise(resolve => setTimeout(resolve, 1500));
    return draftContent + "\n\n### Why This Works (AI Analysis)\nBy focusing on consistent listing and leveraging automation, this reseller was able to scale without increasing their working hours. Posh Pal's AI listing generator ensures each item is SEO-optimized, while 24/7 sharing keeps listings at the top of search results. This combination is the 'secret sauce' for six-figure reselling.";
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Refine and expand this blog post draft for a reselling success blog. 
    Make it SEO-optimized, engaging, and professional. Use subheadings and bullet points where appropriate.
    Keep the Markdown formatting.
    
    Draft:
    ${draftContent}`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("AI Refine Error:", error);
    return draftContent;
  }
};

const simulateAI = async (image) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  const mocks = [
    {
      title: "Premium Patagonia Better Sweater 1/4 Zip - Men's M",
      description: "Authentic Patagonia Better Sweater in excellent condition. This versatile quarter-zip fleece offers a sweater-knit aesthetic with a warm fleece interior. Perfect for outdoor adventures or casual everyday wear.\n\nFeatures:\n- 100% recycled polyester fleece\n- Quarter-zip closure with wind flap\n- Left-chest pocket\n- Shape-holding micropolyester jersey trim",
      tags: "Patagonia, Outdoors, Fleece, Sustainable, Gorpcore",
      hashtags: "#patagonia #bettersweater #outdoors #hiking #fleece"
    },
    {
      title: "Lululemon Align High-Rise Pant 25\" - Black - Size 6",
      description: "Like new Lululemon Align leggings in classic black. Designed for Yoga and buttery-soft to the touch. These leggings feature Nulu™ fabric which is lightweight and sweat-wicking. Perfect for low-impact workouts or lounging.",
      tags: "Lululemon, Yoga, Leggings, Activewear, Athleisure",
      hashtags: "#lululemon #align #yoga #activewear #athleisure"
    },
    {
      title: "Vintage Levi's 501 Original Fit Jeans - 32x30",
      description: "Classic vintage Levi's 501 Original Fit jeans. These iconic straight-leg jeans feature the signature button fly and are made from durable non-stretch denim. Beautifully worn-in with a natural patina that only comes with age.",
      tags: "Levi's, Vintage, Denim, 501, Classic",
      hashtags: "#levis #vintage #denim #501 #classic"
    }
  ];
  return mocks[Math.floor(Math.random() * mocks.length)];
};
