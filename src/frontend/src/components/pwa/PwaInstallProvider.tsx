import React, { createContext, useState, useEffect, useCallback } from 'react';
import InstallInstructionsDialog from './InstallInstructionsDialog';
import { isStandalone } from '../../utils/pwaInstall';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PwaInstallContextValue {
  canPromptInstall: boolean;
  isInstalled: boolean;
  requestInstall: () => Promise<void>;
  openInstructions: () => void;
}

export const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);

export function PwaInstallProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed
    setIsInstalled(isStandalone());

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const requestInstall = useCallback(async () => {
    if (!deferredPrompt) {
      // No native prompt available, show instructions instead
      setShowInstructions(true);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
      // Fallback to instructions if prompt fails
      setShowInstructions(true);
    }
  }, [deferredPrompt]);

  const openInstructions = useCallback(() => {
    setShowInstructions(true);
  }, []);

  const value: PwaInstallContextValue = {
    canPromptInstall: !!deferredPrompt,
    isInstalled,
    requestInstall,
    openInstructions,
  };

  return (
    <PwaInstallContext.Provider value={value}>
      {children}
      <InstallInstructionsDialog
        open={showInstructions}
        onOpenChange={setShowInstructions}
      />
    </PwaInstallContext.Provider>
  );
}
