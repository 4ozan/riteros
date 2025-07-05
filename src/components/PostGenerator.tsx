import { useState, useEffect } from "react";
import redaxios from "redaxios";
import InputSection from "./InputSection";
import PostPreview from "./PostPreview";
import ApiKeyModal from "./ApiKeyModal";
import { useToast } from "@/components/ui/use-toast";
import Together from "together-ai";


const systemPrompt = `
You are a top-tier ghostwriter writing action-driven content for all business professionals. Goal: Craft one bold, actionable LinkedIn post (~500 characters, sentences ≤8 words, line breaks, no hashtags) with a hook showcasing Experience, Expertise, Authority, or Trust for my offer: 'helping them build systems that work for them.'

Tone: Bold, confident, credible.

Structure: Start with a contrarian or value-driven hook (first 5 lines). Deliver immediate value via a short list (e.g., 2-3 universal benefits). Add credibility, 2-3 main points, and an actionable CTA (e.g., question or 'DM me'). Use 1/3/1 rhythm.

Hook Library:

X Little Known [Something] Causing [Problem]

The Secret To [Something Desirable]

Posting More Doesn't Mean Growth

One Post Daily Beats Spamming

Declarative: e.g., 'Success Isn't Random'

Question: e.g., 'Want To Stay productive?'

Controversial: e.g., 'You Don't Need [X]'

Moment: e.g., 'In 2025, Productive Rules'

Vulnerable: e.g., 'I've Felt Burnout Too'

Insight: e.g., 'Balance Drives Youth'

Approach: Use a hook that resonates universally (e.g., product analytics, product engagements). Share a mini-list of benefits for staying productive (good communication, good product ). Link to my offer's benefits (e.g., 'Builds systems'). End with a question or direct CTA.

Knowledge: Use 2025 wellness trends for businesses.`

function PostGenerator() {
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
}

export default PostGenerator;
