
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Linkedin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface PostPreviewProps {
  post: string;
  isLoading: boolean;
}

const PostPreview = ({ post, isLoading }: PostPreviewProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(post);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Your LinkedIn post has been copied to the clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually.",
        variant: "destructive",
      });
    }
  };

  const openLinkedIn = () => {
    const encodedPost = encodeURIComponent(post);
    window.open(`https://www.linkedin.com/post/new?postText=${encodedPost}`, "_blank");
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Your LinkedIn Post</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            disabled={!post || isLoading}
          >
            {copied ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            Copy
          </Button>
          <Button
            size="sm"
            onClick={openLinkedIn}
            disabled={!post || isLoading}
            className="flex items-center"
          >
            <Linkedin className="h-4 w-4 mr-2" />
            Post to LinkedIn
          </Button>
        </div>
      </div>

      <div className="relative rounded-lg border bg-card p-6 shadow-sm transition-all duration-200 min-h-[300px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 py-12">
            <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <p className="text-muted-foreground animate-pulse-soft">Crafting your post...</p>
          </div>
        ) : post ? (
          <div className="whitespace-pre-line">{post}</div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
            <p>Your generated post will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostPreview;
