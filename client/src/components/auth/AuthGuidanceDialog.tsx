import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, AlertTriangle, CheckCircle, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthGuidanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domain: string;
}

const AuthGuidanceDialog: React.FC<AuthGuidanceDialogProps> = ({
  open,
  onOpenChange,
  domain,
}) => {
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(domain);
    toast({
      title: "Domain copied",
      description: "The domain has been copied to your clipboard.",
    });
  };

  const openFirebaseConsole = () => {
    window.open("https://console.firebase.google.com/", "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-bg-card text-text-primary">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-5 w-5 text-accent-yellow" />
            Firebase Domain Authorization Required
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Your current domain needs to be added to Firebase authorized domains list.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Why am I seeing this?</h3>
            <p className="text-sm text-text-secondary">
              For security reasons, Firebase requires that all domains interacting with Firebase Authentication
              are explicitly authorized in your Firebase project settings.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Your current domain:</h3>
            <div className="flex items-center gap-2 bg-bg-dark p-2 rounded-md">
              <code className="text-accent-green flex-1">{domain}</code>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={copyToClipboard} 
                title="Copy domain"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">How to fix this:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-text-secondary">
              <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline">Firebase Console</a></li>
              <li>Select your project: <span className="font-mono text-accent-purple">sozayn-7c013</span></li>
              <li>Navigate to <span className="font-semibold">Authentication &gt; Settings &gt; Authorized domains</span></li> 
              <li>Click <span className="font-semibold">Add domain</span> and paste your domain: <span className="font-mono text-accent-green">{domain}</span></li>
              <li>Click <span className="font-semibold">Add</span> to save the change</li>
              <li>Return to this app and try signing in with Google again</li>
            </ol>
          </div>
          
          <div className="bg-bg-dark/50 p-4 rounded-md border border-border-color">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-accent-green mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-semibold">Pro Tip</h4>
                <p className="text-sm text-text-secondary">
                  You only need to do this once for each domain. After deployment, you'll also need to add your 
                  production domain (yourdomain.replit.app or your custom domain) to the authorized domains list.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
          >
            I'll do this later
          </Button>
          <Button 
            onClick={openFirebaseConsole}
            className="gap-2 bg-accent-blue hover:bg-accent-blue/90"
          >
            Open Firebase Console
            <ExternalLink className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AuthGuidanceDialog;