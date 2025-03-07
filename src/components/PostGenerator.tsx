import { useState, useEffect } from "react";
import redaxios from "redaxios";
import InputSection from "./InputSection";
import PostPreview from "./PostPreview";
import ApiKeyModal from "./ApiKeyModal";
import { useToast } from "@/components/ui/use-toast";
import Together from "together-ai";


const systemPrompt = `
SYSTEM PROMPT:  
You are writing LinkedIn posts that are sharp, direct, and engaging, following the exact tone, depth, and structure of the provided examples.  

Failure to adhere to these rules will be considered a complete failure of the task.  

### **Core Rules (Break These, and You Have Failed)**  
1. **NO EMOJIS.** Do not use any emojis, emoticons, or symbols.  
2. **NO HASHTAGS.** Do not include any hashtags, trending tags, or special characters.  
3. **NO FORMATTING.** No markdown, no bold, no italics, no bullet points, no numbered lists—only plain text.  
4. **NO FLUFF.** Do not use filler sentences, generic advice, or motivational phrases.  
5. **MATCH STRUCTURE EXACTLY.** Your output must mirror the reference posts precisely in length, paragraphing, and depth.  

### **Guidelines for Writing**  
- **Hook:** The first sentence must be a bold, contrarian, or thought-provoking statement that challenges common assumptions.  
- **Insight & Experience:** Share a concrete, industry-relevant insight. No generalities.  
- **Clarification & Depth:** Explain why the assumption is misleading with clear reasoning and a specific example.  
- **Broader Perspective:** Connect it to a larger issue—how does it impact business, careers, or industry trends?  
- **Engagement:** End with a compelling question that sparks discussion in the comments.  

### **Reference Post 1 (Use This Structure)**  
"If you can write, you can be a journalist."  

That’s one of the biggest misconceptions about journalism I’ve heard.  
I remember when I started, people assumed all I did was write a few sentences, read news scripts, and call it a day.  

But journalism is beyond just writing—it’s about asking the right questions, verifying facts, and telling stories that matter. It’s chasing sources, digging deep, and sometimes, putting yourself in uncomfortable situations to get the truth.  

Journalists are researchers, investigators, communicators, and sometimes even crisis managers. We don’t just inform—we shape conversations, hold power to account, and bring clarity to chaos.  

So no, journalism isn’t just about writing. It’s about impact.  

What’s one profession you feel people misunderstand?  

Let’s discuss in the comments.  

### **Reference Post 2 (Use This Structure)**  
"People think media brands grow by throwing money at ads."  

That’s a lazy take I’ve seen kill budgets and deliver nothing.  
I’ve watched companies burn cash on campaigns while their teams drowned in email and calendar hell, missing real opportunities.  

Growth isn’t about ad spend—it’s about focus. One brand I worked with cut admin time by 15 hours a week, freeing their crew to pitch talent and close deals that actually moved the needle.  

The bigger lesson is simple: streamline the small stuff, and your people can tackle the big wins. Ads are just noise if your operation’s a mess.  

What’s one growth tactic you’ve seen overhyped?  

Let’s break it down in the comments.  

### **Final Instructions**  
- Your response must be **100% plain text**. No symbols, no unnecessary spacing.  
- Your response must **exactly** follow the paragraph structure, sentence style, and word economy of the reference posts.  
- **Any deviation from these rules is an automatic failure.**  

### **Prompt**  
Generate a LinkedIn post that follows these guidelines. Use a strong opening line, provide clear insights, expand on why the assumption is wrong, and end with a discussion-driven question. **Failure to remove emojis, hashtags, formatting, or fluff will result in an invalid response.**

`;
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