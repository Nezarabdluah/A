import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import VerificationPage from './pages/VerificationPage';
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';


// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}




function App() {
  return (
    <ErrorBoundary>
      <div style={{ padding: 20, background: 'red', color: 'white' }}>
        DEBUG: Router Removed - Testing Direct Mount
      </div>
      <AdminLogin />
    </ErrorBoundary>
  );
}

export default App;
