
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

const ApiKeyModal = ({ isOpen, onClose, onSave }: ApiKeyModalProps) => {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError("API key is required");
      return;
    }
    
    onSave(apiKey);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Enter Together AI API Key</span>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Your API key is stored locally in your browser and never sent to our servers.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            placeholder="Enter your Together AI API key"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setError("");
            }}
            className="w-full"
            type="password"
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
          <div className="text-sm text-muted-foreground">
            <p>You can get your API key from the <a href="https://together.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Together AI</a> platform.</p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Key</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;
