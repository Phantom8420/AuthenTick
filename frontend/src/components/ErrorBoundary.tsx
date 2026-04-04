import React, { ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl border border-red-100 bg-white p-8 text-center shadow-lg">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-slate-900">Something went wrong</h2>
            <p className="mb-8 text-sm text-slate-600">{this.state.error?.message ?? "Unexpected error"}</p>
            <button
              type="button"
              onClick={this.handleReset}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 font-bold text-white hover:bg-slate-800"
            >
              <RefreshCcw className="h-5 w-5" />
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
