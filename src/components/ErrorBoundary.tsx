import React, { Component, ErrorInfo, ReactNode } from 'react';
import { track } from '../utils/analytics';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    track('client_error', { message: error.message, stack: error.stack?.slice(0, 500) });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-bv-cream/30 text-center px-4">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-bv-border max-w-md w-full">
            <h2 className="text-2xl font-display font-bold text-bv-dark mb-4">Something went wrong</h2>
            <p className="text-bv-muted mb-8 text-sm leading-relaxed">We encountered an unexpected error while loading this page. Please try refreshing to continue.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-bv-green text-white rounded-xl font-bold shadow-sm hover:bg-bv-green-light transition-colors w-full"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
