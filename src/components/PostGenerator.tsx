
import { useState, useEffect } from "react";
import InputSection from "./InputSection";
import PostPreview from "./PostPreview";
import ApiKeyModal from "./ApiKeyModal";
import { generateLinkedInPost } from "@/utils/togetherApi";
import { useToast } from "@/components/ui/use-toast";

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
    try {
      const generatedPost = await generateLinkedInPost({
        prompt,
        apiKey,
        topic,
        tone,
        length,
      });
      setPost(generatedPost);
    } catch (error) {
      console.error("Error generating post:", error);
      toast({
        title: "Error generating post",
        description: "Please check your API key and try again.",
        variant: "destructive",
      });
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
