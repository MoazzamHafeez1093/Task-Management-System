import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-100 p-4 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong.</h2>
          <p className="text-center mb-4">We apologize for the inconvenience. Please try refreshing the page.</p>
          {/* Optional: Display error details in development */}
          {process.env.NODE_ENV === 'development' && (
            <details className="text-sm text-red-600 dark:text-red-200 mt-4 p-2 bg-red-100 dark:bg-red-800 rounded w-full max-w-lg">
              <summary>Error Details</summary>
              <pre className="whitespace-pre-wrap break-all mt-2 text-xs">
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 