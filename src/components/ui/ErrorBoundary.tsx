import { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCcw, Home } from 'lucide-react';
import { Button } from './button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-red-100 p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-10 h-10 text-red-500" />
            </div>
            
            <div>
              <h1 className="text-2xl font-black text-slate-900 mb-2">Module Crashed</h1>
              <p className="text-slate-500 text-sm">
                We encountered an unexpected error while loading this module. 
                Don't worry, your data is safely backed up.
              </p>
            </div>

            <div className="bg-slate-100 p-4 rounded-xl text-left overflow-hidden">
              <p className="text-xs font-mono text-slate-600 truncate">
                {this.state.error?.message || 'Unknown render error'}
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-6"
              >
                <RefreshCcw className="w-4 h-4 mr-2" /> Reload Application
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full rounded-xl py-6 border-slate-200"
              >
                <Home className="w-4 h-4 mr-2" /> Return to Homepage
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
