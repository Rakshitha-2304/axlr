import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="unauthorized-page">
      <Navbar />
      <div className="container text-center animate-fade-in flex-column align-center justify-center py-xl">
        <div className="warning-icon-wrapper animate-glow">
          <ShieldAlert size={48} />
        </div>
        <h1 className="mt-md">Access Restricted</h1>
        <p className="text-muted mt-sm max-w-md mx-auto">
          You do not have the authorization credentials required to access this service node. 
          Please contact your administrator if you believe this is in error.
        </p>
        <Link to="/dashboard" className="btn btn-primary mt-lg flex-row gap-xs">
          <ArrowLeft size={16} /> Return to Dashboard
        </Link>
      </div>

      <style>{`
        .unauthorized-page {
          min-height: 100vh;
        }
        .py-xl {
          padding-top: 5rem;
          padding-bottom: 5rem;
        }
        .warning-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--danger-glow);
          color: var(--danger);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .max-w-md {
          max-width: 450px;
        }
        .mx-auto {
          margin-left: auto;
          margin-right: auto;
        }
        .mt-md { margin-top: 1rem; }
        .mt-sm { margin-top: 0.75rem; }
        .mt-lg { margin-top: 1.5rem; }
      `}</style>
    </div>
  );
};

export default Unauthorized;
