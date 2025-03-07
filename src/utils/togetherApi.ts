
interface GeneratePostParams {
  prompt: string;
  apiKey: string;
  topic?: string;
  tone?: string;
  length?: string;
}

export const generateLinkedInPost = async ({
  prompt,
  apiKey,
  topic = "",
  tone = "professional",
  length = "medium",
}: GeneratePostParams): Promise<string> => {
  try {
    const systemPrompt = `You are a professional LinkedIn post writer. 
    Create a high-quality, engaging LinkedIn post${topic ? ` about ${topic}` : ""} 
    with a ${tone} tone that is ${length} in length.
    The post should be well-structured with appropriate line breaks, 
    include hashtags if relevant, and be ready to copy-paste into LinkedIn.
    Only return the post content, nothing else.`;

    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.3",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to generate post");
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Failed to generate content";
  } catch (error) {
    console.error("Error generating LinkedIn post:", error);
    throw error;
  }
};
