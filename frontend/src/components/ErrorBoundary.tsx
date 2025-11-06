import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { logger } from '../utils/logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * Error Boundary component to catch and handle React component errors
 * Prevents the entire app from crashing when a component error occurs
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    logger.error('Error caught by ErrorBoundary:', error);
    logger.error('Error info:', errorInfo);

    // Store error info in state
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send to error tracking service (e.g., Sentry, LogRocket)
    // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  handleReload = () => {
    // Clear error state and reload the page
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    // Clear error state and navigate home
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="flex justify-content-center align-items-center" style={{ minHeight: '100vh', padding: '2rem' }}>
          <Card
            className="shadow-6 border-round-xl"
            style={{ maxWidth: '600px', width: '100%' }}
          >
            <div className="text-center">
              {/* Error Icon */}
              <div className="inline-flex align-items-center justify-content-center bg-red-100 border-circle mb-4" 
                   style={{ width: '80px', height: '80px' }}>
                <i className="pi pi-exclamation-triangle text-4xl text-red-600"></i>
              </div>

              {/* Error Title */}
              <h2 className="text-3xl font-bold m-0 mb-3 text-red-600">
                Oops! Something went wrong
              </h2>

              {/* Error Description */}
              <p className="text-600 mb-4">
                We're sorry for the inconvenience. An unexpected error has occurred.
              </p>

              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="text-left mb-4 p-3 surface-100 border-round">
                  <p className="text-sm font-semibold mb-2 text-red-600">
                    Error Details (Development Only):
                  </p>
                  <pre className="text-xs overflow-auto" style={{ maxHeight: '200px' }}>
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-content-center">
                <Button
                  label="Go to Home"
                  icon="pi pi-home"
                  onClick={this.handleGoHome}
                  className="p-button-outlined"
                />
                <Button
                  label="Reload Page"
                  icon="pi pi-refresh"
                  onClick={this.handleReload}
                />
              </div>

              {/* Additional Help */}
              <p className="text-sm text-500 mt-4">
                If this problem persists, please contact support.
              </p>
            </div>
          </Card>
        </div>
      );
    }

    // Normally, just render children
    return this.props.children;
  }
}

export default ErrorBoundary;
