import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCreateIntegration } from "@/hooks/use-integrations";
import { Trash2, Loader2 } from "lucide-react";
import type { IconType } from "react-icons";

interface AppInfo {
  id: string;
  name: string;
  icon: IconType;
  color: string;
}

interface IntegrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  app: AppInfo | null;
  existingKey?: string;
}

export function IntegrationDialog({ isOpen, onClose, app, existingKey }: IntegrationDialogProps) {
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();
  const createIntegration = useCreateIntegration();

  // Reset form when dialog opens/closes or existingKey changes
  useEffect(() => {
    if (isOpen) {
      setApiKey(existingKey || "");
    }
  }, [isOpen, existingKey]);

  const handleSave = () => {
    if (!app) return;
    
    if (!apiKey.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid API Key.",
        variant: "destructive",
      });
      return;
    }

    createIntegration.mutate(
      {
        provider: app.id,
        apiKey: apiKey.trim(),
      },
      {
        onSuccess: () => {
          toast({
            title: "Updated Successfully",
            description: `Your ${app.name} integration has been updated.`,
          });
          onClose();
        },
        onError: (error) => {
          toast({
            title: "Connection Failed",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  if (!app) return null;

  const Icon = app.icon;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Set the dialog to be roughly half the window size for larger screens */}
      <DialogContent className="sm:max-w-[50vw] md:min-w-[600px] p-8 gap-8">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <div 
              className="p-3 rounded-xl shadow-sm border border-border/50 bg-white"
              style={{ color: app.color }}
            >
              <Icon size={32} />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold font-display tracking-tight">
                {existingKey ? `Update ${app.name} Status` : `Connect to ${app.name}`}
              </DialogTitle>
              <DialogDescription className="text-base mt-1">
                Enter your API key below to securely link your {app.name} workspace with Orcho.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2.5">
            <Label htmlFor="apiKey" className="text-sm font-semibold">
              {app.name} API Key
            </Label>
            <div className="relative">
              <Input
                id="apiKey"
                type="password"
                placeholder={`e.g. secret_${app.id}_12345...`}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono text-sm pl-4 pr-12 py-6 border-border bg-muted/30 focus-visible:bg-background transition-colors shadow-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSave();
                  }
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive transition-colors"
                onClick={() => setApiKey("")}
                title="Clear key"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Your key is encrypted and stored securely. You can revoke access at any time.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={createIntegration.isPending}
            className="w-full sm:w-auto px-6"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={createIntegration.isPending}
            className="w-full sm:w-auto px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            {createIntegration.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
