"use client";

import { Component, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
  renderFallback: (reset: () => void) => ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return this.props.renderFallback(this.handleReset);
  }
}

const CrashGlyph = () => (
  <svg className="app-crash-glyph" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3.2 22 20.5H2L12 3.2Z" />
    <path className="app-crash-glyph-mark" d="M11 9.5h2l-.3 5.6h-1.4L11 9.5Zm1 7.1a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z" />
  </svg>
);

type WindowCrashProps = {
  appName: string;
  onClose: () => void;
  onReopen: () => void;
};

export const WindowCrash = ({ appName, onClose, onReopen }: WindowCrashProps) => (
  <div className="window-crash" role="alert">
    <CrashGlyph />
    <p className="window-crash-title">{appName} quit unexpectedly.</p>
    <p className="window-crash-detail">The rest of the desktop is still running.</p>
    <div className="window-crash-actions">
      <button type="button" onClick={onClose} aria-label={`Close ${appName}`}>
        Close
      </button>
      <button
        type="button"
        className="window-crash-primary"
        onClick={onReopen}
        aria-label={`Reopen ${appName}`}
      >
        Reopen
      </button>
    </div>
  </div>
);

type WindowErrorBoundaryProps = Omit<WindowCrashProps, "onReopen"> & {
  children: ReactNode;
};

export const WindowErrorBoundary = ({ appName, onClose, children }: WindowErrorBoundaryProps) => {
  const renderWindowCrash = (reset: () => void) => (
    <WindowCrash appName={appName} onClose={onClose} onReopen={reset} />
  );
  return <ErrorBoundary renderFallback={renderWindowCrash}>{children}</ErrorBoundary>;
};

type WidgetErrorBoundaryProps = {
  name: string;
  className: string;
  children: ReactNode;
};

export const WidgetErrorBoundary = ({ name, className, children }: WidgetErrorBoundaryProps) => {
  const renderWidgetCrash = (reset: () => void) => (
    <section className={`${className} widget-crash`} role="alert" aria-label={`${name} widget`}>
      <CrashGlyph />
      <p>{name} couldn’t load.</p>
      <button type="button" onClick={reset} aria-label={`Try again to load the ${name} widget`}>
        Try again
      </button>
    </section>
  );
  return <ErrorBoundary renderFallback={renderWidgetCrash}>{children}</ErrorBoundary>;
};
