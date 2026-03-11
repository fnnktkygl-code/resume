import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    try {
      localStorage.removeItem('resume-builder-data');
      localStorage.removeItem('resume-builder-theme');
      localStorage.removeItem('resume-builder-layout');
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Inter Variable', 'Inter', system-ui, sans-serif",
          background: '#F7F6F3',
          padding: '24px',
        }}>
          <div style={{
            maxWidth: '480px',
            textAlign: 'center',
            background: '#fff',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1A1917', marginBottom: '8px' }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: '14px', color: '#6B6860', marginBottom: '24px', lineHeight: 1.5 }}>
              An unexpected error occurred. You can try resetting the app data to recover.
              Your browser may have stored corrupted data.
            </p>
            <button
              onClick={this.handleReset}
              style={{
                padding: '12px 24px',
                background: '#1B6B3A',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reset & Reload
            </button>
            <details style={{ marginTop: '20px', textAlign: 'left', fontSize: '12px', color: '#9C9889' }}>
              <summary style={{ cursor: 'pointer' }}>Error details</summary>
              <pre style={{ whiteSpace: 'pre-wrap', marginTop: '8px', background: '#F0EFEB', padding: '8px', borderRadius: '6px' }}>
                {this.state.error?.message || 'Unknown error'}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
