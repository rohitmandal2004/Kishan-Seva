import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X, Download } from 'lucide-react';
import { Button } from './button';
import { Card } from './card';

export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Log for debugging
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-bottom-5 fade-in duration-300">
      <Card className="p-4 bg-white border border-slate-200 shadow-2xl rounded-2xl max-w-sm w-full flex gap-4 items-start">
        <div className="shrink-0 pt-1">
          {needRefresh ? (
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <RefreshCw className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Download className="w-5 h-5" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h4 className="font-bold text-slate-900 text-sm mb-1">
            {needRefresh ? 'Update Available' : 'App Ready for Offline Use'}
          </h4>
          <p className="text-xs text-slate-500 mb-3 leading-relaxed">
            {needRefresh 
              ? 'A new version of Kishan Seva is available. Click reload to update.' 
              : 'The application has been cached locally. It will now work even if you lose internet connection.'}
          </p>
          
          <div className="flex items-center gap-2">
            {needRefresh && (
              <Button 
                onClick={() => updateServiceWorker(true)} 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-8 px-4 text-xs font-bold"
              >
                Reload App
              </Button>
            )}
            <Button 
              onClick={close} 
              variant="outline" 
              size="sm" 
              className="border-slate-200 text-slate-600 rounded-lg h-8 px-4 text-xs font-bold"
            >
              Close
            </Button>
          </div>
        </div>
        
        <button onClick={close} className="text-slate-400 hover:text-slate-600 absolute top-3 right-3 p-1">
          <X className="w-4 h-4" />
        </button>
      </Card>
    </div>
  );
}
