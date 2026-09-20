import { Component } from "react";
import { AlertTriangle } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Ridgeline UI error:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas px-4 text-center">
          <div className="rounded-full bg-rust-light p-3 text-rust">
            <AlertTriangle size={22} />
          </div>
          <p className="font-display text-lg font-semibold text-ink">Something went wrong</p>
          <p className="max-w-sm text-sm text-ink/60">
            This screen ran into an unexpected error. Reloading usually fixes it.
          </p>
          <button onClick={this.handleReset} className="btn-primary mt-2">
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
