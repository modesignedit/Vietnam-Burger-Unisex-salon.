import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong. Please refresh the page.";
      try {
        // Check if it's a Firestore error JSON
        const parsed = JSON.parse(this.state.error?.message || "");
        if (parsed.error) errorMessage = `Firestore Error: ${parsed.error}`;
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen bg-luxury-black flex items-center justify-center p-6 text-center">
          <div className="max-w-md p-8 border border-[#D4AF37]/30 bg-[#0A0A0A]">
            <h2 className="text-3xl font-serif text-[#D4AF37] mb-4">System Error</h2>
            <p className="text-[#F5F2ED]/70 mb-8 font-light">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-[#D4AF37] text-[#0A0A0A] px-8 py-3 rounded-none font-semibold uppercase tracking-widest transition-all duration-300 hover:bg-[#F9E2AF]"
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
