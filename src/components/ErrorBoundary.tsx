import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  compact?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('UI ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.compact) {
      return (
        <div
          role="alert"
          className="mx-auto max-w-6xl rounded-2xl border border-[#E8202A]/40 bg-[#1D2536] p-6 text-white"
        >
          <p className="font-mono text-xs tracking-[0.16em] text-[#FF7D84] uppercase">
            Module Recovery
          </p>
          <h3 className="mt-2 text-lg font-bold text-white">
            {this.props.fallbackTitle ?? 'This interactive module encountered an unexpected error.'}
          </h3>
          <p className="mt-1 text-sm text-slate-300">
            You can retry loading this section without interrupting the rest of the page.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="mt-4 inline-flex min-h-[40px] items-center rounded-xl bg-[#E8202A] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#C81922]"
          >
            Retry Module
          </button>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111722] px-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/12 bg-[#1D2536] p-8 text-center shadow-2xl">
          <p className="font-mono text-xs tracking-[0.16em] text-[#FF7D84] uppercase">
            Gollamudi Technology and Software
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">
            {this.props.fallbackTitle ?? 'Something went wrong while rendering the page'}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            An unexpected rendering issue occurred. Reload the page or retry to continue viewing the
            demonstration.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex min-h-[44px] items-center rounded-xl border border-white/15 bg-[#2F3A4F] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2F3A4F]/80"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex min-h-[44px] items-center rounded-xl bg-[#E8202A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#C81922]"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
