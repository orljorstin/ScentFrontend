import React, { useState, useEffect } from 'react';
import { X, Share, PlusSquare, Download } from 'lucide-react';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showIOSPrompt, setShowIOSPrompt] = useState(false);
    const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
            setIsInstalled(true);
            return;
        }

        // Android / Desktop (Chrome)
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowAndroidPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // iOS Detection
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        if (isIOS) {
            setShowIOSPrompt(true);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowAndroidPrompt(false);
        }
        setDeferredPrompt(null);
    };

    if (isInstalled) return null;

    if (showAndroidPrompt) {
        return (
            <div className="fixed bottom-4 left-4 right-4 bg-white p-4 rounded-xl shadow-xl border border-gray-100 z-50 animate-slide-up flex flex-col gap-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-[#1A1A1A]">Install App</h3>
                        <p className="text-sm text-gray-500">Install Scentsmiths for a better experience.</p>
                    </div>
                    <button onClick={() => setShowAndroidPrompt(false)} className="text-gray-400"><X size={20} /></button>
                </div>
                <button onClick={handleInstall} className="w-full bg-[#961E20] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2">
                    <Download size={18} /> Install Scentsmiths
                </button>
            </div>
        );
    }

    if (showIOSPrompt) {
        // Only show once per session or use local storage to dismiss for a while
        // For now, let's show a small banner that expands
        return (
            <IOSBanner />
        );
    }

    return null;
}

function IOSBanner() {
    const [dismissed, setDismissed] = useState(() => localStorage.getItem('ios_prompt_dismissed') === 'true');
    const [expanded, setExpanded] = useState(false);

    if (dismissed) return null;

    const dismiss = () => {
        setDismissed(true);
        localStorage.setItem('ios_prompt_dismissed', 'true');
    };

    if (expanded) {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-white p-6 rounded-t-2xl shadow-2xl z-50 animate-slide-up pb-10">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Install Scentsmiths</h3>
                    <button onClick={dismiss} className="text-gray-400"><X /></button>
                </div>
                <div className="space-y-4 text-sm text-gray-600">
                    <p>Install our app on your iPhone for quick access and a better experience.</p>
                    <div className="flex items-center gap-3">
                        <span className="bg-gray-100 p-2 rounded"><Share size={20} className="text-blue-500" /></span>
                        <span>1. Tap the <strong>Share</strong> button in Safari menu bar.</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="bg-gray-100 p-2 rounded"><PlusSquare size={20} className="text-gray-700" /></span>
                        <span>2. Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-20 left-4 right-4 bg-[#1A1A1A] text-white p-4 rounded-xl shadow-lg z-40 flex justify-between items-center gap-4">
            <div onClick={() => setExpanded(true)} className="flex-1 cursor-pointer">
                <p className="font-bold text-sm">Install App</p>
                <p className="text-xs text-gray-400">Tap to see instructions for iOS</p>
            </div>
            <button onClick={dismiss} className="text-gray-400"><X size={18} /></button>
        </div>
    );
}
