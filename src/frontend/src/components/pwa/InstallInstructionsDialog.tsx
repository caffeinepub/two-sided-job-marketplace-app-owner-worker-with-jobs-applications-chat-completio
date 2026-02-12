import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Smartphone, Monitor, Share2, MoreVertical, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard, getPlatform } from '../../utils/pwaInstall';

interface InstallInstructionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const APP_URL = 'https://cantering-7xu.caffeine.xyz';

export default function InstallInstructionsDialog({ open, onOpenChange }: InstallInstructionsDialogProps) {
  const [copied, setCopied] = useState(false);
  const platform = getPlatform();

  const handleCopy = async () => {
    const success = await copyToClipboard(APP_URL);
    if (success) {
      setCopied(true);
      toast.success('URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy URL');
    }
  };

  // Auto-select the appropriate tab based on platform
  const defaultTab = platform === 'ios' ? 'ios' : platform === 'android' ? 'android' : 'desktop';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Install JobConnect App</DialogTitle>
          <DialogDescription>
            Follow the instructions below to install JobConnect on your device
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* App URL with copy button */}
          <div className="space-y-2">
            <Label>App URL</Label>
            <div className="flex gap-2">
              <Input
                value={APP_URL}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Platform-specific instructions */}
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ios" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                iOS
              </TabsTrigger>
              <TabsTrigger value="android" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Android
              </TabsTrigger>
              <TabsTrigger value="desktop" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Desktop
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ios" className="space-y-4 mt-4">
              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  iPhone / iPad Instructions
                </h4>
                <ol className="space-y-3 text-sm list-decimal list-inside">
                  <li>Open <strong>Safari</strong> browser (not Chrome or other browsers)</li>
                  <li>Navigate to: <code className="bg-muted px-2 py-1 rounded text-xs">{APP_URL}</code></li>
                  <li>
                    Tap the <strong>Share</strong> button <Share2 className="inline h-4 w-4 mx-1" /> 
                    at the bottom of the screen
                  </li>
                  <li>
                    Scroll down and tap <strong>"Add to Home Screen"</strong> <Plus className="inline h-4 w-4 mx-1" />
                  </li>
                  <li>Tap <strong>"Add"</strong> in the top right corner</li>
                  <li>The JobConnect app icon will appear on your home screen</li>
                </ol>
                <p className="text-xs text-muted-foreground mt-3">
                  Note: This feature only works in Safari on iOS devices
                </p>
              </div>
            </TabsContent>

            <TabsContent value="android" className="space-y-4 mt-4">
              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  Android Instructions
                </h4>
                <ol className="space-y-3 text-sm list-decimal list-inside">
                  <li>Open <strong>Chrome</strong> browser</li>
                  <li>Navigate to: <code className="bg-muted px-2 py-1 rounded text-xs">{APP_URL}</code></li>
                  <li>
                    Tap the <strong>menu</strong> button <MoreVertical className="inline h-4 w-4 mx-1" /> 
                    (three dots) in the top right
                  </li>
                  <li>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></li>
                  <li>Confirm by tapping <strong>"Add"</strong> or <strong>"Install"</strong></li>
                  <li>The JobConnect app icon will appear on your home screen</li>
                </ol>
                <p className="text-xs text-muted-foreground mt-3">
                  Alternative: Look for an "Install" banner at the bottom of the page
                </p>
              </div>
            </TabsContent>

            <TabsContent value="desktop" className="space-y-4 mt-4">
              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  Desktop Instructions
                </h4>
                <ol className="space-y-3 text-sm list-decimal list-inside">
                  <li>Open <strong>Chrome</strong> or <strong>Edge</strong> browser</li>
                  <li>Navigate to: <code className="bg-muted px-2 py-1 rounded text-xs">{APP_URL}</code></li>
                  <li>
                    Look for an <strong>install icon</strong> <Plus className="inline h-4 w-4 mx-1" /> 
                    in the address bar (right side)
                  </li>
                  <li>Click the install icon and confirm</li>
                  <li>The app will open in its own window</li>
                </ol>
                <p className="text-xs text-muted-foreground mt-3">
                  Alternative: Click the menu (⋮) → "Install JobConnect" or "Apps" → "Install this site as an app"
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-semibold mb-2">Why install?</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Quick access from your home screen</li>
              <li>• Full-screen experience without browser UI</li>
              <li>• Works offline with cached data</li>
              <li>• Faster loading and better performance</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
