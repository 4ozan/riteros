
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Settings, RefreshCw } from "lucide-react";

interface InputSectionProps {
  onGenerate: (prompt: string, topic: string, tone: string, length: string) => void;
  onOpenApiSettings: () => void;
  isGenerating: boolean;
}

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "enthusiastic", label: "Enthusiastic" },
  { value: "formal", label: "Formal" },
  { value: "thought-leadership", label: "Thought Leadership" },
];

const lengthOptions = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
];

const InputSection = ({ onGenerate, onOpenApiSettings, isGenerating }: InputSectionProps) => {
  const [prompt, setPrompt] = useState("");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt, topic, tone, length);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Create LinkedIn Post</h2>
        <Button variant="outline" size="icon" onClick={onOpenApiSettings}>
          <Settings className="h-4 w-4" />
          <span className="sr-only">API Settings</span>
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="prompt">What do you want to write about?</Label>
          <Textarea
            id="prompt"
            placeholder="I want to share my thoughts on the future of artificial intelligence..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="h-32 resize-none"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="topic">Topic (optional)</Label>
          <Textarea
            id="topic"
            placeholder="AI, Career Development, Leadership..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="h-20 resize-none"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tone">Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger id="tone">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="length">Length</Label>
            <Select value={length} onValueChange={setLength}>
              <SelectTrigger id="length">
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent>
                {lengthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isGenerating || !prompt.trim()}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Post"
          )}
        </Button>
      </form>
    </div>
  );
};

export default InputSection;
