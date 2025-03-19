import { useState, useEffect } from "react";
import redaxios from "redaxios";
import InputSection from "./InputSection";
import PostPreview from "./PostPreview";
import ApiKeyModal from "./ApiKeyModal";
import { useToast } from "@/components/ui/use-toast";
import Together from "together-ai";


const systemPrompt = `
"You are an AI writing assistant for SaaS startups, specializing in AI-driven content. Goal: Craft one bold, actionable LinkedIn post (<500 characters, sentences ≤8 words, line breaks, no hashtags) with a hook showcasing Experience, Expertise, Authority, or Trust for my offer: ‘I’ll build an AI system to monitor user engagement.’ Date: March 19, 2025.

Tone: Bold, confident, credible.
Structure: Start with an EEAT-based hook from the library (first 5 lines). Add credibility, 1-2 main points, and a CTA takeaway. Use 1/3/1 rhythm (alternate 1-sentence and 3+-sentence blocks).
Hook Library:
X Little Known [Something] Causing [Problem] (e.g., ‘5 Little Known AI Gaps Causing Churn’)
The Secret To [Something Desirable] (e.g., ‘The Secret To Scaling Easy’)
Posting More Doesn’t Mean Growth
One Post Daily Beats Spamming
Declarative: e.g., ‘Growth Isn’t Random’
Question: e.g., ‘Struggling To Scale?’
Controversial: e.g., ‘Tools Don’t Fix Growth’
Moment: e.g., ‘In 2025, AI Rules’
Vulnerable: e.g., ‘I’ve Seen SaaS Fail’
Insight: e.g., ‘Engagement Predicts Success’
Approach: Adapt hook to my expertise or offer. Highlight AI’s impact and scaling benefits. Keep it token-efficient.
Knowledge: Use 2025 SaaS/AI trends.
Output: One post, no instructions shown."
"`;
const PostGenerator = () => {
  const [post, setPost] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedApiKey = localStorage.getItem("togetherApiKey");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      setIsApiModalOpen(true);
    }
  }, []);

  const cleanPost = (text: string) => {
    // Strip any emojis, hashtags, or formatting just in case
    return text
      .replace(/#[^\s]+/g, "") // Remove hashtags
      .replace(/[\u{1F600}-\u{1F6FF}]/gu, "") // Remove emojis (Unicode range)
      .replace(/(\*\*|__|\*|_)/g, "") // Remove bold/italics markdown
      .trim();
  };

  const handleGenerate = async (
    prompt: string,
    topic: string,
    tone: string,
    length: string
  ) => {
    if (!apiKey) {
      setIsApiModalOpen(true);
      return;
    }

    setIsGenerating(true);

    const together = new Together({ apiKey });

    try {
      const response = await together.chat.completions.create({
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `User Input: ${prompt}` },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const cleanedPost = cleanPost(response.choices[0].message.content);
      setPost(cleanedPost);
    } catch (sdkError) {
      console.warn("SDK failed, falling back to HTTP with Redaxios:", sdkError);

      try {
        const fallbackResponse = await redaxios.post(
          "https://api.together.xyz/v1/chat/completions",
          {
            model: "mistralai/Mixtral-7B-Instruct-v0.3",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `User Input: ${prompt}` },
            ],
            max_tokens: 500,
            temperature: 0.7,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
          }
        );

        const cleanedPost = cleanPost(fallbackResponse.data.choices[0].message.content);
        setPost(cleanedPost);
      } catch (httpError) {
        console.error("Fallback HTTP request failed:", httpError);
        toast({
          title: "Error generating post",
          description: "Both SDK and HTTP failed. Check your API key or network.",
          variant: "destructive",
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("togetherApiKey", key);
    toast({
      title: "API key saved",
      description: "Your API key has been saved successfully.",
    });
  };

  return (
    <div className="flex flex-col lg:flex-row w-full gap-8">
      <div className="w-full lg:w-1/2 slide-up">
        <InputSection
          onGenerate={handleGenerate}
          onOpenApiSettings={() => setIsApiModalOpen(true)}
          isGenerating={isGenerating}
        />
      </div>
      <div className="w-full lg:w-1/2 slide-up" style={{ animationDelay: "100ms" }}>
        <PostPreview post={post} isLoading={isGenerating} />
      </div>
      <ApiKeyModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        onSave={handleSaveApiKey}
      />
    </div>
  );
};

export default PostGenerator;
