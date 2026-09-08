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
    // No userFetch in production is a configuration error — never fabricate a
    // listing. Throw an honest error instead of returning canned mock data.
    throw new Error('AI service is not available right now. Please try again later.');
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