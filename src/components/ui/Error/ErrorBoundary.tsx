"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorCard } from "./ErrorCard";

interface ErrorBoundaryProps {
  children:  ReactNode;
  fallback?: ReactNode;
  onError?:  (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError:  boolean;
  error:     Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <ErrorCard
          title="Rendering error"
          message={this.state.error?.message}
          action={
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
            >
              Try again
            </button>
          }
        />
      );
    }

    return this.props.children;
  }
}
