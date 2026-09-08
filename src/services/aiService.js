export const generateListingFromImages = async (base64Images, userFetch) => {
  try {
    // If userFetch is provided, use the backend API (recommended)
    if (userFetch) {
      const response = await userFetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: base64Images })
      });
      if (!response.ok) {
        let errMsg = 'Failed to analyze images';
        try {
          const err = await response.json();
          errMsg = err.error || errMsg;
        } catch (e) {
          // body may be HTML/plain text — never let a JSON-parse failure mask it
          try {
            const text = await response.text();
            if (text) errMsg = text.slice(0, 200) || errMsg;
          } catch (e2) { /* keep default */ }
        }
        throw new Error(errMsg);
      }
      try {
        return await response.json();
      } catch (e) {
        const text = await response.text();
        throw new Error(text ? text.slice(0, 200) : 'Failed to analyze images. Please try again.');
      }
    }
    // Fallback to local simulation if no userFetch (should not happen in production)
    console.warn("AI Service: userFetch not provided. Falling back to simulation.");
    return simulateMultiPhotoAI(base64Images);
  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
};

export const refineBlogContent = async (draftContent) => {
  // Simple simulation for blog refinement
  await new Promise(resolve => setTimeout(resolve, 1500));
  return draftContent + "\n\n### Why This Works (AI Analysis)\nBy focusing on consistent listing and leveraging automation, this reseller was able to scale without increasing their working hours. Posh Pal's AI listing generator ensures each item is SEO-optimized, while 24/7 sharing keeps listings at the top of search results. This combination is the 'secret sauce' for six-figure reselling.";
};

const simulateMultiPhotoAI = async (images) => {
  await new Promise(resolve => setTimeout(resolve, 1000 * images.length));
  const mocks = [
    {
      title: "Premium Patagonia Better Sweater 1/4 Zip - Men's M",
      description: "Authentic Patagonia Better Sweater in excellent condition. Multi-photo analysis confirmed high quality and zero flaws.",
      tags: "Patagonia, Outdoors, Fleece, Sustainable, Gorpcore",
      hashtags: "#patagonia #bettersweater #outdoors #hiking #fleece"
    },
    {
      title: "Lululemon Align High-Rise Pant 25\" - Black - Size 6",
      description: "Like new Lululemon Align leggings in classic black. Analysis of all angles confirms authenticity and perfect stitching.",
      tags: "Lululemon, Yoga, Leggings, Activewear, Athleisure",
      hashtags: "#lululemon #align #yoga #activewear #athleisure"
    }
  ];
  return mocks[Math.floor(Math.random() * mocks.length)];
};